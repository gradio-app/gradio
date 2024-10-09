import { test, expect, go_to_testcase } from "@self/tootils";

const cases = [
	"messages",
	"tuples_examples",
	"multimodal_tuples_examples",
	"multimodal_messages_examples"
];

for (const test_case of cases) {
	test(`test case ${test_case} clicking example properly adds it to the history and passes the correct values to the prediction function`, async ({
		page
	}) => {
		if (cases.slice(1).includes(test_case)) {
			await go_to_testcase(page, test_case);
		}

		// Click on an example and the input/response are correct
		await page.getByRole("button", { name: "Hey" }).click();
		await expect(page.locator(".user p")).toContainText("Hey");
		await expect(page.locator(".bot p")).toContainText("Hey");

		// Clear the chat and click on a different example, the input/response are correct
		await page.getByLabel("Clear").click();
		await page
			.getByRole("button", { name: "Can you explain briefly to me" })
			.click();
		await expect(page.locator(".user p")).toContainText(
			"Can you explain briefly to me what is the Python programming language?"
		);
		await expect(page.locator(".bot p")).toContainText(
			"Can you explain briefly to me what is the Python programming language?"
		);

		// Retry button works
		await page.getByLabel("Retry").click();
		await expect(page.locator(".user p")).toContainText(
			"Can you explain briefly to me what is the Python programming language?"
		);
		await expect(page.locator(".bot p")).toContainText(
			"Can you explain briefly to me what is the Python programming language?"
		);

		// Undo message resets to the examples view
		await page.getByLabel("Undo", { exact: true }).click();
		await expect(page.getByRole("button", { name: "Hey" })).toBeVisible();
	});
}
