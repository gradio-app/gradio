import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	rmSync,
	copyFileSync
} from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { spawnSync } from "child_process";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const out_path = resolve(__dirname, "../../gradio/templates/node/build");

async function render(build_path) {
	const { Server } = await import(
		pathToFileURL(join(build_path, "server", "index.js")).href
	);
	const { manifest } = await import(
		pathToFileURL(join(build_path, "server", "manifest.js")).href
	);

	const server = new Server(manifest);
	await server.init({ env: {} });
	const response = await server.respond(
		new Request("http://127.0.0.1/", {
			headers: { "x-gradio-server": "http://127.0.0.1:1" }
		}),
		{ getClientAddress: () => "127.0.0.1" }
	);

	if (response.status >= 500) {
		const body = await response.text();
		throw new Error(
			`Standalone SSR render returned ${response.status}: ${body.slice(0, 500)}`
		);
	}
}

function verify_build() {
	const temporary_directory = mkdtempSync(join(tmpdir(), "gradio-ssr-build-"));
	const isolated_build = join(temporary_directory, "build");

	try {
		mkdirSync(isolated_build);
		copyFileSync(
			join(out_path, "package.json"),
			join(isolated_build, "package.json")
		);
		cpSync(join(out_path, "server"), join(isolated_build, "server"), {
			recursive: true
		});
		if (existsSync(join(out_path, "node_modules"))) {
			cpSync(
				join(out_path, "node_modules"),
				join(isolated_build, "node_modules"),
				{ recursive: true }
			);
		}

		const result = spawnSync(
			process.execPath,
			[__filename, "--render", isolated_build],
			{
				cwd: isolated_build,
				env: { ...process.env, NODE_PATH: "" },
				stdio: "inherit"
			}
		);

		if (result.status !== 0) {
			throw new Error("Standalone SSR build verification failed");
		}
	} finally {
		rmSync(temporary_directory, { recursive: true, force: true });
	}
}

if (process.argv[2] === "--render") {
	await render(process.argv[3]);
} else {
	verify_build();
}
