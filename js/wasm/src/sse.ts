import { asgiHeadersToRecord, getHeaderValue } from "./http";
import type { ASGIScope, ReceiveEvent, SendEvent } from "./asgi-types";
import type { WorkerProxy } from "./worker-proxy";

export class WasmWorkerEventSource extends EventTarget {
	/**
	 * 0 — connecting
	 * 1 — open
	 * 2 — closed
	 * https://developer.mozilla.org/en-US/docs/Web/API/EventSource/readyState
	 */
	public readyState: number;

	port: MessagePort;
	url: URL;

	// This class partially implements the EventSource interface (https://html.spec.whatwg.org/multipage/server-sent-events.html#the-eventsource-interface).
	// Reconnection is not implemented, so this class doesn't maitain a reconnection time and a  last event ID string and the stream interpreter ignores the field related to these, e.g. "id" and "retry".

	onopen: ((this: WasmWorkerEventSource, ev: Event) => any) | undefined;
	onmessage:
		| ((this: WasmWorkerEventSource, ev: MessageEvent) => any)
		| undefined;
	onerror: ((this: WasmWorkerEventSource, ev: Event) => any) | undefined;

	constructor(workerProxy: WorkerProxy, url: URL) {
		super();
		this.url = url;
		this.readyState = 0;

		this.addEventListener("open", (e) => {
			if (this.onopen) {
				this.onopen(e);
			}
		});
		this.addEventListener("message", (e) => {
			if (this.onmessage) {
				this.onmessage(e as MessageEvent);
			}
		});
		this.addEventListener("error", (e) => {
			if (this.onerror) {
				this.onerror(e);
			}
		});

		// https://asgi.readthedocs.io/en/latest/specs/www.html#http-connection-scope
		const asgiScope: ASGIScope = {
			type: "http",
			asgi: {
				version: "3.0",
				spec_version: "2.1"
			},
			http_version: "1.1",
			scheme: "http",
			method: "GET",
			path: url.pathname,
			query_string: url.searchParams.toString(),
			root_path: "",
			headers: [["accept", "text/event-stream"]]
		};

		this.port = workerProxy.requestAsgi(asgiScope);
		this.port.addEventListener("message", this._handleAsgiSendEvent.bind(this));
		this.port.start();
		this.port.postMessage({
			type: "http.request"
		} satisfies ReceiveEvent);
	}

	public close(): void {
		if (this.readyState === 2) {
			return;
		}

		this.port.postMessage({
			type: "http.disconnect"
		} satisfies ReceiveEvent);
		this.port.close();
		this.readyState = 2;
	}

	_handleAsgiSendEvent(e: MessageEvent<SendEvent>): void {
		const asgiSendEvent: SendEvent = e.data;

		if (asgiSendEvent.type === "http.response.start") {
			const status = asgiSendEvent.status;
			const headers = asgiHeadersToRecord(asgiSendEvent.headers);
			console.debug("[MessagePortEventSource] HTTP response start", {
				status,
				headers
			});
			const contentType = getHeaderValue(headers, "content-type");
			if (
				status !== 200 ||
				contentType == null ||
				contentType.split(";")[0] !== "text/event-stream"
			) {
				// Fail the connection (https://html.spec.whatwg.org/multipage/server-sent-events.html#fail-the-connection)
				// Queue a task which, if the readyState attribute is set to a value other than CLOSED, sets the readyState attribute to CLOSED and fires an event named error at the EventSource object. Once the user agent has failed the connection, it does not attempt to reconnect.
				this.readyState = 2;
				this.dispatchEvent(new Event("error"));
				return;
			}

			// Announce the connection (https://html.spec.whatwg.org/multipage/server-sent-events.html#announce-the-connection)
			// Queue a task which, if the readyState attribute is set to a value other than CLOSED, sets the readyState attribute to OPEN and fires an event named open at the EventSource object.
			this.readyState = 1;
			this.dispatchEvent(new Event("open"));
		} else if (asgiSendEvent.type === "http.response.body") {
			const body = new TextDecoder().decode(asgiSendEvent.body);
			console.debug("[MessagePortEventSource] HTTP response body", body);
			this.interpretEventStream(body);

			if (!asgiSendEvent.more_body) {
				this.close();
			}
		}
	}

