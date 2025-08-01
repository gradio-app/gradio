import { test, expect } from "@self/tootils";
import { isContext } from "vm";

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

	// Open a new tab
	const newPage = await context.newPage();

	await newPage.goto(clipboardText);

	await expect(
		newPage.getByTestId("bot").first().getByRole("paragraph")
	).toContainText("You typed: hello");
});

test("DeepLinkButton correctly saves and loads cached_examples", async ({
	page,
	context
}) => {
	await page.getByRole("link", { name: "cached_examples" }).click();
	await page.locator(".table").first().click();
	await page.getByRole("button", { name: "Share via Link" }).click();
	await page.waitForTimeout(1000);
	const clipboardText: string = await page.evaluate(
		"navigator.clipboard.readText()"
	);

	const newPage = await context.newPage();

	await newPage.goto(clipboardText);
	await expect(page.getByLabel("Output")).toHaveValue("Hello: Freddy");
});
