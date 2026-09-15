import { test, expect } from "@self/tootils";

test("Clicking on examples should properly run the function", async ({
	page
}) => {
	const examples = page.locator(".gallery > .gallery-item");
	await expect(examples).toHaveCount(2);
	const local_example = examples.nth(1);
	await expect(local_example).toBeVisible();
	await local_example.click();
	await expect(page.getByLabel("Example Ran")).toHaveValue("1");
});
