import { test, expect } from "@self/tootils";

test("DeepLinkButton correctly saves and loads multimodal chatinterface conversation state", async ({
	page,
	context
}) => {
	const textbox = await page.getByTestId("textbox");
	await textbox.fill("hello");

	await page.keyboard.press("Enter");

	await expect(
		page.getByTestId("bot").first().getByRole("paragraph")
	).toContainText("You typed: hello");

	await page.getByRole("button", { name: "Share via Link" }).click();
	await page.waitForTimeout(1000);
	const clipboardText: string = await page.evaluate(
		"navigator.clipboard.readText()"
	);
	console.log("clipboardText", clipboardText);

	// Open a new tab
	const newPage = await context.newPage();

	await newPage.goto(clipboardText);

	await expect(
		newPage.getByTestId("bot").first().getByRole("paragraph")
	).toContainText("You typed: hello");
});
