import { test, expect } from "@playwright/test";
import { launch_app_background, kill_process } from "./utils";
import { join } from "path";
import fs from "fs";

const demo_file = join(process.cwd(), "in_flight_generator_reload.py");
let _process;

const DEMO_ONE_OUTPUT = `
import asyncio
import gradio as gr

with gr.Blocks() as demo:
    submit = gr.Button("Submit")
    out = gr.Textbox(label="out", key="1")
    outputs = [out]

    async def process():
        # Long initial sleep so a hot-reload can finish before the first yield
        # (avoids racing module-global \`outputs\` rebinding against fn remapping).
        await asyncio.sleep(6)
        for i in range(12):
            await asyncio.sleep(0.35)
            for o in outputs:
                yield {o: f"hi-{i}"}

    submit.click(process, outputs=outputs)

if __name__ == "__main__":
    demo.launch()
`;

const DEMO_TWO_OUTPUTS = `
import asyncio
import gradio as gr

with gr.Blocks() as demo:
    submit = gr.Button("Submit")
    out = gr.Textbox(label="out", key="1")
    out2 = gr.Textbox(label="out2", key="2")
    outputs = [out, out2]

    async def process():
        await asyncio.sleep(6)
        for i in range(12):
            await asyncio.sleep(0.35)
            for o in outputs:
                yield {o: f"hi-{i}"}

    submit.click(process, outputs=outputs)

if __name__ == "__main__":
    demo.launch()
`;

test.beforeAll(() => {
	fs.writeFileSync(demo_file, DEMO_ONE_OUTPUT, "utf8");
});

test.afterAll(() => {
	if (_process) kill_process(_process);
	if (fs.existsSync(demo_file)) fs.unlinkSync(demo_file);
});

test("in-flight generator keeps streaming after hot reload adds an output", async ({
	page
}) => {
	test.setTimeout(60 * 1000);

	const out = page.getByRole("textbox", { name: "out", exact: true });
	const out2 = page.getByRole("textbox", { name: "out2", exact: true });

	try {
		const { _process: server_process, port } = await launch_app_background(
			`gradio ${demo_file}`,
			process.cwd()
		);
		_process = server_process;

		await page.goto(`http://localhost:${port}`);
		await page.waitForTimeout(2_000);

		await page.getByRole("button", { name: "Submit" }).click();
		// Reload while the generator is still in its initial sleep.
		await page.waitForTimeout(1_000);
		fs.writeFileSync(demo_file, DEMO_TWO_OUTPUTS, "utf8");

		await expect(out2).toBeVisible({ timeout: 15_000 });
		await expect(page.getByText("Connection Lost")).toHaveCount(0);

		await expect(out).toHaveValue(/hi-[0-9]+/, { timeout: 20_000 });
		const value_after_reload = await out.inputValue();

		await expect
			.poll(async () => out.inputValue(), { timeout: 15_000 })
			.not.toBe(value_after_reload);

		const later = await out.inputValue();
		expect(Number(later.replace("hi-", ""))).toBeGreaterThan(
			Number(value_after_reload.replace("hi-", ""))
		);
		await expect(out2).toHaveValue(/hi-[0-9]+/, { timeout: 10_000 });
		await expect(page.getByText("Connection Lost")).toHaveCount(0);
	} finally {
		if (_process) kill_process(_process);
	}
});
