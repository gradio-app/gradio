import { ChildProcess, spawn, spawnSync } from "node:child_process";
import * as net from "net";

import { create_server } from "./dev";
import { make_build } from "./build";
import { join } from "path";
import which from "which";

export interface ComponentMeta {
	name: string;
	template_dir: string;
	frontend_dir: string;
	component_class_id: string;
}

const args = process.argv.slice(2);
// get individual args as `--arg value` or `value`

function parse_args(args: string[]): Record<string, string> {
	const arg_map: Record<string, string> = {};
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg.startsWith("--")) {
			const name = arg.slice(2);
			const value = args[i + 1];
			arg_map[name] = value;
			i++;
		}
	}
	return arg_map;
}

const parsed_args = parse_args(args);

async function run(): Promise<void> {
	if (parsed_args.mode === "build") {
		await make_build({
			component_dir: parsed_args["component-directory"],
			root_dir: parsed_args.root,
			python_path: parsed_args["python-path"]
		});
	} else {
		const [backend_port, frontend_port] = await find_free_ports(7860, 8860);
		const options = {
			component_dir: parsed_args["component-directory"],
			root_dir: parsed_args.root,
			frontend_port,
			backend_port,
			host: parsed_args.host,
			...parsed_args
		};
		process.env.GRADIO_BACKEND_PORT = backend_port.toString();

		const _process = spawn(
			parsed_args["gradio-path"],
			[parsed_args.app, "--watch-dirs", options.component_dir],
			{
				shell: true,
				stdio: "pipe",
				cwd: process.cwd(),
				env: {
					...process.env,
					GRADIO_SERVER_PORT: backend_port.toString(),
					PYTHONUNBUFFERED: "true"
				}
			}
		);

		_process.stdout.setEncoding("utf8");
		_process.stderr.setEncoding("utf8");

		function std_out(mode: "stdout" | "stderr") {
			return function (data: Buffer): void {
				const _data = data.toString();

				if (_data.includes("Running on")) {
					create_server({
						component_dir: options.component_dir,
						root_dir: options.root_dir,
						frontend_port,
						backend_port,
						host: options.host,
						python_path: parsed_args["python-path"]
					});
				}

				process[mode].write(_data);
			};
		}

		_process.stdout.on("data", std_out("stdout"));
		_process.stderr.on("data", std_out("stderr"));
		_process.on("exit", () => kill_process(_process));
		_process.on("close", () => kill_process(_process));
		_process.on("disconnect", () => kill_process(_process));
	}
}

function kill_process(process: ChildProcess): void {
	process.kill("SIGKILL");
}

export { create_server };

run();

export async function find_free_ports(
	start_port: number,
	end_port: number
): Promise<[number, number]> {
	let found_ports: number[] = [];

	for (let port = start_port; port < end_port; port++) {
		if (await is_free_port(port)) {
			found_ports.push(port);
			if (found_ports.length === 2) {
				return [found_ports[0], found_ports[1]];
			}
		}
	}

	throw new Error(
		`Could not find free ports: there were not enough ports available.`
	);
}

export function is_free_port(port: number): Promise<boolean> {
	return new Promise((accept, reject) => {
		const sock = net.createConnection(port, "127.0.0.1");
		sock.once("connect", () => {
			sock.end();
			accept(false);
		});
		sock.once("error", (e) => {
			sock.destroy();
			//@ts-ignore
			if (e.code === "ECONNREFUSED") {
				accept(true);
			} else {
				reject(e);
			}
		});
	});
}

function is_truthy<T>(value: T | null | undefined | false): value is T {
	return value !== null && value !== undefined && value !== false;
}

export function examine_module(
	component_dir: string,
	root: string,
	python_path: string,
	mode: "build" | "dev"
): ComponentMeta[] {
	const _process = spawnSync(
		python_path,
		[join(root, "..", "..", "node", "examine.py"), "-m", mode],
		{
			cwd: join(component_dir, "backend"),
			stdio: "pipe"
		}
	);
	const exceptions: string[] = [];

	const components = _process.stdout
		.toString()
		.trim()
		.split("\n")
		.map((line) => {
			if (line.startsWith("|EXCEPTION|")) {
				exceptions.push(line.slice("|EXCEPTION|:".length));
			}
			const [name, template_dir, frontend_dir, component_class_id] =
				line.split("~|~|~|~");
			if (name && template_dir && frontend_dir && component_class_id) {
				return {
					name: name.trim(),
					template_dir: template_dir.trim(),
					frontend_dir: frontend_dir.trim(),
					component_class_id: component_class_id.trim()
				};
			}
			return false;
		})
		.filter(is_truthy);
	if (exceptions.length > 0) {
		console.info(
			`While searching for gradio custom component source directories in ${component_dir}, the following exceptions were raised. If dev mode does not work properly please pass the --gradio-path and --python-path CLI arguments so that gradio uses the right executables: ${exceptions.join(
				"\n"
			)}`
		);
	}
	return components;
}
