import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";

import HTML from "./Index.svelte";

describe("HTML shared head scripts", () => {
	afterEach(() => cleanup());

	test("js_on_load waits for a head script another instance is already loading", async () => {
		const src = URL.createObjectURL(
			new Blob(["window.__shared_lib = true;"], {
				type: "application/javascript"
			})
		);
		const head = `<script src="${src}"></scr` + `ipt>`;

		const make = (label: string): Record<string, any> => ({
			value: "",
			css_template: "",
			apply_default_css: true,
			component_class_name: "HTML",
			props: {},
			buttons: null,
			padding: false,
			visible: true,
			html_template: `<div class='res-${label}'>pending</div>`,
			head,
			js_on_load: `element.querySelector('.res-${label}').textContent = window.__shared_lib === true ? '${label}:loaded' : '${label}:missing';`
		});

		// Mount both synchronously so the second instance dedupes the first's
		// in-flight script load instead of finding it already executed. Without
		// the in-flight wait, the second runs js_on_load before the shared
		// library has loaded and reads it as "missing" (issue #13528).
		const [, second] = await Promise.all([
			render(HTML, make("first")),
			render(HTML, make("second"))
		]);

		await waitFor(() => {
			expect(second.getByText("first:loaded")).toBeInTheDocument();
			expect(second.getByText("second:loaded")).toBeInTheDocument();
		});
	});
});
