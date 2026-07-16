import { test, expect } from "@self/tootils";

test("No errors on generation", async ({ page }) => {
	test.setTimeout(60_000);
	await page.getByRole("button", { name: "Start" }).click();
	const conversation = page.getByLabel("chatbot conversation");
	const num_a = page.getByLabel("a", { exact: true });
	const num_b = page.getByLabel("b", { exact: true });
	const num_c = page.getByLabel("c", { exact: true });
	const num_d = page.getByLabel("d", { exact: true });

	// Three event chains (chatbot, a/b, c/d — 22 events each, 66 total) all
	// share Gradio's single-threaded queue. Wait first on the LAST chatbot
	// message (deterministic end-of-chain signal for the chatbot chain). By
	// then the queue has drained ~22 of 44 number events too, so the number
	// assertions only have a handful of events left to wait on.
	await expect(conversation).toContainText("22 22 22 22 22 22 22 22 22 22", {
		timeout: 30_000
	});
	await expect(num_a).toHaveValue("22");
	await expect(num_b).toHaveValue("21");
	await expect(num_c).toHaveValue("22");
	await expect(num_d).toHaveValue("21");
});
