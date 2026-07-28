import { expect, test } from "@self/tootils";

test("shared props reach affected components in a running app", async ({
	page
}) => {
	await page.emulateMedia({ colorScheme: "dark" });
	await page.reload();

	await expect(page.locator("#panel-column")).toHaveClass(/\bpanel\b/);
	await expect(page.locator("#compact-column")).toHaveClass(/\bcompact\b/);

	await expect(page.locator("#padded-html")).toHaveClass(/\bpadded\b/);
	await expect(page.locator("#unpadded-html")).not.toHaveClass(/\bpadded\b/);

	await expect(page.locator("#shared-json .json-node.root")).toHaveClass(
		/\bdark-mode\b/
	);

	const plot = page.locator("#shared-plot [data-testid='matplotlib'] img");
	await expect(plot).toBeVisible();
	await expect
		.poll(() => plot.evaluate((image: HTMLImageElement) => image.naturalWidth))
		.toBeGreaterThan(0);

	const scaled_tab = page.getByRole("tabpanel").filter({
		has: page.getByText("Scaled tab content")
	});
	await expect(scaled_tab).toHaveCSS("flex-grow", "2");

	const dataset_image = page.locator("#shared-dataset img");
	await expect(dataset_image).toBeVisible();
	await expect
		.poll(() =>
			dataset_image.evaluate((image: HTMLImageElement) => image.naturalWidth)
		)
		.toBeGreaterThan(0);

	await page.getByRole("button", { name: "Validate text" }).click();
	await expect(page.getByText("Text is required")).toBeVisible();

	await page.getByLabel("Validated text").fill("valid value");
	await expect(page.getByText("Text is required")).toBeHidden();

	await page.getByRole("button", { name: "Validate text" }).click();
	await expect(page.getByLabel("Validated output")).toHaveValue("valid value");
});
