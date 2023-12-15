import { spawn } from "node:child_process";

import type { ChildProcess } from "child_process";

export function kill_process(process: ChildProcess) {
	process.kill("SIGKILL");
}

type LaunchAppBackgroundReturn = {
	port: number;
	process: ChildProcess;
};

export const launch_app_background = async (
	command: string
): Promise<LaunchAppBackgroundReturn> => {
	const _process = spawn(command, {
		shell: true,
		stdio: "pipe",
		env: {
			...process.env,
			PYTHONUNBUFFERED: "true"
		}
	});

	_process.stdout.setEncoding("utf8");
	_process.stderr.setEncoding("utf8");

	_process.on("exit", () => kill_process(_process));
	_process.on("close", () => kill_process(_process));
	_process.on("disconnect", () => kill_process(_process));

	let port;

	function std_out(data: any) {
		const _data: string = data.toString();
		console.log(_data);

		const portRegExp = /:(\d+)/;
		const match = portRegExp.exec(_data);

		if (match && match[1] && _data.includes("Running on local")) {
			port = parseInt(match[1], 10);
		}
	}

	function std_err(data: any) {
		const _data: string = data.toString();
		console.log(_data);
	}

	_process.stdout.on("data", std_out);
	_process.stderr.on("data", std_err);

	while (!port) {
		await new Promise((r) => setTimeout(r, 1000));
	}
	return { port: port, process: _process };
};
