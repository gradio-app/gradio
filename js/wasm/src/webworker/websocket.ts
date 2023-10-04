import type { PyProxy } from "pyodide/ffi";
import { AwaitableQueue } from "./awaitable-queue";
import { MessagePortWebSocket } from "../messageportwebsocket";

// A reference to an ASGI application instance in Python
// Ref: https://asgi.readthedocs.io/en/latest/specs/main.html#applications
type ASGIApplication = (
	scope: Record<string, unknown>,
	receive: () => Promise<ReceiveEvent>,
	send: (event: PyProxy) => Promise<void>
) => Promise<void>;

// https://asgi.readthedocs.io/en/latest/specs/www.html#connect-receive-event
interface ConnectReceiveEvent {
	type: "websocket.connect";
}

// https://asgi.readthedocs.io/en/latest/specs/www.html#accept-send-event
interface AcceptSendEvent {
	type: "websocket.accept";
	subprotofcol?: string;
	headers?: Iterable<[Uint8Array, Uint8Array]>;
}

// https://asgi.readthedocs.io/en/latest/specs/www.html#receive-receive-event
interface ReceiveReceiveEvent {
	type: "websocket.receive";
	bytes?: Uint8Array;
	text?: string;
}

// https://asgi.readthedocs.io/en/latest/specs/www.html#send-send-event
interface SendSendEvent {
	type: "websocket.send";
	bytes?: Uint8Array;
	text?: string;
}

// https://asgi.readthedocs.io/en/latest/specs/www.html#disconnect-receive-event-ws
interface DisconnectReceiveEvent {
	type: "websocket.disconnect";
	code?: number;
}

// https://asgi.readthedocs.io/en/latest/specs/www.html#close-send-event
interface CloseSendEvent {
	type: "websocket.close";
	code?: number;
	reason?: string;
}

export type ReceiveEvent =
	| ConnectReceiveEvent
	| ReceiveReceiveEvent
	| DisconnectReceiveEvent;
export type SendEvent = AcceptSendEvent | SendSendEvent | CloseSendEvent;

export function initWebSocket(
	asgiApp: ASGIApplication,
	path: string,
	messagePort: MessagePort
): Promise<void> {
	const receiveEventQueue = new AwaitableQueue<ReceiveEvent>();

	const websocket = new MessagePortWebSocket(messagePort);

	websocket.addEventListener("message", (e) => {
		const me = e as MessageEvent;
		const asgiEvent: ReceiveReceiveEvent =
			typeof me.data === "string"
				? {
						type: "websocket.receive",
						text: me.data
				  }
				: {
						type: "websocket.receive",
						bytes: me.data
				  };
		receiveEventQueue.enqueue(asgiEvent);
	});
	websocket.addEventListener("close", (e) => {
		const ce = e as CloseEvent;
		const asgiEvent: DisconnectReceiveEvent = {
			type: "websocket.disconnect",
			code: ce.code
		};
		receiveEventQueue.enqueue(asgiEvent);
	});
	websocket.addEventListener("error", (e) => {
		console.error(e);
	});

	// Enqueue an event to open the connection beforehand, which is
	// "Sent to the application when the client initially opens a connection and is about to finish the WebSocket handshake."
	// Ref: https://asgi.readthedocs.io/en/latest/specs/www.html#connect-receive-event
	receiveEventQueue.enqueue({
		type: "websocket.connect"
	});

	// Set up the ASGI application, passing it the `scope` and the `receive` and `send` functions.
	// Ref: https://asgi.readthedocs.io/en/latest/specs/main.html#applications
	async function receiveFromJs(): Promise<ReceiveEvent> {
		return await receiveEventQueue.dequeue();
	}

	async function sendToJs(proxiedEvent: PyProxy): Promise<void> {
		const event = Object.fromEntries(proxiedEvent.toJs()) as SendEvent;
		switch (event.type) {
			case "websocket.accept": {
				// Sent by the application when it wishes to accept an incoming connection.
				// Ref: https://asgi.readthedocs.io/en/latest/specs/www.html#accept-send-event
				websocket.accept();
				break;
			}
			case "websocket.send": {
				// Sent by the application to send a data message to the client.
				// Ref: https://asgi.readthedocs.io/en/latest/specs/www.html#send-send-event
				websocket.send(event.text ?? event.bytes);
				break;
			}
			case "websocket.close": {
				// Sent by the application to tell the server to close the connection.
				// https://asgi.readthedocs.io/en/latest/specs/www.html#close-send-event
				websocket.close(event.code, event.reason);
				break;
			}
			default: {
				websocket.close(1002, "ASGI protocol error");
				// @ts-expect-error
				throw new Error(`Unhandled ASGI event: ${event.type}`);
			}
		}
	}

	const scope = {
		type: "websocket",
		asgi: {
			version: "3.0",
			spec_version: "2.1"
		},
		path,
		headers: [],
		query_string: "",
		root_path: "http://xxx:99999",
		client: ["", 0]
	};

	return asgiApp(scope, receiveFromJs, sendToJs);
}
