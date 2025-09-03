import { test, expect } from "@playwright/test";
import { spawnSync } from "node:child_process";
import { launch_app_background, kill_process } from "./utils";
import { join } from "path";

const demo_file = "allowed_paths_demo.py";
let _process;

test.beforeAll(() => {
	const demo = `
import gradio as gr
        
def get_image():
    return "../../test/test_files/images/bus.png"

demo = gr.Interface(fn=get_image, inputs=None, outputs="image")

if __name__ == "__main__":
    demo.launch(allowed_paths=["../../test/test_files/images"])
    `;
	// write contents of demo to a local 'run.py' file
	spawnSync(`echo '${demo}' > ${join(process.cwd(), demo_file)}`, {
		shell: true,
		stdio: "pipe",
		env: {
			...process.env,
			PYTHONUNBUFFERED: "true",
		},
	});
});

test.afterAll(() => {
	if (_process) kill_process(_process);
	spawnSync(`rm  ${join(process.cwd(), demo_file)}`, {
		shell: true,
		stdio: "pipe",
		env: {
			...process.env,
			PYTHONUNBUFFERED: "true",
		},
	});
});

test("gradio dev mode respects allowed paths after reload", async ({
	page,
}) => {
	test.setTimeout(20 * 1000);

	try {
		const { _process: server_process, port: port } =
			await launch_app_background(
				`gradio ${join(process.cwd(), demo_file)}`,
				process.cwd(),
			);
		_process = server_process;
		const demo = `
import gradio as gr
        
def get_image():
    return "../../test/test_files/images/bus.png"

demo = gr.Interface(fn=get_image, inputs=None, outputs=gr.Image(label="Image"))

if __name__ == "__main__":
    demo.launch(allowed_paths=["../../test/test_files/images/bus.png"])
        `;
		// write contents of demo to a local 'run.py' file
		await page.goto(`http://localhost:${port}`);
		await page.waitForTimeout(2000);
		spawnSync(`echo '${demo}' > ${join(process.cwd(), demo_file)}`, {
			shell: true,
			stdio: "pipe",
			env: {
				...process.env,
				PYTHONUNBUFFERED: "true",
			},
		});

		await expect(async () => {
			const blockLabels = await page.locator('[data-testid="block-label"]');
			await expect(blockLabels.filter({ hasText: "Image" })).toHaveCount(1);
		}).toPass();

		await page.getByRole("button", { name: "Generate" }).click();
		await expect(async () => {
			const image = page.locator("img").first();
			expect(await image.getAttribute("src")).toContain("bus.png");
		}).toPass();
	} finally {
		if (_process) kill_process(_process);
	}
});
