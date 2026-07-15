import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import HTML from "./Index.svelte";

const default_props = {
	value: "initial",
	label: "HTML",
	show_label: true,
	css_template: "",
	apply_default_css: true,
	component_class_name: "HTML",
	props: {},
	buttons: null,
	padding: false,
	visible: true,
	html_template: "${value}",
	head: null,
	js_on_load: null
};

run_shared_prop_tests({
	component: HTML,
	name: "HTML",
	base_props: default_props,
	// HTML omits its label entirely when show_label is false.
	has_label: false
});

describe("HTML", () => {
	afterEach(() => {
		cleanup();
		for (const script of Array.from(document.scripts)) {
			if (script.textContent?.includes("__htmlHeadRuns")) script.remove();
		}
		delete (window as any).__htmlWatchConnections;
		delete (window as any).__htmlHeadRuns;
	});

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

	test("watch callbacks are discarded when the component id changes", async () => {
		(window as any).__htmlWatchConnections = [];
		const view = await render(HTML, {
			...default_props,
			js_on_load: `watch("value", () => window.__htmlWatchConnections.push(element.isConnected));`
		});

		await view.set_data({ id: 123456789 });
		await view.set_data({ value: "updated" });

		await waitFor(() => {
			expect((window as any).__htmlWatchConnections).toEqual([true]);
		});
	});

	test("remount cleans up CSS and does not rerun inline head scripts", async () => {
		(window as any).__htmlHeadRuns = 0;
		const cssMarker = "--html-remount-probe: 1;";
		const matchingStyles = (): HTMLStyleElement[] =>
			Array.from(document.head.querySelectorAll("style")).filter((style) =>
				style.textContent?.includes(cssMarker)
			);
		const view = await render(HTML, {
			...default_props,
			css_template: cssMarker,
			head: `<script>window.__htmlHeadRuns += 1;</script>`
		});

		await waitFor(() => {
			expect(matchingStyles()).toHaveLength(1);
			expect((window as any).__htmlHeadRuns).toBe(1);
		});

		await view.set_data({ id: 123456789 });

		await waitFor(() => {
			expect((window as any).__htmlHeadRuns).toBe(1);
			expect(matchingStyles()).toHaveLength(1);
		});
	});

	test("show_label controls whether the label is rendered", async () => {
		const view = await render(HTML, {
			...default_props,
			label: "HTML label"
		});

		expect(view.getByText("HTML label")).toBeInTheDocument();

		await view.set_data({ show_label: false });

		expect(view.queryByText("HTML label")).not.toBeInTheDocument();
	});
});
