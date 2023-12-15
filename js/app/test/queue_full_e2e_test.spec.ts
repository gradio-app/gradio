import { test, expect } from "@playwright/test";
import { launch_app_background, kill_process } from "./utils";

test("When the queue is full the queue full message gets shown. Also when there is an exception in a user function the queue does not get blocked", async ({
	page
}) => {
	const { port, process } = await launch_app_background(
		"python ../../demo/queue_full_e2e_test/run.py"
	);
	// const labels = [
	//     "First Call",
	//     "Second Call",
	//     "Third Call",
	//     "Fourth Call"
	// ]
	console.log("port", port);
	await page.goto(`http://localhost:${port}`);
	await page.pause();
	await page.getByRole("button", { name: "First Call" }).click();
	await page.getByRole("button", { name: "Second Call" }).click();
	await page.getByRole("button", { name: "Third Call" }).click();
	await page.getByRole("button", { name: "Fourth Call" }).click();

	// await Promise.all(labels.map(async (label) =>
	//     page.getByRole("button", { name: label }).click()));

	try {
		await expect(page.getByTestId("toast-body")).toHaveCount(2, {
			timeout: 10000
		});
		const all_toast = (await page.getByTestId("toast-body").all()).map(
			async (t) => await t.innerText()
		);
		const all_text = await Promise.all(all_toast);

		expect(all_text.join("\n")).toContain("This is a gradio error");
		expect(all_text.join("\n")).toContain("application is too busy");

		await expect
			.poll(async () => page.getByLabel("First Result").inputValue())
			.toBeTruthy();
		await expect
			.poll(async () => page.getByLabel("First Result").inputValue())
			.toBeTruthy();
	} finally {
		await kill_process(process);
	}
});
