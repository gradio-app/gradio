import { test, expect } from "@self/tootils";

test("No errors on generation", async ({ page }) => {
	await page.getByRole("button", { name: "Start" }).click();
	const conversation = page.getByLabel("chatbot conversation");
	const num_a = page.getByLabel("a", { exact: true });
	const num_b = page.getByLabel("b", { exact: true });
	const num_c = page.getByLabel("c", { exact: true });
	const num_d = page.getByLabel("d", { exact: true });

	await expect(conversation).toContainText("11 11 11 11 11 11 11 11");
	await expect(num_a).toHaveValue("22");
	await expect(num_b).toHaveValue("21");
	await expect(num_c).toHaveValue("22");
	await expect(num_d).toHaveValue("21");
});
