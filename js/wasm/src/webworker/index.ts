/// <reference lib="webworker" />
/* eslint-env worker */

import type { PyodideInterface } from "pyodide";
import type { PyProxy } from "pyodide/ffi";
import type {
	InMessage,
	InMessageInitEnv,
	InMessageInitApp,
	OutMessage,
	ReplyMessageError,
	ReplyMessageSuccess
} from "../message-types";
import {
	writeFileWithParents,
	renameWithParents,
	getAppHomeDir,
	resolveAppHomeBasedPath
} from "./file";
import { verifyRequirements } from "./requirements";
import { makeAsgiRequest } from "./asgi";
import { generateRandomString } from "./random";
import scriptRunnerPySource from "./py/script_runner.py?raw";
import unloadModulesPySource from "./py/unload_modules.py?raw";

importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

type MessageTransceiver = DedicatedWorkerGlobalScope | MessagePort;

let pyodide: PyodideInterface;
let micropip: PyProxy;

let call_asgi_app_from_js: (
	appId: string,
	scope: unknown,
	receive: () => Promise<unknown>,
	send: (event: any) => Promise<void>
) => Promise<void>;
let run_code: (
	appId: string,
	home_dir: string,
	code: string,
	path?: string
) => Promise<void>;
let run_script: (
	appId: string,
	home_dir: string,
	path: string
) => Promise<void>;
let unload_local_modules: (target_dir_path?: string) => void;

