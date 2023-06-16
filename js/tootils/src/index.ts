import { test as base } from "@playwright/test";
import { basename } from "path";
import { ChildProcess, spawn } from "node:child_process";

export function get_text<T extends HTMLElement>(el: T) {
	return el.innerText.trim();
}

export function wait(n: number) {
	return new Promise((r) => setTimeout(r, n));
}

const worker_metadata = new Map<
	number,
	{
		worker_index: number;
		file: string;
		process: ChildProcess;
	}
>();

import { join } from "path";

const demo_path = join(__dirname, "..", "..", "..", "demo");

function spawn_gradio_app(
	app: string,
	workerIndex: number
): Promise<ChildProcess> {
	return new Promise((res, rej) => {
		const _process = spawn(`python`, [`${demo_path}/${app}/run.py`], {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				GRADIO_SERVER_PORT: `787${workerIndex}`,
				PYTHONUNBUFFERED: "true"
			}
		});
		_process.stdout.setEncoding("utf8");

		_process.stdout.on("data", (data) => {
			const _data = data.toString();
			const PORT_RE = new RegExp(`:787${workerIndex}`);

			if (PORT_RE.test(_data)) {
				res(_process);
			}
			console.log("OUT: ", _data);
		});

		_process.stderr.on("data", (data) => {
			console.log("ERR: ", data.toString());
		});
	});
}

function kill_process(process: ChildProcess) {
	return new Promise((res, rej) => {
		process.on("close", res);
		process.kill("SIGTERM");
	});
}

function update_env(worker: number, pid: number) {
	let pids: { [x: number]: number } = {};
	if (process.env.pids_to_clean) {
		pids = JSON.parse(process.env.pids_to_clean);
	}

	pids[worker] = pid;

	process.env.pids_to_clean = JSON.stringify(pids);
}

export const test = base.extend<{ setup: void }>({
	setup: [
		async ({ page }, use, testInfo) => {
			const { workerIndex, file } = testInfo;
			const test = basename(file, ".spec.ts");

			const existing_process = worker_metadata.get(workerIndex);
			if (!existing_process || existing_process.file !== file) {
				if (existing_process?.process) {
					await kill_process(existing_process.process);
				}

				try {
					const _process = await spawn_gradio_app(test, workerIndex);
					worker_metadata.set(workerIndex, {
						worker_index: workerIndex,
						process: _process,
						file: file
					});
					update_env(workerIndex, _process.pid!);
				} catch (e) {
					throw e;
				}
			}

			await page.goto(`localhost:787${workerIndex}`);

			await use();
		},
		{ auto: true }
	]
});

export { expect } from "@playwright/test";
export * from "./render";
