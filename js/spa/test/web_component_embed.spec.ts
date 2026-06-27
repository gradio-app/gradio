import { test, expect } from "@self/tootils";

// Embeds an app with the `<gradio-app>` web component and re-attaches the
// element, a regression test for `this.app.$destroy is not a function` (#12507).

// Skipped in SSR mode: the test discovers the bundle from the index HTML, which
// SSR (SvelteKit) doesn't expose. Embedding itself works fine against an SSR app.
test.skip(
	process.env?.GRADIO_SSR_MODE?.toLowerCase() === "true",
	"test discovers the web-component bundle from the client-rendered index HTML"
);

test("app embeds and renders via the <gradio-app> web component", async ({
	page
}) => {
	const app_url = new URL(page.url()).origin;

	const page_errors: string[] = [];
	page.on("pageerror", (e) => page_errors.push(e.message));

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

	// #12507: re-attaching re-runs connectedCallback with `this.app` already set.
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
