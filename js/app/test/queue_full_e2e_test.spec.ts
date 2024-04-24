import { test, expect } from "@gradio/tootils";

test("When the queue is full the queue full message gets shown. Also when there is an exception in a user function the queue does not get blocked", async ({
	page
}) => {
	await page.pause();
	await page.getByRole("button", { name: "First Call" }).click();
	await page.getByRole("button", { name: "Second Call" }).click();
	await page.getByRole("button", { name: "Third Call" }).click();
	await page.getByRole("button", { name: "Fourth Call" }).click();

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
});
