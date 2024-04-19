import { spawn } from "node:child_process";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { readdirSync, writeFileSync } from "fs";
import net from "net";

import kl from "kleur";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const TEST_APP_PATH = join(__dirname, "./test.py");
const TEST_FILES_PATH = join(__dirname, "..", "js", "app", "test");
const ROOT = join(__dirname, "..");

const test_files = readdirSync(TEST_FILES_PATH)
	.filter(
		(f) =>
			f.endsWith("spec.ts") &&
			!f.endsWith(".skip.spec.ts") &&
			!f.endsWith(".component.spec.ts") &&
			!f.endsWith(".reload.spec.ts")
	)
	.map((f) => basename(f, ".spec.ts"));

export default async function global_setup() {
	const verbose = process.env.GRADIO_TEST_VERBOSE;

	const port = await find_free_port(7860, 8860);
	process.env.GRADIO_E2E_TEST_PORT = port;

	process.stdout.write(kl.yellow("\nCreating test gradio app.\n\n"));

	const test_app = make_app(test_files, port);
	process.stdout.write(kl.yellow("App created. Starting test server.\n\n"));

	process.stdout.write(kl.bgBlue(" =========================== \n"));
	process.stdout.write(kl.bgBlue(" === PYTHON STARTUP LOGS === \n"));
	process.stdout.write(kl.bgBlue(" =========================== \n\n"));

	writeFileSync(TEST_APP_PATH, test_app);

	const app = await spawn_gradio_app(TEST_APP_PATH, port, verbose);

	process.stdout.write(
		kl.green(`\n\nServer started. Running tests on port ${port}.\n`)
	);

	return () => {
		process.stdout.write(kl.green(`\nTests complete, cleaning up!\n`));

		kill_process(app);
	};
}
const INFO_RE = /^INFO:/;

function spawn_gradio_app(app, port, verbose) {
	const PORT_RE = new RegExp(`:${port}`);

	return new Promise((res, rej) => {
		const _process = spawn(`python`, [app], {
			shell: true,
			stdio: "pipe",
			cwd: ROOT,
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true",
				GRADIO_ANALYTICS_ENABLED: "False",
				GRADIO_IS_E2E_TEST: "1"
			}
		});
		_process.stdout.setEncoding("utf8");

		function std_out(data) {
			const _data = data.toString();
			const is_info = INFO_RE.test(_data);

			if (is_info) {
				process.stdout.write(kl.yellow(_data));
			}

			if (!is_info) {
				process.stdout.write(`${_data}\n`);
			}

			if (PORT_RE.test(_data)) {
				process.stdout.write(kl.bgBlue("\n =========== END =========== "));

				res(_process);

				if (!verbose) {
					_process.stdout.off("data", std_out);
					_process.stderr.off("data", std_out);
				}
			}
		}

		_process.stdout.on("data", std_out);
		_process.stderr.on("data", std_out);
		_process.on("exit", () => kill_process(_process));
		_process.on("close", () => kill_process(_process));
		_process.on("disconnect", () => kill_process(_process));
	});
}

function kill_process(process) {
	process.kill("SIGKILL");
}

function make_app(demos, port) {
	return `
import uvicorn
from fastapi import FastAPI
import gradio as gr

${demos.map((d) => `from demo.${d}.run import demo as ${d}`).join("\n")}

app = FastAPI()
${demos
	.map(
		(d) =>
			`app = gr.mount_gradio_app(app, ${d}, path="/${d}", max_file_size=${
				d == "upload_file_limit_test" ? "'15kb'" : "None"
			})`
	)
	.join("\n")}

config = uvicorn.Config(app, port=${port}, log_level="info")
server = uvicorn.Server(config=config)
server.run()`;
}

export async function find_free_port(start_port, end_port) {
	for (let port = start_port; port < end_port; port++) {
		if (await is_free_port(port)) {
			return port;
		}
	}

	throw new Error(
		`Could not find free ports: there were not enough ports available.`
	);
}

export function is_free_port(port) {
	return new Promise((accept, reject) => {
		const sock = net.createConnection(port, "127.0.0.1");
		sock.once("connect", () => {
			sock.end();
			accept(false);
		});
		sock.once("error", (e) => {
			sock.destroy();
			if (e.code === "ECONNREFUSED") {
				accept(true);
			} else {
				reject(e);
			}
		});
	});
}
