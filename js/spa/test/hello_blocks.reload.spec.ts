import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { launch_app_background, kill_process } from "./utils";
import { join } from "path";

let _process;

test.beforeAll(() => {
	const demo = `
import gradio as gr
    
with gr.Blocks() as demo:
	with gr.Row():
		t1 = gr.Textbox(label="x")
		t2 = gr.Textbox(label="y")
	t1.change(lambda x:x[::-1], inputs=t1, outputs=t2)
	
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
		const { _process: server_process, port: port } =
			await launch_app_background(
				`gradio ${join(process.cwd(), "run.py")}`,
				process.cwd()
			);

		_process = server_process;
		console.log("Connected to port", port);

		await page.goto(`http://localhost:${port}`);
		await page.waitForTimeout(2000);

		await page.getByLabel("x").fill("abcde");
		await expect(page.getByLabel("y")).toHaveValue("edcba");

		const demo = `
import gradio as gr
    
with gr.Blocks() as demo:
	with gr.Row():
		t1 = gr.Textbox(label="x")
		t2 = gr.Textbox(label="y")
		t3 = gr.Textbox("new", label="z")
	t1.change(lambda x:[x[::-1], x], inputs=t1, outputs=[t2, t3])

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

		await expect(page.getByLabel("z")).toHaveValue("new");
		await page.getByLabel("x").fill("gradio");
		await expect(page.getByLabel("y")).toHaveValue("oidarg");
		await expect(page.getByLabel("z")).toHaveValue("gradio");

		const demo2 = `
import gradio as gr
    
with gr.Blocks() as demo:
	with gr.Row():
		t1 = gr.Textbox(label="x", interactive=True)
		t2 = gr.Textbox(label="y")
		t3 = gr.Textbox("new", label="z")
	btn = gr.Button("Reset")
	btn.click(lambda: ["", "", ""], outputs=[t1, t2, t3])

if __name__ == "__main__":
    demo.launch()
    `;
		// write contents of demo to a local 'run.py' file
		spawnSync(`echo '${demo2}' > ${join(process.cwd(), "run.py")}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});

		await expect(page.getByLabel("x")).toHaveValue("gradio");
		await expect(page.getByLabel("y")).toHaveValue("oidarg");
		await expect(page.getByLabel("z")).toHaveValue("new");

		await page.getByLabel("x").fill("test");
		await expect(page.getByLabel("y")).toHaveValue("oidarg");

		await page.getByRole("button", { name: "Reset" }).click();
		await expect(page.getByLabel("x")).toHaveValue("");
		await expect(page.getByLabel("y")).toHaveValue("");
		await expect(page.getByLabel("z")).toHaveValue("");
	} finally {
		if (_process) kill_process(_process);
	}
});
