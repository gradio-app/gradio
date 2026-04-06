import { test, expect } from "@self/tootils";

test("fill_height with empty footer_links does not cause infinite height", async ({
	page,
}) => {
	const wrap = page.locator(".wrap");
	const viewportHeight = page.viewportSize()!.height;

	const wrapHeight = await wrap.evaluate((el) => el.scrollHeight);

	expect(wrapHeight).toBeLessThanOrEqual(viewportHeight);
});
