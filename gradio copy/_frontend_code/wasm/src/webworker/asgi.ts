import type { PyProxy } from "pyodide/ffi";
import { AwaitableQueue } from "./awaitable-queue";
import type {
	ASGIApplication,
	ASGIScope,
	ReceiveEvent,
	SendEvent
} from "../asgi-types";

// Connect the `messagePort` to the `asgiApp` so that
// the `asgiApp` can receive ASGI events (`ReceiveEvent`) from the `messagePort`
// and send ASGI events (`SendEvent`) to the `messagePort`.
export function makeAsgiRequest(
	asgiApp: ASGIApplication,
	scope: ASGIScope,
	messagePort: MessagePort
): Promise<void> {
	const receiveEventQueue = new AwaitableQueue<ReceiveEvent>();

	messagePort.addEventListener("message", (event) => {
		receiveEventQueue.enqueue(event.data);
	});
	messagePort.start();

	// Set up the ASGI application, passing it the `scope` and the `receive` and `send` functions.
	// Ref: https://asgi.readthedocs.io/en/latest/specs/main.html#applications
	async function receiveFromJs(): Promise<ReceiveEvent> {
		return await receiveEventQueue.dequeue();
	}
	async function sendToJs(proxiedEvent: PyProxy): Promise<void> {
		const event = Object.fromEntries(proxiedEvent.toJs()) as SendEvent;
		messagePort.postMessage(event);
	}
	return asgiApp(scope, receiveFromJs, sendToJs);
}
