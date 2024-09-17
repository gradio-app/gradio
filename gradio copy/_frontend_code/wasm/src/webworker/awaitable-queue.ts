// Copied from https://github.com/rstudio/shinylive/blob/v0.1.4/src/awaitable-queue.ts
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

// A queue with an async dequeue operation
export class AwaitableQueue<T> {
	_buffer: T[] = [];
	_promise: Promise<void>;
	_resolve: () => void;

	constructor() {
		// make TS compiler happy
		this._resolve = null as any;
		this._promise = null as any;

		// Actually initialize _promise and _resolve
		this._notifyAll();
	}

	async _wait(): Promise<void> {
		await this._promise;
	}

	_notifyAll(): void {
		if (this._resolve) {
			this._resolve();
		}
		this._promise = new Promise((resolve) => (this._resolve = resolve));
	}

	public async dequeue(): Promise<T> {
		// Must use a while-loop here, there might be multiple callers waiting to
		// deqeueue simultaneously
		while (this._buffer.length === 0) {
			await this._wait();
		}
		return this._buffer.shift()!;
	}

	public enqueue(x: T): void {
		this._buffer.push(x);
		this._notifyAll();
	}
}
