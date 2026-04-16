import * as SPLAT from "gsplat";

type ParseRequest = { buffer: ArrayBuffer; format: string };
type ParseResponse =
	| { ok: true; data: Uint8Array }
	| { ok: false; error: string };

self.onmessage = (e: MessageEvent<ParseRequest>) => {
	try {
		const scene = new SPLAT.Scene();
		const splat = SPLAT.PLYLoader.LoadFromArrayBuffer(
			e.data.buffer,
			scene,
			e.data.format
		);
		const data = splat.data.serialize();
		const response: ParseResponse = { ok: true, data };
		(self as unknown as Worker).postMessage(response, [data.buffer]);
	} catch (err) {
		const response: ParseResponse = {
			ok: false,
			error: (err as Error).message || String(err)
		};
		(self as unknown as Worker).postMessage(response);
	}
};

export type { ParseRequest, ParseResponse };
