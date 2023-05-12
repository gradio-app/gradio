/// <reference lib="webworker" />

import type { PyodideInterface } from "pyodide";
import type { InMessage, ReplyMessage } from "./message-types";

importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js");

let pyodide: PyodideInterface;

async function loadPyodideAndPackages() {
	// @ts-ignore
	pyodide = await loadPyodide();

	const requirements = ["numpy"]; // TODO: Make configurable
	pyodide.loadPackage(requirements);
}
const pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event: MessageEvent<InMessage>) => {
	await pyodideReadyPromise;

	const msg = event.data;
	console.debug("worker.onmessage", msg);

	const messagePort = event.ports[0];

	// TODO: Implement the following logic:
	const pythonCode = `40 + 2`;
	const results = await pyodide.runPythonAsync(pythonCode);

	const replyMessage: ReplyMessage = {
		type: "reply",
		data: {
			results
		}
	};
	messagePort.postMessage(replyMessage);
};
