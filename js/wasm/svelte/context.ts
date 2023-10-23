import { setContext, getContext } from "svelte";
import type { WorkerProxy } from "../dist";

const WORKER_PROXY_CONTEXT_KEY = "WORKER_PROXY_CONTEXT_KEY";

export function setWorkerProxyContext(workerProxy: WorkerProxy): void {
	setContext(WORKER_PROXY_CONTEXT_KEY, workerProxy);
}

export function getWorkerProxyContext(): WorkerProxy | undefined {
	return getContext(WORKER_PROXY_CONTEXT_KEY);
}
