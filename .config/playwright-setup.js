import { spawn, spawnSync } from "node:child_process";
import { join, basename } from "path";
import { fileURLToPath } from "url";
import { readdirSync, writeFileSync } from "fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const test_app_path = join(__dirname, "./test.py");
const test_files_path = join(__dirname, "..", "js", "app", "test");

const test_files = readdirSync(test_files_path)
	.filter((f) => f.endsWith("spec.ts") && !f.endsWith(".skip.spec.ts"))
	.map((f) => basename(f, ".spec.ts"));

export default async function global_setup() {
	const verbose = process.env.GRADIO_TEST_VERBOSE;
	console.info("\nCreating test gradio app and starting server.\n");

	const test_app = make_app(test_files);
	writeFileSync(test_app_path, test_app);
	const app = await spawn_gradio_app(test_app_path, verbose);
	console.info("Server started. Running tests.\n");

	return () => {
		console.log("\nTests complete, cleaning up server.\n");
		kill_process(app);
	};
}
const PORT_RE = new RegExp(`:7879`);

function spawn_gradio_app(app, verbose) {
	return new Promise((res, rej) => {
		console.log(process.env.path);
		const _process = spawn(`python`, [app], {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				GRADIO_SERVER_PORT: `7879`,
				PYTHONUNBUFFERED: "true"
			}
		});
		_process.stdout.setEncoding("utf8");

		_process.stdout.on("data", (data) => {
			const _data = data.toString();

			if (verbose) {
				console.log("\n");
				console.log("OUT: ", _data);
				console.log("\n");
			}

			if (PORT_RE.test(_data)) {
				res(_process);
			}
		});

		_process.stderr.on("data", (data) => {
			const _data = data.toString();

			if (PORT_RE.test(_data)) {
				res(_process);
			}
			if (verbose) {
				console.warn("ERR: ", _data);
			}
			if (_data.includes("Traceback")) {
				kill_process(_process);

				if (!verbose) {
					throw new Error(
						"Something went wrong in the python process. Enable verbose mode to see the stdout/err or the python child process."
					);
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
	return `
import gradio as gr
import uvicorn
from fastapi import FastAPI
import gradio as gr
${demos.map((d) => `from demo.${d}.run import demo as ${d}`).join("\n")}
print("hi")
app = FastAPI()

${demos
	.map((d) => `app = gr.mount_gradio_app(app, ${d}, path="/${d}")`)
	.join("\n")}

config = uvicorn.Config(app, port=7879, log_level="info")
server = uvicorn.Server(config=config)
server.run()`;
}
