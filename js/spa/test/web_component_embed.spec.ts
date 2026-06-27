import { test, expect } from "@self/tootils";

// Verifies that a Gradio app can be embedded with the `<gradio-app>` web
// component, and that detaching + re-attaching the element re-mounts cleanly
// (regression test for the `this.app.$destroy is not a function` bug, #12507).

// Skipped in SSR mode only because of how this test *discovers* the bundle:
// it scrapes the app's index HTML for the `assets/index-*.js` entry, but in SSR
// mode the page is served via SvelteKit (`/_app/...`) and doesn't reference it.
// Embedding itself works fine against an SSR app (the bundle is still served and
// the web component renders from `/config`) — this is purely a harness limitation.
test.skip(
	process.env?.GRADIO_SSR_MODE?.toLowerCase() === "true",
	"test discovers the web-component bundle from the client-rendered index HTML"
);

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
