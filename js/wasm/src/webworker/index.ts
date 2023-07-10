/// <reference lib="webworker" />
/* eslint-env worker */

import type { PyodideInterface } from "pyodide";
import type {
	InMessage,
	InMessageInit,
	ReplyMessageError,
	ReplyMessageSuccess
} from "../message-types";
import { writeFileWithParents, renameWithParents } from "./file";
import { verifyRequirements } from "./requirements";
import { makeHttpRequest } from "./http";
import scriptRunnerPySource from "./py/script_runner.py?raw";
import unloadModulesPySource from "./py/unload_modules.py?raw";

importScripts("https://cdn.jsdelivr.net/pyodide/v0.24.0/full/pyodide.js");

let pyodide: PyodideInterface;

let pyodideReadyPromise: undefined | Promise<void> = undefined;

let call_asgi_app_from_js: (
	scope: unknown,
	receive: () => Promise<unknown>,
	send: (event: any) => Promise<void>
) => Promise<void>;
let run_script: (path: string) => void;
let unload_local_modules: (target_dir_path?: string) => void;

async function loadPyodideAndPackages(
	options: InMessageInit["data"]
): Promise<void> {
	console.debug("Loading Pyodide.");
	pyodide = await loadPyodide({
		stdout: console.debug,
		stderr: console.error
	});
	console.debug("Pyodide is loaded.");

	console.debug("Mounting files.", options.files);
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

			console.debug(`Write a file "${path}"`);
			writeFileWithParents(pyodide, path, data, opts);
		})
	);
	console.debug("Files are mounted.");

	console.debug("Loading micropip");
	await pyodide.loadPackage("micropip");
	const micropip = pyodide.pyimport("micropip");
	console.debug("micropip is loaded.");

	const gradioWheelUrls = [
		options.gradioWheelUrl,
		options.gradioClientWheelUrl
	];
	console.debug("Loading Gradio wheels.", gradioWheelUrls);
	await micropip.add_mock_package("ffmpy", "0.3.0");
	await micropip.add_mock_package("aiohttp", "3.8.4");
	await pyodide.loadPackage(["ssl", "distutils", "setuptools"]);
	await micropip.install(["markdown-it-py[linkify]~=2.2.0"]); // On 3rd June 2023, markdown-it-py 3.0.0 has been released. The `gradio` package depends on its `>=2.0.0` version so its 3.x will be resolved. However, it conflicts with `mdit-py-plugins`'s dependency `markdown-it-py >=1.0.0,<3.0.0` and micropip currently can't resolve it. So we explicitly install the compatible version of the library here.
	await micropip.install.callKwargs(gradioWheelUrls, {
		keep_going: true
	});
	console.debug("Gradio wheels are loaded.");

	console.debug("Install packages.", options.requirements);
	await micropip.install.callKwargs(options.requirements, { keep_going: true });
	console.debug("Packages are installed.");

	console.debug("Mock os module methods.");
	// `os.link` is used in `aiofiles` (https://github.com/Tinche/aiofiles/blob/v23.1.0/src/aiofiles/os.py#L31),
	// which is imported from `gradio.ranged_response` (https://github.com/gradio-app/gradio/blob/v3.32.0/gradio/ranged_response.py#L12).
	// However, it's not available on Wasm.
	await pyodide.runPythonAsync(`
import os

os.link = lambda src, dst: None
`);
	console.debug("os module methods are mocked.");

	console.debug("Import gradio package.");
	// Importing the gradio package takes a long time, so we do it separately.
	// This is necessary for accurate performance profiling.
	await pyodide.runPythonAsync(`import gradio`);
	console.debug("gradio package is imported.");

	console.debug("Define a ASGI wrapper function.");
	// TODO: Unlike Streamlit, user's code is executed in the global scope,
	//       so we should not define this function in the global scope.
	await pyodide.runPythonAsync(`
# Based on Shiny's App.call_pyodide().
# https://github.com/rstudio/py-shiny/blob/v0.3.3/shiny/_app.py#L224-L258
async def _call_asgi_app_from_js(scope, receive, send):
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

	app = gradio.wasm_utils.get_registered_app()
	if app is None:
		raise RuntimeError("Gradio app has not been launched.")

	await app(scope, rcv, snd)
`);
	call_asgi_app_from_js = pyodide.globals.get("_call_asgi_app_from_js");
	console.debug("The ASGI wrapper function is defined.");

	console.debug("Mock async libraries.");
	// FastAPI uses `anyio.to_thread.run_sync` internally which, however, doesn't work in Wasm environments where the `threading` module is not supported.
	// So we mock `anyio.to_thread.run_sync` here not to use threads.
	await pyodide.runPythonAsync(`
async def mocked_anyio_to_thread_run_sync(func, *args, cancellable=False, limiter=None):
	return func(*args)

import anyio.to_thread
anyio.to_thread.run_sync = mocked_anyio_to_thread_run_sync
`);

	// `gradio_client.utils.synchronize_async()`, which is used in several places in the Gradio package, uses `fsspec.asyn.get_loop()` and `fsspec.asyn.sync()` internally.
	// However, `fsspec.asyn.get_loop` doesn't work in Wasm environments because it internally uses the `threading` module which is not supported in Wasm environments.
	// `fsspec.asyn.sync()` also doesn't work stopping the script execution somehow.
	// So we mock them here.
	// In the mock implementation of `fsspec.asyn.sync()`, `asyncio.ensure_future()` is used instead
	// because it's the best we can do in the Wasm env,
	// while it's not fully compatible with the original implementation
	// as `asyncio.ensure_future()` doesn't block the current thread.
	await pyodide.runPythonAsync(`
import asyncio

def mocked_fsspec_asyn_get_loop():
	return asyncio.get_event_loop()

def mocked_fsspec_asyn_sync(loop, func, *args, **kwargs):
	asyncio.ensure_future(func(*args, **kwargs), loop=loop)

import fsspec.asyn
fsspec.asyn.get_loop = mocked_fsspec_asyn_get_loop
fsspec.asyn.sync = mocked_fsspec_asyn_sync
`);
	console.debug("Async libraries are mocked.");

	console.debug("Set matplotlib backend.");
	// Ref: https://github.com/streamlit/streamlit/blob/1.22.0/lib/streamlit/web/bootstrap.py#L111
	// This backend setting is required to use matplotlib in Wasm environment.
	await pyodide.runPythonAsync(`
import matplotlib
matplotlib.use("agg")
`);
	console.debug("matplotlib backend is set.");

	console.debug("Set up Python utility functions.");
	await pyodide.runPythonAsync(scriptRunnerPySource);
	run_script = pyodide.globals.get("_run_script");
	await pyodide.runPythonAsync(unloadModulesPySource);
	unload_local_modules = pyodide.globals.get("unload_local_modules");
	console.debug("Python utility functions are set up.");
}

