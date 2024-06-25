import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { launch_app_background, kill_process } from "./utils";
import { join } from "path";

let _process;

const demo_file = "chat_demo.py";

test.beforeAll(() => {
	const demo = `
import gradio as gr
    
def greet(msg, history):
    return "Hello"

demo = gr.ChatInterface(fn=greet)

if __name__ == "__main__":
    demo.launch()
`;
	spawnSync(`echo '${demo}' > ${join(process.cwd(), demo_file)}`, {
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
	spawnSync(`rm  ${join(process.cwd(), demo_file)}`, {
		shell: true,
		stdio: "pipe",
		env: {
			...process.env,
			PYTHONUNBUFFERED: "true"
		}
	});
});

test("gradio dev mode correctly reloads a stateful ChatInterface demo", async ({
	page
}) => {
	test.setTimeout(20 * 1000);

	try {
		const port = 7890;
		const { _process: server_process } = await launch_app_background(
			`GRADIO_SERVER_PORT=${port} gradio ${join(process.cwd(), demo_file)}`,
			process.cwd()
		);
		_process = server_process;
		console.log("Connected to port", port);
		const demo = `
import gradio as gr

def greet(msg, history):
    return f"You typed: {msg}"

demo = gr.ChatInterface(fn=greet, textbox=gr.Textbox(label="foo", placeholder="Type a message..."))

if __name__ == "__main__":
    demo.launch()
`;
		await page.goto(`http://localhost:${port}`);
		spawnSync(`echo '${demo}' > ${join(process.cwd(), demo_file)}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});
		await expect(page.getByLabel("foo")).toBeVisible();
		const textbox = page.getByPlaceholder("Type a message...");
		const submit_button = page.getByRole("button", { name: "Submit" });

		await textbox.fill("hello");
		await submit_button.click();

		await expect(textbox).toHaveValue("");
		const response = page.locator(".bot  p", {
			hasText: "You typed: hello"
		});
		await expect(response).toBeVisible();
	} finally {
		if (_process) kill_process(_process);
	}
});