async function initializeEnvironment(
	options: InMessageInitEnv["data"],
	updateProgress: (log: string) => void
): Promise<void> {
	console.debug("Loading Pyodide.");
	updateProgress("Loading Pyodide");
	pyodide = await loadPyodide({
		stdout: console.debug,
		stderr: console.error
	});
	console.debug("Pyodide is loaded.");

	console.debug("Loading micropip");
	updateProgress("Loading micropip");
	await pyodide.loadPackage("micropip");
	micropip = pyodide.pyimport("micropip");
	console.debug("micropip is loaded.");

	const gradioWheelUrls = [
		options.gradioWheelUrl,
		options.gradioClientWheelUrl
	];
	console.debug("Loading Gradio wheels.", gradioWheelUrls);
	updateProgress("Loading Gradio wheels");
	await micropip.add_mock_package("ffmpy", "0.3.0");
	await pyodide.loadPackage(["ssl", "setuptools"]);
	await micropip.install(["typing-extensions>=4.8.0"]); // Typing extensions needs to be installed first otherwise the versions from the pyodide lockfile is used which is incompatible with the latest fastapi.
	await micropip.install(["markdown-it-py[linkify]~=2.2.0"]); // On 3rd June 2023, markdown-it-py 3.0.0 has been released. The `gradio` package depends on its `>=2.0.0` version so its 3.x will be resolved. However, it conflicts with `mdit-py-plugins`'s dependency `markdown-it-py >=1.0.0,<3.0.0` and micropip currently can't resolve it. So we explicitly install the compatible version of the library here.
	await micropip.install(["anyio==3.*"]); // `fastapi` depends on `anyio>=3.4.0,<5` so its 4.* can be installed, but it conflicts with the anyio version `httpx` depends on, `==3.*`. Seems like micropip can't resolve it for now, so we explicitly install the compatible version of the library here.
	await micropip.add_mock_package("pydantic", "2.4.2"); // PydanticV2 is not supported on Pyodide yet. Mock it here for installing the `gradio` package to pass the version check. Then, install PydanticV1 below.
	await micropip.install.callKwargs(gradioWheelUrls, {
		keep_going: true
	});
	await micropip.remove_mock_package("pydantic");
	await micropip.install(["pydantic==1.*"]); // Pydantic is necessary for `gradio` to run, so install v1 here as a fallback. Some tricks has been introduced in `gradio/data_classes.py` to make it work with v1.
	console.debug("Gradio wheels are loaded.");

	console.debug("Mocking os module methods.");
	updateProgress("Mock os module methods");
	// `os.link` is used in `aiofiles` (https://github.com/Tinche/aiofiles/blob/v23.1.0/src/aiofiles/os.py#L31),
	// which is imported from `gradio.ranged_response` (https://github.com/gradio-app/gradio/blob/v3.32.0/gradio/ranged_response.py#L12).
	// However, it's not available on Wasm.
	await pyodide.runPythonAsync(`
import os

os.link = lambda src, dst: None
`);
	console.debug("os module methods are mocked.");

	console.debug("Importing gradio package.");
	updateProgress("Importing gradio package");
	// Importing the gradio package takes a long time, so we do it separately.
	// This is necessary for accurate performance profiling.
	await pyodide.runPythonAsync(`import gradio`);
	console.debug("gradio package is imported.");

	console.debug("Defining a ASGI wrapper function.");
	updateProgress("Defining a ASGI wrapper function");
	// TODO: Unlike Streamlit, user's code is executed in the global scope,
	//       so we should not define this function in the global scope.
	await pyodide.runPythonAsync(`
# Based on Shiny's App.call_pyodide().
# https://github.com/rstudio/py-shiny/blob/v0.3.3/shiny/_app.py#L224-L258
async def _call_asgi_app_from_js(app_id, scope, receive, send):
	# TODO: Pretty sure there are objects that need to be destroy()'d here?
	scope = scope.to_py()

	# ASGI requires some values to be byte strings, not character strings. Those are
	# not that easy to create in JavaScript, so we let the JS side pass us strings
	# and we convert them to bytes here.
	if "headers" in scope:
			# JS doesn't have \`bytes\` so we pass as strings and convert here
			scope["headers"] = [
					[value.encode("latin-1") for value in header]
					for header in scope["headers"]
			]
	if "query_string" in scope and scope["query_string"]:
			scope["query_string"] = scope["query_string"].encode("latin-1")
	if "raw_path" in scope and scope["raw_path"]:
			scope["raw_path"] = scope["raw_path"].encode("latin-1")

	async def rcv():
			event = await receive()
			return event.to_py()

	async def snd(event):
			await send(event)

	app = gradio.wasm_utils.get_registered_app(app_id)
	if app is None:
		raise RuntimeError("Gradio app has not been launched.")

	await app(scope, rcv, snd)
`);
	call_asgi_app_from_js = pyodide.globals.get("_call_asgi_app_from_js");
	console.debug("The ASGI wrapper function is defined.");

	console.debug("Mocking async libraries.");
	updateProgress("Mocking async libraries");
	// FastAPI uses `anyio.to_thread.run_sync` internally which, however, doesn't work in Wasm environments where the `threading` module is not supported.
	// So we mock `anyio.to_thread.run_sync` here not to use threads.
	await pyodide.runPythonAsync(`
async def mocked_anyio_to_thread_run_sync(func, *args, cancellable=False, limiter=None):
	return func(*args)

import anyio.to_thread
anyio.to_thread.run_sync = mocked_anyio_to_thread_run_sync
	`);
	console.debug("Async libraries are mocked.");

	console.debug("Setting matplotlib backend.");
	updateProgress("Setting matplotlib backend");
	// Ref: https://github.com/streamlit/streamlit/blob/1.22.0/lib/streamlit/web/bootstrap.py#L111
	// This backend setting is required to use matplotlib in Wasm environment.
	await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use("agg")
`);
	console.debug("matplotlib backend is set.");

	console.debug("Setting up Python utility functions.");
	updateProgress("Setting up Python utility functions");
	await pyodide.runPythonAsync(scriptRunnerPySource);
	run_code = pyodide.globals.get("_run_code");
	run_script = pyodide.globals.get("_run_script");
	await pyodide.runPythonAsync(unloadModulesPySource);
	unload_local_modules = pyodide.globals.get("unload_local_modules");
	console.debug("Python utility functions are set up.");

	updateProgress("Initialization completed");
}

async function initializeApp(
	appId: string,
	options: InMessageInitApp["data"],
	updateProgress: (log: string) => void
): Promise<void> {
	const appHomeDir = getAppHomeDir(appId);
	console.debug("Creating a home directory for the app.", {
		appId,
		appHomeDir
	});
	pyodide.FS.mkdir(appHomeDir);

	console.debug("Mounting files.", options.files);
	updateProgress("Mounting files");
	await Promise.all(
		Object.keys(options.files).map(async (path) => {
			const file = options.files[path];

			let data: string | ArrayBufferView;
			if ("url" in file) {
				console.debug(`Fetch a file from ${file.url}`);
				data = await fetch(file.url)
					.then((res) => res.arrayBuffer())
					.then((buffer) => new Uint8Array(buffer));
			} else {
				data = file.data;
			}
			const { opts } = options.files[path];

			const appifiedPath = resolveAppHomeBasedPath(appId, path);
			console.debug(`Write a file "${appifiedPath}"`);
			writeFileWithParents(pyodide, appifiedPath, data, opts);
		})
	);
	console.debug("Files are mounted.");

	console.debug("Installing packages.", options.requirements);
	updateProgress("Installing packages");
	await micropip.install.callKwargs(options.requirements, { keep_going: true });
	console.debug("Packages are installed.");
	updateProgress("App is now loaded");
}

const ctx = self as DedicatedWorkerGlobalScope | SharedWorkerGlobalScope;

/**
 * Set up the onmessage event listener.
 */
if ("postMessage" in ctx) {
	// Dedicated worker
	setupMessageHandler(ctx);
} else {
	// Shared worker
	ctx.onconnect = (event: MessageEvent): void => {
		const port = event.ports[0];

		setupMessageHandler(port);

		port.start();
	};
}

// Environment initialization is global and should be done only once, so its promise is managed in a global scope.
let envReadyPromise: Promise<void> | undefined = undefined;

function setupMessageHandler(receiver: MessageTransceiver): void {
	// A concept of "app" is introduced to support multiple apps in a single worker.
	// Each app has its own home directory (`getAppHomeDir(appId)`) in a shared single Pyodide filesystem.
	// The home directory is used as the current working directory for the app.
	// Each frontend app has a connection to the worker which is the `receiver` object passed above
	// and it is associated with one app.
	// One app also has one Gradio server app which is managed by the `gradio.wasm_utils` module.`
	// This multi-app mechanism was introduced for a SharedWorker, but the same mechanism is used for a DedicatedWorker as well.
	const appId = generateRandomString(8);

	console.debug("Set up a new app.", { appId });

	const updateProgress = (log: string): void => {
		const message: OutMessage = {
			type: "progress-update",
			data: {
				log
			}
		};
		receiver.postMessage(message);
	};

	// App initialization is per app or receiver, so its promise is managed in this scope.
	let appReadyPromise: Promise<void> | undefined = undefined;

	receiver.onmessage = async function (
		event: MessageEvent<InMessage>
	): Promise<void> {
		const msg = event.data;
		console.debug("worker.onmessage", msg);

		const messagePort = event.ports[0];

		try {
			if (msg.type === "init-env") {
				if (envReadyPromise == null) {
					envReadyPromise = initializeEnvironment(msg.data, updateProgress);
				} else {
					updateProgress(
						"Pyodide environment initialization is ongoing in another session"
					);
				}

				envReadyPromise
					.then(() => {
						const replyMessage: ReplyMessageSuccess = {
							type: "reply:success",
							data: null
						};
						messagePort.postMessage(replyMessage);
					})
					.catch((error) => {
						const replyMessage: ReplyMessageError = {
							type: "reply:error",
							error
						};
						messagePort.postMessage(replyMessage);
					});
				return;
			}

			if (envReadyPromise == null) {
				throw new Error("Pyodide Initialization is not started.");
			}
			await envReadyPromise;

			if (msg.type === "init-app") {
				appReadyPromise = initializeApp(appId, msg.data, updateProgress);

				const replyMessage: ReplyMessageSuccess = {
					type: "reply:success",
					data: null
				};
				messagePort.postMessage(replyMessage);
				return;
			}

			if (appReadyPromise == null) {
				throw new Error("App initialization is not started.");
			}
			await appReadyPromise;

			switch (msg.type) {
				case "echo": {
					const replyMessage: ReplyMessageSuccess = {
						type: "reply:success",
						data: msg.data
					};
					messagePort.postMessage(replyMessage);
					break;
				}
				case "run-python-code": {
					unload_local_modules();

					await run_code(appId, getAppHomeDir(appId), msg.data.code);

					const replyMessage: ReplyMessageSuccess = {
						type: "reply:success",
						data: null // We don't send back the execution result because it's not needed for our purpose, and sometimes the result is of type `pyodide.ffi.PyProxy` which cannot be cloned across threads and causes an error.
					};
					messagePort.postMessage(replyMessage);
					break;
				}
				case "run-python-file": {
					unload_local_modules();

					await run_script(appId, getAppHomeDir(appId), msg.data.path);

					const replyMessage: ReplyMessageSuccess = {
						type: "reply:success",
						data: null
					};
					messagePort.postMessage(replyMessage);
					break;
				}
				case "asgi-request": {
					console.debug("ASGI request", msg.data);
					makeAsgiRequest(
						call_asgi_app_from_js.bind(null, appId),
						msg.data.scope,
						messagePort
					); // This promise is not awaited because it won't resolves until the HTTP connection is closed.
					break;
				}
				case "file:write": {
					const { path, data: fileData, opts } = msg.data;

					const appifiedPath = resolveAppHomeBasedPath(appId, path);

					console.debug(`Write a file "${appifiedPath}"`);
					writeFileWithParents(pyodide, appifiedPath, fileData, opts);

					const replyMessage: ReplyMessageSuccess = {
						type: "reply:success",
						data: null
					};
					messagePort.postMessage(replyMessage);
					break;
				}
				case "file:rename": {
					const { oldPath, newPath } = msg.data;

					const appifiedOldPath = resolveAppHomeBasedPath(appId, oldPath);
					const appifiedNewPath = resolveAppHomeBasedPath(appId, newPath);
					console.debug(`Rename "${appifiedOldPath}" to ${appifiedNewPath}`);
					renameWithParents(pyodide, appifiedOldPath, appifiedNewPath);

					const replyMessage: ReplyMessageSuccess = {
						type: "reply:success",
						data: null
					};
					messagePort.postMessage(replyMessage);
					break;
				}
				case "file:unlink": {
					const { path } = msg.data;

					const appifiedPath = resolveAppHomeBasedPath(appId, path);

					console.debug(`Remove "${appifiedPath}`);
					pyodide.FS.unlink(appifiedPath);

					const replyMessage: ReplyMessageSuccess = {
						type: "reply:success",
						data: null
					};
					messagePort.postMessage(replyMessage);
					break;
				}
				case "install": {
					const { requirements } = msg.data;

					const micropip = pyodide.pyimport("micropip");

					console.debug("Install the requirements:", requirements);
					verifyRequirements(requirements); // Blocks the not allowed wheel URL schemes.
					await micropip.install
						.callKwargs(requirements, { keep_going: true })
						.then(() => {
							if (requirements.includes("matplotlib")) {
								// Ref: https://github.com/streamlit/streamlit/blob/1.22.0/lib/streamlit/web/bootstrap.py#L111
								// This backend setting is required to use matplotlib in Wasm environment.
								return pyodide.runPythonAsync(`
									import matplotlib
									matplotlib.use("agg")
								`);
							}
						})
						.then(() => {
							console.debug("Successfully installed");

							const replyMessage: ReplyMessageSuccess = {
								type: "reply:success",
								data: null
							};
							messagePort.postMessage(replyMessage);
						});
					break;
				}
			}
		} catch (error) {
			console.error(error);

			if (!(error instanceof Error)) {
				throw error;
			}

			// The `error` object may contain non-serializable properties such as function (for example Pyodide.FS.ErrnoError which has a `.setErrno` function),
			// so it must be converted to a plain object before sending it to the main thread.
			// Otherwise, the following error will be thrown:
			// `Uncaught (in promise) DOMException: Failed to execute 'postMessage' on 'MessagePort': #<Object> could not be cloned.`
			// Also, the JSON.stringify() and JSON.parse() approach like https://stackoverflow.com/a/42376465/13103190
			// does not work for Error objects because the Error object is not enumerable.
			// So we use the following approach to clone the Error object.
			const cloneableError = new Error(error.message);
			cloneableError.name = error.name;
			cloneableError.stack = error.stack;

			const replyMessage: ReplyMessageError = {
				type: "reply:error",
				error: cloneableError
			};
			messagePort.postMessage(replyMessage);
		}
	};
}
