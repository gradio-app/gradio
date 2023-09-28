import { ChildProcess, spawn } from "node:child_process";
import { create_server } from "./dev_server";

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
		`gradio`,
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

	function std_out(data: Buffer): void {
		const _data = data.toString();

		if (_data.includes("Running on")) {
			const server = create_server({ ...options });
		}

		process.stdout.write(_data);
	}

	_process.stdout.on("data", std_out);
	_process.stderr.on("data", std_out);
	_process.on("exit", () => kill_process(_process));
	_process.on("close", () => kill_process(_process));
	_process.on("disconnect", () => kill_process(_process));
}

function kill_process(process: ChildProcess): void {
	process.kill("SIGKILL");
}

export { create_server };

run();

import * as net from "net";

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
