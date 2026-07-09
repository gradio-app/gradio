import { handlers } from "./handlers";
// import type { StartOptions } from 'msw';
import type { SetupWorker, StartOptions } from "msw/browser";

const IS_NODE =
	typeof process !== "undefined" && process.env.TEST_MODE === "node";

interface MockServer {
	start: (opts: StartOptions) => void | ReturnType<SetupWorker["start"]>;
	stop: () => void | Promise<void>;
	resetHandlers: (...handlers: any[]) => void;
}

export async function initialise_server(): Promise<MockServer> {
	if (IS_NODE) {
		const { setupServer } = await import("msw/node");
		const server = setupServer(...handlers);
		return {
			start: (opts: StartOptions) => server.listen(opts),
			stop: () => server.close(),
			resetHandlers: (...h) => server.resetHandlers(...h)
		};
	}
	const { setupWorker } = await import("msw/browser");
	const worker = setupWorker(...handlers);
	return {
		start: (opts: StartOptions) => worker.start(opts),
		stop: () => worker.stop(),
		resetHandlers: (...h) => worker.resetHandlers(...h)
	};
}
