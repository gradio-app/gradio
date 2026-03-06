import { test, expect } from "@self/tootils";

test.skip(
	process.env?.GRADIO_SSR_MODE?.toLowerCase() === "true",
	"Not Running SSR Mode"
);

test.skip("Gradio works behind a reverse proxy with root_path", async ({
	page
}) => {
	const url = new URL(page.url());
	await page.goto(`${url.origin}/myapp/gradio/`);

	const configResponse = await page.request.get(
		`${url.origin}/myapp/gradio/config`
	);
	const config = await configResponse.json();
	expect(config.root).toContain("/myapp/gradio");

	const uploader = page.locator("input[type=file]");
	await uploader.setInputFiles("./test/files/cheetah1.jpg");
	await page.getByRole("button", { name: "Submit" }).click();

	// Wait for the output image to load with a src URL that goes through
	// the proxied gradio_api path
	// Without the fix, the src would use /gradio/gradio_api/... (missing /myapp).
	await expect(async () => {
		const imgs = page.locator('[data-testid="image"] img');
		const count = await imgs.count();
		let foundProxiedSrc = false;
		for (let i = 0; i < count; i++) {
			const src = await imgs.nth(i).getAttribute("src");
			if (src && src.includes("/myapp/gradio/gradio_api/")) {
				foundProxiedSrc = true;
				break;
			}
		}
		expect(foundProxiedSrc).toBe(true);
	}).toPass();
});
