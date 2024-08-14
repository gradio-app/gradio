import { test, expect } from "@gradio/tootils";

test("No errors on generation", async ({ page }) => {
	await page.getByRole("button", { name: "Start" }).click();
	const conversation = page.getByLabel("chatbot conversation");
	const num_a = page.getByLabel("a", { exact: true });
	const num_b = page.getByLabel("b", { exact: true });
	const num_c = page.getByLabel("c", { exact: true });
	const num_d = page.getByLabel("d", { exact: true });

	await expect(conversation).toContainText("26 26 26 26 26 26 26 26");
	await expect(num_a).toHaveValue("52");
	await expect(num_b).toHaveValue("51");
	await expect(num_c).toHaveValue("52");
	await expect(num_d).toHaveValue("51");
});