	interpretEventStream(streamContent: string): void {
		// This method implements the steps described in the following section of the spec:
		// "9.2.6 Interpreting an event stream" (https://html.spec.whatwg.org/multipage/server-sent-events.html#event-stream-interpretation)
		const self = this;

		// The stream must then be parsed by reading everything line by line, with a U+000D CARRIAGE RETURN U+000A LINE FEED (CRLF) character pair, a single U+000A LINE FEED (LF) character not preceded by a U+000D CARRIAGE RETURN (CR) character, and a single U+000D CARRIAGE RETURN (CR) character not followed by a U+000A LINE FEED (LF) character being the ways in which a line can end.
		const lines = streamContent.split(/\r\n|\n|\r/);
		let data = "";
		let eventType = "";
		let lastEventId = "";

		for (const line of lines) {
			if (line === "") {
				// If the line is empty (a blank line)
				// Dispatch the event, as defined below.
				dispatchEvent();
			} else if (line.startsWith(":")) {
				// If the line starts with a U+003A COLON character (:)
				// Ignore the line.
			} else if (line.includes(":")) {
				// If the line contains a U+003A COLON character (:)
				// Collect the characters on the line before the first U+003A COLON character (:), and let field be that string.
				// Collect the characters on the line after the first U+003A COLON character (:), and let value be that string. If value starts with a U+0020 SPACE character, remove it from value.
				// Process the field using the steps described below, using field as the field name and value as the field value.
				const [field, ...rest] = line.split(":");
				const value = rest.join(":").trimStart();
				processField(field, value);
			} else {
				// Otherwise, the string is not empty but does not contain a U+003A COLON character (:)
				// Process the field using the steps described below, using the whole line as the field name, and the empty string as the field value.
				const field = line;
				const value = "";
				processField(field, value);
			}
		}
		// Once the end of the file is reached, any pending data must be discarded. (If the file ends in the middle of an event, before the final empty line, the incomplete event is not dispatched.)

		function processField(name: string, value: string): void {
			// The steps to process the field given a field name and a field value depend on the field name, as given in the following list. Field names must be compared literally, with no case folding performed.
			if (name === "event") {
				// Set the event type buffer to field value.
				eventType = value;
			} else if (name === "data") {
				// Append the field value to the data buffer, then append a single U+000A LINE FEED (LF) character to the data buffer.
				data += value + "\n";
			} else if (name === "id") {
				// If the field value does not contain U+0000 NULL, then set the last event ID buffer to the field value. Otherwise, ignore the field.
				if (!value.includes("\0")) {
					lastEventId = value;
				}
			} else if (name === "retry") {
				// If the field value consists of only ASCII digits, then interpret the field value as an integer in base ten, and set the event stream's reconnection time to that integer. Otherwise, ignore the field.
				// XXX: This partial implementation of EventSource doesn't support reconnection, so the reconnection time is not set.
			} else {
				// The field is ignored.
			}
		}

		function dispatchEvent(): void {
			// When the user agent is required to dispatch the event, the user agent must process the data buffer, the event type buffer, and the last event ID buffer using steps appropriate for the user agent.
			// For web browsers, the appropriate steps to dispatch the event are as follows:
			// 1. Set the last event ID string of the event source to the value of the last event ID buffer. The buffer does not get reset, so the last event ID string of the event source remains set to this value until the next time it is set by the server.
			// XXX: This partial implementation of EventSource doesn't support reconnection, so the last event ID string of the event source is not set.
			// 2. If the data buffer is an empty string, set the data buffer and the event type buffer to the empty string and return.
			if (data === "") {
				data = "";
				eventType = "";
				return;
			}
			// 3. If the data buffer's last character is a U+000A LINE FEED (LF) character, then remove the last character from the data buffer.
			if (data.endsWith("\n")) {
				data = data.slice(0, -1);
			}
			// 4. Let event be the result of creating an event using MessageEvent, in the relevant realm of the EventSource object.
			// 5. Initialize event's type attribute to "message", its data attribute to data, its origin attribute to the serialization of the origin of the event stream's final URL (i.e., the URL after redirects), and its lastEventId attribute to the last event ID string of the event source.
			// 6. If the event type buffer has a value other than the empty string, change the type of the newly created event to equal the value of the event type buffer.
			const event = new MessageEvent(eventType === "" ? "message" : eventType, {
				data,
				lastEventId,
				origin: self.url.origin
			});
			// 7. Set the data buffer and the event type buffer to the empty string.
			data = "";
			eventType = "";
			// 8. Queue a task which, if the readyState attribute is set to a value other than CLOSED, dispatches the newly created event at the EventSource object.
			if (self.readyState !== 2) {
				console.debug("[MessagePortEventSource] dispatching event", event);
				self.dispatchEvent(event);
			}
		}
	}
}
