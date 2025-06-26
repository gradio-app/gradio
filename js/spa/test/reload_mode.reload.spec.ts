import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { launch_app_background, kill_process } from "./utils";
import { join } from "path";
import fs from "fs";

const demo_file = join("..", "..", "demo", "reload_mode", "run.py");
let _process;
let original_code: string;

test.beforeAll(() => {
	original_code = fs.readFileSync(demo_file, "utf8");
});

test.afterAll(() => {
	if (_process) kill_process(_process);
	fs.writeFileSync(demo_file, original_code, "utf8");
});

test("gradio reload mode works and updates UI after file edit", async ({
	page
}) => {
	test.setTimeout(30 * 1000);
	try {
		const { _process: server_process, port } = await launch_app_background(
			`GRADIO_SERVER_PORT=7423 gradio ${demo_file}`,
			process.cwd()
		);
		_process = server_process;
		await page.goto(`http://localhost:${port}`);
		await page.waitForTimeout(2000);

		await page.getByRole("button", { name: "Eat" }).click();
		await expect(page.getByLabel("Status")).toHaveValue("full");

		let new_code = original_code.replace(
			'gr.Button("Eat")',
			'gr.Button("Eat🍔")'
		);
		fs.writeFileSync(demo_file, new_code, "utf8");

		await page.waitForTimeout(4000);

		await page.getByRole("button", { name: "Eat🍔" }).click();
		await expect(page.getByLabel("Status")).toHaveValue("reloaded");
	} finally {
		if (_process) kill_process(_process);
		// Restore the file in case of error
		fs.writeFileSync(demo_file, original_code, "utf8");
	}
});
