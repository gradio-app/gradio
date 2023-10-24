// Copied from https://github.com/rstudio/shinylive/blob/v0.1.4/src/messageportwebsocket.ts
// and modified.
/*
MIT License

Copyright (c) 2022 RStudio, PBC

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/**
 * This class provides a standard WebSocket API, but is implemented using a
 * MessagePort. It can represent the server or client side of a WebSocket
 * connection. If server, then ws.accept() should be called after creation
 * in order to initialize the connection.
 */
export class MessagePortWebSocket extends EventTarget {
	readyState: number;
	_port: MessagePort;
	onopen: ((this: MessagePortWebSocket, ev: Event) => any) | undefined;
	onmessage:
		| ((this: MessagePortWebSocket, ev: MessageEvent) => any)
		| undefined;
	onerror: ((this: MessagePortWebSocket, ev: Event) => any) | undefined;
	onclose: ((this: MessagePortWebSocket, ev: CloseEvent) => any) | undefined;

	constructor(port: MessagePort) {
		super();

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
		this.addEventListener("close", (e) => {
			if (this.onclose) {
				this.onclose(e as CloseEvent);
			}
		});

		this._port = port;
		port.addEventListener("message", this._onMessage.bind(this));
		port.start();
	}

	// Call on the server side of the connection, to tell the client that
	// the connection has been established.
	public accept(): void {
		if (this.readyState !== 0) {
			return;
		}

		this.readyState = 1;
		this._port.postMessage({ type: "open" });
	}

	public send(data: unknown): void {
		if (this.readyState === 0) {
			throw new DOMException(
				"Can't send messages while WebSocket is in CONNECTING state",
				"InvalidStateError"
			);
		}
		if (this.readyState > 1) {
			return;
		}

		this._port.postMessage({ type: "message", value: { data } });
	}

	public close(code?: number, reason?: string): void {
		if (this.readyState > 1) {
			return;
		}

		this.readyState = 2;
		this._port.postMessage({ type: "close", value: { code, reason } });
		this.readyState = 3;
		this.dispatchEvent(
			new CloseEvent("close", { code, reason, wasClean: true })
		);
	}

	private _onMessage(e: MessageEvent): void {
		const event = e.data;
		console.debug("MessagePortWebSocket received event:", event);
		switch (event.type) {
			case "open":
				if (this.readyState === 0) {
					this.readyState = 1;
					this.dispatchEvent(new Event("open"));
					return;
				}
				break;
			case "message":
				if (this.readyState === 1) {
					this.dispatchEvent(new MessageEvent("message", { ...event.value }));
					return;
				}
				break;
			case "close":
				if (this.readyState < 3) {
					this.readyState = 3;
					this.dispatchEvent(
						new CloseEvent("close", { ...event.value, wasClean: true })
					);
					return;
				}
				break;
		}
		// If we got here, we didn't know how to handle this event
		this._reportError(
			`Unexpected event '${event.type}' while in readyState ${this.readyState}`,
			1002
		);
	}

	private _reportError(message: string, code?: number): void {
		this.dispatchEvent(new ErrorEvent("error", { message }));
		if (typeof code === "number") {
			this.close(code, message);
		}
	}
}
