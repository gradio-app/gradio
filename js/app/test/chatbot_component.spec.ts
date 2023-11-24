import { test, expect } from "@gradio/tootils";

test("chatbot like and dislike functionality", async ({ page }) => {
	const textbox = await page.getByTestId("textbox");

	await textbox.click();
	await page.getByTestId("textbox").fill("hello");
	await page.getByLabel("like", { exact: true }).click();
	expect(await page.getByLabel("clicked like").count()).toEqual(1);

	await page.getByTestId("textbox").click();
	await page.getByTestId("textbox").fill("how are you?");

	await page.getByLabel("dislike").nth(1).click();
	await page.getByLabel("like", { exact: true }).click();

	expect(await page.getByLabel("clicked dislike").count()).toEqual(0);
});
