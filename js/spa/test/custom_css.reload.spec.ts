import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { launch_app_background, kill_process } from "./utils";
import { join } from "path";

let _process;

test.beforeAll(() => {
	const demo = `
import gradio as gr

custom_css= """
    h1 { color: #6D94C5; text-align: center; }
    .gradio-container { max-width: 900px !important; }
"""

# gr.HTML style works for hot reload
with gr.Blocks(css=custom_css,
    theme=gr.themes.Soft()) as demo:
    gr.HTML("<h1> AI Travel Agent</h1>")
    gr.Chatbot(height=400)
    gr.Textbox(placeholder="Type here...")

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

test("gradio dev mode correctly reloads custom css", async ({ page }) => {
	test.setTimeout(20 * 1000);

	try {
		const { _process: server_process, port: port } =
			await launch_app_background(
				`gradio ${join(process.cwd(), "run.py")}`,
				process.cwd()
			);

		_process = server_process;
		console.log("Connected to port", port);

		await page.goto(`http://localhost:${port}`);
		await page.waitForTimeout(2_000);

		await expect(page.locator("h1")).toHaveCSS("color", "rgb(109, 148, 197)");

		const demo1 = `
import gradio as gr

custom_css= """
    h1 { color: red; text-align: center; }
    .gradio-container { max-width: 900px !important; }
"""

# gr.HTML style works for hot reload
with gr.Blocks(css=custom_css,
    theme=gr.themes.Soft()) as demo:
    gr.HTML("<h1> AI Travel Agent</h1>")
    gr.Chatbot(height=400)
    gr.Textbox(placeholder="Type here...")

if __name__ == "__main__":
    demo.launch()
    `;
		// write contents of demo to a local 'run.py' file
		spawnSync(`echo '${demo1}' > ${join(process.cwd(), "run.py")}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});

		await expect(page.locator("h1")).toHaveCSS("color", "rgb(255, 0, 0)");
	} finally {
		if (_process) kill_process(_process);
	}
});
