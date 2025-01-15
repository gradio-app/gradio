import { test, expect, go_to_testcase } from "@self/tootils";

const cases = ["not_cached", "cached"];

for (const test_case of cases) {
	test(`case ${test_case}: clicked example is added to history and passed to chat function`, async ({
		page
	}) => {
		if (cases.slice(1).includes(test_case)) {
			await go_to_testcase(page, test_case);
		}

		// Click on an example and the input/response are correct
		await page.getByRole("button", { name: "hello" }).click();
		await expect(page.locator(".user p")).toContainText("hello");
		await expect(page.locator(".bot p")).toContainText(
			"You wrote: hello and uploaded 0 files."
		);
		await expect(page.locator(".user img")).not.toBeVisible();

		// Clear the chat and click on a different example, the input/response are correct
		await page.getByLabel("Clear").click();
		await page.getByRole("button", { name: "Select example 2: hola" }).click();
		await expect(page.locator(".user img")).toBeVisible();
		await expect(page.locator(".user p")).toContainText("hola");
		await expect(page.locator(".bot p")).toContainText(
			"You wrote: hola and uploaded 1 files."
		);

		// // Retry button works
		await page.getByLabel("Retry").click();
		await expect(page.locator(".user p")).toContainText("hola");
		await expect(page.locator(".bot p")).toContainText(
			"You wrote: hola and uploaded 1 files."
		);
		await expect(page.locator(".user img")).toBeVisible();

		// Undo message resets to the examples view
		await page.getByLabel("Undo", { exact: true }).click();
		await expect(page.getByRole("button", { name: "hello" })).toBeVisible();
	});
}
