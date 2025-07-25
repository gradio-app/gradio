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

		await page.getByLabel("x").fill("abcde");
		await expect(page.getByLabel("y")).toHaveValue("edcba");

		const demo1 = `
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
		spawnSync(`echo '${demo1}' > ${join(process.cwd(), "run.py")}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});

		await expect(page.getByLabel("z")).toHaveValue("new");
		await page.getByLabel("x").fill("gradio");
		await expect(page.getByLabel("x")).toHaveValue("gradio");
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

		const demo3 = `
import gradio as gr
    
with gr.Blocks() as demo:
	with gr.Row():
		t1 = gr.Textbox("new", label="x")
		btn = gr.Button("Swap")
		t2 = gr.Textbox(label="y")
	btn.click(lambda x, y: [y, x], inputs=[t1, t2], outputs=[t1, t2])

if __name__ == "__main__":
    demo.launch()
    `;
		// write contents of demo to a local 'run.py' file
		spawnSync(`echo '${demo3}' > ${join(process.cwd(), "run.py")}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});

		await expect(page.getByLabel("x")).toHaveValue("new");
		await expect(page.getByLabel("y")).toHaveValue("");

		await page.getByLabel("x").fill("test");
		await page.getByRole("button", { name: "Swap" }).click();
		await expect(page.getByLabel("x")).toHaveValue("");
		await expect(page.getByLabel("y")).toHaveValue("test");
	} finally {
		if (_process) kill_process(_process);
	}
});

test("gradio dev mode works with removing / changing existing elements", async ({
	page
}) => {
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

		const demo = `
import gradio as gr
    
with gr.Blocks() as demo:
	t1 = gr.Textbox("a", label="x")
	t2 = gr.Textbox("b", label="y")
	btn = gr.Button("Button")

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

		await expect(page.getByLabel("x")).toHaveValue("a");
		await expect(page.getByLabel("y")).toHaveValue("b");
		await page.getByRole("button", { name: "Button" }).click();

		const demo2 = `
import gradio as gr

with gr.Blocks() as demo:
	t1 = gr.Textbox("a", label="x")
	btn = gr.Button("Button")

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

		await expect(page.getByLabel("x")).toHaveValue("a");
		await page.getByRole("button", { name: "Button" }).click();

		const demo3 = `
import gradio as gr

with gr.Blocks() as demo:
	t1 = gr.Textbox(label="a")
	t2 = gr.Textbox(label="b")
	
	with gr.Row():
		t3 = gr.Textbox(label="c")
		t4 = gr.Textbox(label="d")
		t5 = gr.Textbox(label="e")

	btn = gr.Button("Button")
	btn.click(lambda *args: args, inputs=[t1, t2, t3, t4, t5], outputs=[t2, t3, t4, t5, t1])

if __name__ == "__main__":
	demo.launch()
    `;
		// write contents of demo to a local 'run.py' file
		spawnSync(`echo '${demo3}' > ${join(process.cwd(), "run.py")}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});

		await page.getByLabel("a").fill("a");
		await page.getByLabel("b").fill("b");
		await page.getByLabel("c").fill("c");
		await page.getByLabel("d").fill("d");
		await page.getByLabel("e").fill("e");

		await page.getByRole("button", { name: "Button" }).click();

		await expect(page.getByLabel("a")).toHaveValue("e");
		await expect(page.getByLabel("b")).toHaveValue("a");
		await expect(page.getByLabel("c")).toHaveValue("b");
		await expect(page.getByLabel("d")).toHaveValue("c");
		await expect(page.getByLabel("e")).toHaveValue("d");

		const demo4 = `
import gradio as gr

with gr.Blocks() as demo:
	t1 = gr.Textbox(label="a")
	t2 = gr.Textbox(label="b")
	tx = gr.Textbox(label="x")
	
	with gr.Row():
		t3 = gr.Textbox(label="c")
		with gr.Column():
			t4 = gr.Textbox(label="d")
			t5 = gr.Textbox(label="e")

	btn = gr.Button("Button")
	btn.click(lambda *args: args, inputs=[t1, t2, t3, t4, t5], outputs=[t2, t3, t4, t5, t1])

if __name__ == "__main__":
	demo.launch()
    `;
		// write contents of demo to a local 'run.py' file
		spawnSync(`echo '${demo4}' > ${join(process.cwd(), "run.py")}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});

		await expect(page.getByLabel("a")).toHaveValue("e");
		await expect(page.getByLabel("b")).toHaveValue("a");
		await expect(page.getByLabel("x")).toHaveValue("");
		await expect(page.getByLabel("c")).toHaveValue("");
		await expect(page.getByLabel("d")).toHaveValue("");
		await expect(page.getByLabel("e")).toHaveValue("");

		await page.getByRole("button", { name: "Button" }).click();

		await expect(page.getByLabel("a")).toHaveValue("");
		await expect(page.getByLabel("b")).toHaveValue("e");
		await expect(page.getByLabel("c")).toHaveValue("a");
	} finally {
		if (_process) kill_process(_process);
	}
});

test("gradio dev mode works when switching between interface / blocks / chatinterface", async ({
	page
}) => {
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

		const demo1 = `
import gradio as gr

def echo(message, history):
	return f"{len(history)}: {message}"

demo = gr.ChatInterface(
    echo,
    type="messages",
)

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

		await expect(page.getByText("Chatbot")).toBeVisible();
		const textbox = page.getByTestId("textbox");
		await textbox.fill("Hello");
		await page.keyboard.press("Enter");
		const bot_message = await page
			.getByTestId("bot")
			.first()
			.getByRole("paragraph")
			.textContent();
		expect(bot_message).toEqual("0: Hello");

		await textbox.fill("World");
		await page.keyboard.press("Enter");

		const bot_message2 = await page
			.getByTestId("bot")
			.nth(1)
			.getByRole("paragraph")
			.textContent();

		expect(bot_message2).toEqual("2: World");

		const demo2 = `
import gradio as gr
import numpy as np

with gr.Blocks() as demo:
	def create_image_noise(width, height):
		return np.random.randint(0, 255, (height, width, 3), dtype=np.uint8)

	with gr.Row():
		w = gr.Number(label="Width")
		h = gr.Number(label="Height")

	create_btn = gr.Button("Create")
	img = gr.Image(label="Image")

	create_btn.click(create_image_noise, inputs=[w, h], outputs=img)

	def count_pixels(image):
		return np.shape(image)[0] * np.shape(image)[1]

	count_btn = gr.Button("Count Pixels")
	count = gr.Number(label="Total Pixels")
	count_btn.click(count_pixels, inputs=img, outputs=count)

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

		await page.getByLabel("Width").fill("100");
		await page.getByLabel("Height").fill("100");
		await page.getByRole("button", { name: "Create" }).click();
		const image = page.getByTestId("image").locator("img").first();
		expect(await image.getAttribute("src")).toContain("/file=");
		await page.getByRole("button", { name: "Count Pixels" }).click();
		await expect(page.getByLabel("Total Pixels")).toHaveValue("10000");

		const demo3 = `
import gradio as gr

with gr.Blocks() as demo:
	t1 = gr.Textbox()
	ERROR_WTF

if __name__ == "__main__":
	demo.launch()
    `;
		// write contents of demo to a local 'run.py' file
		spawnSync(`echo '${demo3}' > ${join(process.cwd(), "run.py")}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});

		await expect(page.getByText("Error reloading")).toBeVisible();

		const demo4 = `
import gradio as gr

def count_letter(sentence, letter):
	return sentence.count(letter)

demo = gr.Interface(
	count_letter, 
	[gr.Textbox(label="sentence"), gr.Textbox(label="letter")], 
	gr.Number(label="count")
)

if __name__ == "__main__":
	demo.launch()
`;
		// write contents of demo to a local 'run.py' file
		spawnSync(`echo '${demo4}' > ${join(process.cwd(), "run.py")}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true"
			}
		});

		await page.getByLabel("sentence").fill("We looove Gradio!");
		await page.getByLabel("letter").fill("o");
		await page.getByRole("button", { name: "Submit" }).click();
		await expect(page.getByLabel("count")).toHaveValue("4");
	} finally {
		if (_process) kill_process(_process);
	}
});

test("gradio dev mode works with gr.render()", async ({ page }) => {
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

		const demo1 = `
import gradio as gr

with gr.Blocks() as demo:
	text = gr.Textbox(label="name")
	name = gr.State("---")
	text.submit(lambda x:x, text, name)
	
	@gr.render(inputs=name)
	def render_name(name):
		for i, letter in enumerate(name):
			gr.Textbox(letter, label=f"Letter {i + 1}")

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

		await expect(page.getByLabel("Letter 1")).toHaveValue("-");
		await expect(page.getByLabel("Letter 2")).toHaveValue("-");
		await expect(page.getByLabel("Letter 3")).toHaveValue("-");

		await page.getByLabel("name").fill("qwerty");
		await page.keyboard.press("Enter");

		await expect(page.getByLabel("Letter 1")).toHaveValue("q");
		await expect(page.getByLabel("Letter 2")).toHaveValue("w");
		await expect(page.getByLabel("Letter 3")).toHaveValue("e");
		await expect(page.getByLabel("Letter 4")).toHaveValue("r");
		await expect(page.getByLabel("Letter 5")).toHaveValue("t");
		await expect(page.getByLabel("Letter 6")).toHaveValue("y");

		const demo2 = `
import gradio as gr

with gr.Blocks() as demo:
	text = gr.Textbox(label="name2")
	name = gr.State("---")
	text.submit(lambda x:x, text, name)
	
	@gr.render(inputs=name)
	def render_name(name):
		for i, letter in enumerate(name):
			gr.Textbox(letter, label=f"Letter {i + 1}")

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

		await expect(page.getByLabel("Letter 1")).toHaveValue("-");
		await expect(page.getByLabel("Letter 2")).toHaveValue("-");
		await expect(page.getByLabel("Letter 3")).toHaveValue("-");

		await page.getByLabel("name2").fill("1234");
		await page.keyboard.press("Enter");

		await expect(page.getByLabel("Letter 1")).toHaveValue("1");
		await expect(page.getByLabel("Letter 2")).toHaveValue("2");
		await expect(page.getByLabel("Letter 3")).toHaveValue("3");
		await expect(page.getByLabel("Letter 4")).toHaveValue("4");
	} finally {
		if (_process) kill_process(_process);
	}
});
