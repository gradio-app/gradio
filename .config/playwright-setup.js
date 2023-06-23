import { spawn } from "node:child_process";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { readdirSync, writeFileSync } from "fs";
import kl from "kleur";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const TEST_APP_PATH = join(__dirname, "./test.py");
const TEST_FILES_PATH = join(__dirname, "..", "js", "app", "test");
const ROOT = join(__dirname, "..");

const test_files = readdirSync(TEST_FILES_PATH)
	.filter((f) => f.endsWith("spec.ts") && !f.endsWith(".skip.spec.ts"))
	.map((f) => basename(f, ".spec.ts"));

export default async function global_setup() {
	const verbose = process.env.GRADIO_TEST_VERBOSE;
	process.stdout.write(kl.yellow("\nCreating test gradio app.\n\n"));

	const test_app = make_app(test_files);
	process.stdout.write(kl.yellow("App created. Starting test server.\n\n"));

	process.stdout.write(kl.bgBlue(" =========================== \n"));
	process.stdout.write(kl.bgBlue(" === PYTHON STARTUP LOGS === \n"));
	process.stdout.write(kl.bgBlue(" =========================== \n\n"));

	writeFileSync(TEST_APP_PATH, test_app);

	const app = await spawn_gradio_app(TEST_APP_PATH, verbose);

	process.stdout.write(
		kl.green(`\n\nServer started. Running tests on port ${"7879"}.\n`)
	);

	return () => {
		process.stdout.write(kl.green(`\nTests complete, cleaning up!\n`));

		kill_process(app);
	};
}
const PORT_RE = new RegExp(`:7879`);
const INFO_RE = /^INFO:/;

function spawn_gradio_app(app, verbose) {
	let launched = false;
	return new Promise((res, rej) => {
		const _process = spawn(`python`, [app], {
			shell: true,
			stdio: "pipe",
			cwd: ROOT,
			env: {
				...process.env,
				GRADIO_SERVER_PORT: `7879`,
				PYTHONUNBUFFERED: "true"
			}
		});
		_process.stdout.setEncoding("utf8");

		_process.stdout.on("data", (data) => {
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
					_process.stdout.destroy();
					_process.stderr.destroy();
				}
			}
		});

		_process.stderr.on("data", (data) => {
			const _data = data.toString();
			const is_info = INFO_RE.test(_data);

			if (is_info) {
				process.stdout.write(kl.yellow(_data));
			}

			if (!is_info) {
				process.stdout.write(`${_data}\n`);
			}
			if (PORT_RE.test(_data)) {
				process.stderr.write(kl.bgBlue("\n =========== END =========== "));
				res(_process);

				if (!verbose) {
					_process.stdout.destroy();
					_process.stderr.destroy();
				}
			}
		});
	});
}

function kill_process(process) {
	return new Promise((res, rej) => {
		process.on("close", res);
		process.kill("SIGTERM");
	});
}

function make_app(demos) {
	return `import gradio as gr
import uvicorn
from fastapi import FastAPI
import gradio as gr
${demos.map((d) => `from demo.${d}.run import demo as ${d}`).join("\n")}

app = FastAPI()
${demos
	.map((d) => `app = gr.mount_gradio_app(app, ${d}, path="/${d}")`)
	.join("\n")}

config = uvicorn.Config(app, port=7879, log_level="info")
server = uvicorn.Server(config=config)
server.run()`;
}
