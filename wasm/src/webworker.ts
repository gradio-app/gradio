/// <reference lib="webworker" />

import type { PyodideInterface } from "pyodide";
import type {
	InMessage,
	ReplyMessageError,
	ReplyMessageSuccess
} from "./message-types";

importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js");

let pyodide: PyodideInterface;

let pyodideReadyPromise: undefined | Promise<void> = undefined;

interface InitOptions {
	gradioWheelUrl: string;
	gradioClientWheelUrl: string;
	requirements: string[];
}
async function loadPyodideAndPackages(options: InitOptions) {
	console.debug("Loading Pyodide.");
	pyodide = await loadPyodide();
	console.debug("Pyodide is loaded.");

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
	await micropip.add_mock_package("orjson", "3.8.12");
	await micropip.add_mock_package("aiohttp", "3.8.4");
	await micropip.add_mock_package("multidict", "4.7.6");
	await pyodide.loadPackage(["ssl", "distutils", "setuptools"]);
	await micropip.install.callKwargs(gradioWheelUrls, {
		keep_going: true
	});
	console.debug("Gradio wheels are loaded.");

	console.debug("Install packages.", options.requirements);
	await micropip.install.callKwargs(options.requirements, { keep_going: true });
	console.debug("Packages are installed.");
}

self.onmessage = async (event: MessageEvent<InMessage>) => {
	const msg = event.data;
	console.debug("worker.onmessage", msg);

	const messagePort = event.ports[0];

	try {
		if (msg.type === "init") {
			pyodideReadyPromise = loadPyodideAndPackages({
				gradioWheelUrl: msg.data.gradioWheelUrl,
				gradioClientWheelUrl: msg.data.gradioClientWheelUrl,
				requirements: msg.data.requirements
			});

			const replyMessage: ReplyMessageSuccess = {
				type: "reply:success",
				data: null
			};
			messagePort.postMessage(replyMessage);
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
		}
	} catch (error) {
		const replyMessage: ReplyMessageError = {
			type: "reply:error",
			error: error as Error
		};
		messagePort.postMessage(replyMessage);
	}
};
