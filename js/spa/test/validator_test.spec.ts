import { test, expect } from "@self/tootils";

async function error_modal_showed(page) {
	const toast = page.getByTestId("toast-body");
	expect(toast).toContainText("Error");
	const close = page.getByTestId("toast-close");
	await close.click();
	await expect(page.getByTestId("toast-body")).toHaveCount(0);
}

test(`Errors during validation are properly shown in an error toast`, async ({
	page
}) => {
	await page.getByRole("tab", { name: "Validation Error" }).click();

	await page.locator("button", { hasText: /Raise Validation Error/ }).click();
	await error_modal_showed(page);
});
