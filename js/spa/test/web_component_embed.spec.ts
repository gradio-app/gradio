import { test, expect } from "@self/tootils";

// Verifies that a Gradio app can be embedded with the `<gradio-app>` web
// component, and that detaching + re-attaching the element re-mounts cleanly
// (regression test for the `this.app.$destroy is not a function` bug, #12507).

test("app embeds and renders via the <gradio-app> web component", async ({
	page
}) => {
	// The fixture has already launched the app and navigated to it.
	const app_url = new URL(page.url()).origin;

	const page_errors: string[] = [];
	page.on("pageerror", (e) => page_errors.push(e.message));

	// Build a plain host page that loads the app's web-component bundle and
	// embeds it (same origin as the launched app).
	await page.setContent(`
		<h1>Host page</h1>
		<div id="slot"></div>
		<script type="module">
			const html = await (await fetch("/")).text();
			const entry = html.match(/assets\\/index-[A-Za-z0-9_-]+\\.js/)[0];
			await import("/" + entry);
			await customElements.whenDefined("gradio-app");
			document.getElementById("slot").innerHTML =
				'<gradio-app src="${app_url}"></gradio-app>';
		</script>
	`);

	const embed = page.locator("gradio-app");
	await expect(embed.getByRole("button", { name: "Greet" })).toBeVisible({
		timeout: 20_000
	});

	// #12507: detaching and re-attaching re-runs connectedCallback with
	// `this.app` already set. The buggy version threw
	// `TypeError: this.app.$destroy is not a function`; it must now re-mount.
	await page.evaluate(() => {
		const slot = document.getElementById("slot");
		const el = slot?.querySelector("gradio-app");
		if (el) {
			el.remove();
			slot?.appendChild(el);
		}
	});

	await expect(embed.getByRole("button", { name: "Greet" })).toBeVisible({
		timeout: 20_000
	});
	expect(
		page_errors.filter((e) => /\$destroy is not a function/.test(e))
	).toHaveLength(0);
});
