import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { launch_app_background, kill_process } from "./utils";
import { join } from "path";

test("gradio cc dev correcty launches and is interactive", async ({ page }) => {
	test.setTimeout(60 * 1000);
	console.log("cwd", process.cwd());
	const create = spawnSync(
		`gradio cc create MyComponent --no-configure-metadata --template SimpleTextbox --overwrite`,
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
	console.log("install stdout", create.stdout.toString());

	console.log("install stderr", (create?.error || "No errors from gradio cc create").toString());
	const {port, process: _process} = await launch_app_background(`gradio cc dev`);
	try {	
		await page.goto(`http://localhost:${port}`);
		await page.getByLabel("x").fill("foo");
		await page.getByRole("button", { name: "Submit" }).click();
		await expect(page.getByLabel("output")).toHaveValue("foo");
	} finally {
		if (_process) kill_process(_process);
		spawnSync(
			`rm -rf ${join(process.cwd(), '..', 'preview', 'test', 'mycomponent')}`,
			{
				shell: true,
				stdio: "pipe",
				env: {
					...process.env,
					PYTHONUNBUFFERED: "true"
				}
			}
		);
	}


});

