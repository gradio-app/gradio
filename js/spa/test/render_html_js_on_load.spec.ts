import { expect, test } from "@self/tootils";

test("js_on_load runs when gr.render replaces an HTML component", async ({
	page
}) => {
	const clicked = page.getByLabel("Clicked HTML button");

	await page
		.getByRole("button", { name: "HTML button 1", exact: true })
		.click();
	await expect(clicked).toHaveValue("HTML button 1");

	await page.getByRole("button", { name: "Add HTML button" }).click();
	const added_button = page.getByRole("button", {
		name: "HTML button 2",
		exact: true
	});
	await expect(added_button).toBeVisible();
	await added_button.click();

	await expect(clicked).toHaveValue("HTML button 2");
});
