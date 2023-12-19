import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { launch_app_background, kill_process } from "./utils";
import { join } from "path";
import which from "which";

test.beforeAll(() => {
	// copy pnpm-lock.yml to copy function
	const pnpm_copy = spawnSync(
		`cp ${join(process.cwd(), "..", "..", "pnpm-lock.yaml")} ${join(
			process.cwd(),
			"..",
			"pnpm-lock-copy.yaml"
		)}`,
		{
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		}
	);
});

test.afterAll(() => {
	spawnSync(`rm -rf ${join(process.cwd(), "..", "preview", "test", "venv")}`, {
		shell: true,
		stdio: "pipe",
		env: {
			...process.env,
			PYTHONUNBUFFERED: "true"
		}
	});
	spawnSync(
		`rm -rf ${join(process.cwd(), "..", "preview", "test", "mycomponent")}`,
		{
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		}
	);
	spawnSync(
		`mv ${join(process.cwd(), "..", "pnpm-lock-copy.yaml")} ${join(
			process.cwd(),
			"..",
			"..",
			"pnpm-lock.yaml"
		)}`,
		{
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		}
	);
});

test("gradio cc dev correcty launches and is interactive", async ({ page }) => {
	test.setTimeout(5 * 60 * 1000);

	// create a new python virtual environment and activate it
	const venv_create = spawnSync(
		`python3 -m venv ${join(process.cwd(), "..", "preview", "test", "venv")}`,
		{
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		}
	);
	if (venv_create.status !== 0) {
		console.log("venv create stdout", venv_create.stdout.toString());
		console.log("venv create stderr", venv_create.stderr.toString());
	}

	const pip = join(
		process.cwd(),
		"..",
		"preview",
		"test",
		"venv",
		"bin",
		"pip"
	);
	const gradio_install = spawnSync(
		`${pip} install -e ${join(process.cwd(), "..", "..")}`,
		{
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		}
	);
	if (gradio_install.status !== 0) {
		console.log("gradio install stdout", gradio_install.stdout.toString());
		console.log("gradio install stderr", gradio_install.stderr.toString());
	}
	// install local copies of gradio and gradio client
	const client_install = spawnSync(
		`${pip} install -e ${join(process.cwd(), "..", "..", "client", "python")}`,
		{
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		}
	);

	if (client_install.status !== 0) {
		console.log("client install stdout", client_install.stdout.toString());
		console.log("client install stderr", client_install.stderr.toString());
	}
	const gradio = join(
		process.cwd(),
		"..",
		"preview",
		"test",
		"venv",
		"bin",
		"gradio"
	);
	const create = spawnSync(
		`${gradio} cc create MyComponent --no-configure-metadata --template SimpleTextbox --overwrite`,
		{
			shell: true,
			stdio: "pipe",
			cwd: join(process.cwd(), "..", "preview", "test"),
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		}
	);
	if (create.status !== 0) {
		console.log("create stdout", create.stdout.toString());
		console.log("create stderr", create.stderr.toString());
	}

	let _process;
	try {
		const { port, process: _process } = await launch_app_background(
			`${gradio} cc dev`,
			join(process.cwd(), "..", "preview", "test", "mycomponent")
		);
		console.log("Connected to port", port);
		await page.goto(`http://localhost:${port}`);
		await page.getByLabel("x").fill("foo");
		await page.getByRole("button", { name: "Submit" }).click();
		await expect(page.getByLabel("output")).toHaveValue("foo", {
			timeout: 1000 * 60 * 5
		});
	} finally {
		if (_process) kill_process(_process);
	}
});
