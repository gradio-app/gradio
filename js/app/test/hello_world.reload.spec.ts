import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { launch_app_background, kill_process } from "./utils";
import { join } from "path";

let _process;

test.beforeAll(() => {
	const demo = `
import gradio as gr
    
def greet(name):
    return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs="text", outputs="text")

if __name__ == "__main__":
    demo.launch()
`;
	// write contents of demo to a local 'run.py' file
	spawnSync(`echo '${demo}' > ${join(process.cwd(), "run.py")}`, {
		shell: true,
		stdio: "pipe",
		env: {
			...process.env,
			PYTHONUNBUFFERED: "true"
		}
	});
});

test.afterAll(() => {
	if (_process) kill_process(_process);
	spawnSync(`rm  ${join(process.cwd(), "run.py")}`, {
		shell: true,
		stdio: "pipe",
		env: {
			...process.env,
			PYTHONUNBUFFERED: "true"
		}
	});
});

test("gradio dev mode correctly reloads the page", async ({ page }) => {
	test.setTimeout(20 * 1000);

	try {
		const port = 7880;
		const { _process: server_process } = await launch_app_background(
			`GRADIO_SERVER_PORT=${port} gradio ${join(process.cwd(), "run.py")}`,
			process.cwd()
		);
		_process = server_process;
		console.log("Connected to port", port);
		const demo = `
import gradio as gr

def greet(name):
    return "Hello " + name + "!"

demo = gr.Interface(fn=greet, inputs=gr.Textbox(label="x"), outputs=gr.Textbox(label="foo"))

if __name__ == "__main__":
    demo.launch()
    `;
		// write contents of demo to a local 'run.py' file
		await page.goto(`http://localhost:${port}`);
		spawnSync(`echo '${demo}' > ${join(process.cwd(), "run.py")}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});
		//await page.reload();

		await page.getByLabel("x").fill("Maria");
		await page.getByRole("button", { name: "Submit" }).click();

		await expect(page.getByLabel("foo")).toHaveValue("Hello Maria!");
	} finally {
		if (_process) kill_process(_process);
	}
});