self.onmessage = async (event: MessageEvent<InMessage>): Promise<void> => {
	const msg = event.data;
	console.debug("worker.onmessage", msg);

	const messagePort = event.ports[0];

	try {
		if (msg.type === "init") {
			pyodideReadyPromise = loadPyodideAndPackages(msg.data);

			const replyMessage: ReplyMessageSuccess = {
				type: "reply:success",
				data: null
			};
			messagePort.postMessage(replyMessage);
			return;
		}

		if (pyodideReadyPromise == null) {
			throw new Error("Pyodide Initialization is not started.");
		}

		await pyodideReadyPromise;

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

				await pyodide.runPythonAsync(msg.data.code);

				const replyMessage: ReplyMessageSuccess = {
					type: "reply:success",
					data: null // We don't send back the execution result because it's not needed for our purpose, and sometimes the result is of type `pyodide.ffi.PyProxy` which cannot be cloned across threads and causes an error.
				};
				messagePort.postMessage(replyMessage);
				break;
			}
			case "run-python-file": {
				unload_local_modules();

				run_script(msg.data.path);

				const replyMessage: ReplyMessageSuccess = {
					type: "reply:success",
					data: null
				};
				messagePort.postMessage(replyMessage);
				break;
			}
			case "http-request": {
				const request = msg.data.request;
				const response = await makeHttpRequest(call_asgi_app_from_js, request);
				const replyMessage: ReplyMessageSuccess = {
					type: "reply:success",
					data: {
						response
					}
				};
				messagePort.postMessage(replyMessage);
				break;
			}
			case "file:write": {
				const { path, data: fileData, opts } = msg.data;

				console.debug(`Write a file "${path}"`);
				writeFileWithParents(pyodide, path, fileData, opts);

				const replyMessage: ReplyMessageSuccess = {
					type: "reply:success",
					data: null
				};
				messagePort.postMessage(replyMessage);
				break;
			}
			case "file:rename": {
				const { oldPath, newPath } = msg.data;

				console.debug(`Rename "${oldPath}" to ${newPath}`);
				renameWithParents(pyodide, oldPath, newPath);

				const replyMessage: ReplyMessageSuccess = {
					type: "reply:success",
					data: null
				};
				messagePort.postMessage(replyMessage);
				break;
			}
			case "file:unlink": {
				const { path } = msg.data;

				console.debug(`Remove "${path}`);
				pyodide.FS.unlink(path);

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
							return pyodide.runPythonAsync(`
                from stlite_server.bootstrap import _fix_matplotlib_crash
                _fix_matplotlib_crash()
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
			}
		}
	} catch (error) {
		const replyMessage: ReplyMessageError = {
			type: "reply:error",
			error: error as Error
		};
		messagePort.postMessage(replyMessage);
	}
};
