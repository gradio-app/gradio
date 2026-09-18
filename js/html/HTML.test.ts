import { test, describe, afterEach, expect } from "vitest";
import {
	cleanup,
	fireEvent,
	mock_client,
	render,
	waitFor
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import HTML from "./Index.svelte";
import HTMLWithChildren from "./WithChildren.svelte";

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

function reset_document(): void {
	for (const script of Array.from(document.scripts)) {
		if (script.textContent?.includes("__htmlHeadRuns")) script.remove();
	}
	delete (window as any).__htmlWatchConnections;
	delete (window as any).__htmlHeadRuns;
}

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
		reset_document();
	});

	test("renders the value through the default template", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			value: "hello world"
		});

		await waitFor(() => expect(getByText("hello world")).toBeVisible());
	});

	test("renders an empty component when the value is null", async () => {
		const { container } = await render(HTML, {
			...default_props,
			value: null
		});

		expect(container).not.toHaveTextContent("null");
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

describe("Props: html_template", () => {
	afterEach(() => {
		cleanup();
		reset_document();
	});

	test("wraps the value in the template's markup", async () => {
		const { getByRole } = await render(HTML, {
			...default_props,
			html_template: "<h2>${value}</h2>",
			value: "A heading"
		});

		await waitFor(() =>
			expect(getByRole("heading", { name: "A heading" })).toBeVisible()
		);
	});

	test("interpolates extra props alongside the value", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			html_template: "<p>${greeting}, ${name}!</p>",
			props: { greeting: "Hello", name: "Ada" }
		});

		await waitFor(() => expect(getByText("Hello, Ada!")).toBeVisible());
	});

	test("supports handlebars expressions", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			html_template: "{{#if show}}<p>visible branch</p>{{/if}}",
			props: { show: true }
		});

		await waitFor(() => expect(getByText("visible branch")).toBeVisible());
	});

	test("a handlebars conditional can hide part of the template", async () => {
		const { queryByText } = await render(HTML, {
			...default_props,
			html_template: "{{#if show}}<p>visible branch</p>{{/if}}",
			props: { show: false }
		});

		await waitFor(() =>
			expect(queryByText("visible branch")).not.toBeInTheDocument()
		);
	});

	test("renders a template that ignores the value entirely", async () => {
		const { getByText, queryByText } = await render(HTML, {
			...default_props,
			html_template: "<p>static markup</p>",
			value: "ignored"
		});

		await waitFor(() => expect(getByText("static markup")).toBeVisible());
		expect(queryByText("ignored")).not.toBeInTheDocument();
	});

	test("a broken template renders an error naming the component class", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			component_class_name: "MyCustomHTML",
			html_template: "${does_not_exist}"
		});

		await waitFor(() => {
			expect(getByText("MyCustomHTML")).toBeVisible();
		});
	});

	test("a broken template shows the underlying error message", async () => {
		const { container } = await render(HTML, {
			...default_props,
			html_template: "${does_not_exist}"
		});

		await waitFor(() => {
			expect(container).toHaveTextContent("does_not_exist is not defined");
		});
	});
});

describe("Props: css_template", () => {
	afterEach(() => {
		cleanup();
		reset_document();
	});

	function styles_containing(marker: string): HTMLStyleElement[] {
		return Array.from(document.head.querySelectorAll("style")).filter((s) =>
			s.textContent?.includes(marker)
		);
	}

	test("injects the rendered CSS into the document head", async () => {
		await render(HTML, {
			...default_props,
			css_template: "color: rgb(1, 2, 3);"
		});

		await waitFor(() => {
			expect(styles_containing("color: rgb(1, 2, 3);")).toHaveLength(1);
		});
	});

	test("scopes the CSS to this instance's root element", async () => {
		const { container } = await render(HTML, {
			...default_props,
			css_template: "color: rgb(4, 5, 6);"
		});

		await waitFor(() => {
			expect(styles_containing("color: rgb(4, 5, 6);")).toHaveLength(1);
		});

		const rule = styles_containing("color: rgb(4, 5, 6);")[0].textContent!;
		const scoped_id = rule.slice(rule.indexOf("#") + 1, rule.indexOf(" {"));
		expect(container.querySelector(`#${scoped_id}`)).not.toBeNull();
	});

	test("interpolates props into the CSS", async () => {
		await render(HTML, {
			...default_props,
			css_template: "color: ${shade};",
			props: { shade: "rgb(7, 8, 9)" }
		});

		await waitFor(() => {
			expect(styles_containing("color: rgb(7, 8, 9);")).toHaveLength(1);
		});
	});

	test("two instances get independently scoped CSS", async () => {
		await render(HTML, { ...default_props, css_template: "opacity: 0.11;" });
		await render(HTML, { ...default_props, css_template: "opacity: 0.11;" });

		await waitFor(() => {
			expect(styles_containing("opacity: 0.11;")).toHaveLength(2);
		});

		const [first, second] = styles_containing("opacity: 0.11;");
		expect(first.textContent).not.toBe(second.textContent);
	});

	test("the injected style element is removed when the component unmounts", async () => {
		const view = await render(HTML, {
			...default_props,
			css_template: "letter-spacing: 3px;"
		});

		await waitFor(() => {
			expect(styles_containing("letter-spacing: 3px;")).toHaveLength(1);
		});

		view.unmount();

		await waitFor(() => {
			expect(styles_containing("letter-spacing: 3px;")).toHaveLength(0);
		});
	});

	test("a broken CSS template renders an error instead of the content", async () => {
		const { container } = await render(HTML, {
			...default_props,
			css_template: "color: ${missing_colour};"
		});

		await waitFor(() => {
			expect(container).toHaveTextContent("missing_colour is not defined");
		});
	});
});

describe("Props: head", () => {
	afterEach(() => {
		cleanup();
		reset_document();
	});

	test("injects a stylesheet link into the document head", async () => {
		const href = URL.createObjectURL(
			new Blob([".probe {}"], { type: "text/css" })
		);
		await render(HTML, {
			...default_props,
			head: `<link rel="stylesheet" href="${href}">`
		});

		await waitFor(() => {
			expect(
				Array.from(document.head.querySelectorAll("link")).filter(
					(l) => l.href === href
				)
			).toHaveLength(1);
		});
	});

	test("the same stylesheet is not injected twice by two instances", async () => {
		const href = URL.createObjectURL(
			new Blob([".probe-dedupe {}"], { type: "text/css" })
		);
		const head = `<link rel="stylesheet" href="${href}">`;

		await render(HTML, { ...default_props, head });
		await render(HTML, { ...default_props, head });

		await waitFor(() => {
			expect(
				Array.from(document.head.querySelectorAll("link")).filter(
					(l) => l.href === href
				)
			).toHaveLength(1);
		});
	});

	test("a head script runs before js_on_load", async () => {
		const src = URL.createObjectURL(
			new Blob(["window.__head_order = 'script';"], {
				type: "application/javascript"
			})
		);

		const { getByText } = await render(HTML, {
			...default_props,
			html_template: "<div class='order'>pending</div>",
			head: `<script src="${src}"></scr` + `ipt>`,
			js_on_load: `element.querySelector('.order').textContent = window.__head_order || 'missing';`
		});

		await waitFor(() => expect(getByText("script")).toBeInTheDocument());
	});
});

describe("Props: js_on_load", () => {
	afterEach(() => {
		cleanup();
		reset_document();
	});

	test("receives the component's root element", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			html_template: "<div class='target'>before</div>",
			js_on_load: `element.querySelector('.target').textContent = 'after';`
		});

		await waitFor(() => expect(getByText("after")).toBeVisible());
	});

	test("trigger('click') dispatches a click event", async () => {
		const { listen } = await render(HTML, {
			...default_props,
			js_on_load: `trigger('click');`
		});
		const click = listen("click", { retrospective: true });

		await waitFor(() => expect(click).toHaveBeenCalledTimes(1));
	});

	test("trigger('submit') dispatches a submit event with its payload", async () => {
		const { listen } = await render(HTML, {
			...default_props,
			js_on_load: `trigger('submit', { field: 'value' });`
		});
		const submit = listen("submit", { retrospective: true });

		await waitFor(() => {
			expect(submit).toHaveBeenCalledWith({ field: "value" });
		});
	});

	test("a click listener added in js_on_load fires on a real click", async () => {
		const { listen, getByRole } = await render(HTML, {
			...default_props,
			html_template: "<button>press me</button>",
			js_on_load: `element.addEventListener('click', () => trigger('click'));`
		});
		const click = listen("click");

		await fireEvent.click(getByRole("button", { name: "press me" }));

		expect(click).toHaveBeenCalledTimes(1);
	});

	test("writing to props.value re-renders the template", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			value: "before",
			js_on_load: `props.value = 'after';`
		});

		await waitFor(() => expect(getByText("after")).toBeVisible());
	});

	test("writing to props.value updates the component's data", async () => {
		const { get_data } = await render(HTML, {
			...default_props,
			value: "before",
			js_on_load: `props.value = 'after';`
		});

		await waitFor(async () => {
			expect((await get_data()).value).toBe("after");
		});
	});

	test("writing to props.label updates the rendered label", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			label: "Original",
			js_on_load: `props.label = 'Rewritten';`
		});

		await waitFor(() => expect(getByText("Rewritten")).toBeVisible());
	});

	test("watch fires when the watched prop changes", async () => {
		const { getByText, set_data } = await render(HTML, {
			...default_props,
			html_template: "<div class='count'>0</div>",
			props: { colour: "red" },
			js_on_load: `let n = 0; watch('colour', () => { element.querySelector('.count').textContent = String(++n); });`
		});

		await set_data({ props: { colour: "blue" } });

		await waitFor(() => expect(getByText("1")).toBeInTheDocument());
	});

	test("watch does not fire for props it is not watching", async () => {
		const { getByText, set_data } = await render(HTML, {
			...default_props,
			html_template: "<div class='count'>untouched</div>",
			props: { colour: "red", size: 1 },
			js_on_load: `watch('colour', () => { element.querySelector('.count').textContent = 'fired'; });`
		});

		await set_data({ props: { colour: "red", size: 2 } });

		await waitFor(() => expect(getByText("untouched")).toBeInTheDocument());
	});

	test("watch accepts a list of props", async () => {
		const { getByText, set_data } = await render(HTML, {
			...default_props,
			html_template: "<div class='count'>0</div>",
			props: { colour: "red", size: 1 },
			js_on_load: `let n = 0; watch(['colour', 'size'], () => { element.querySelector('.count').textContent = String(++n); });`
		});

		await set_data({ props: { colour: "red", size: 2 } });

		await waitFor(() => expect(getByText("1")).toBeInTheDocument());
	});

	test("a watch callback that throws does not break later renders", async () => {
		const { getByText, set_data } = await render(HTML, {
			...default_props,
			html_template: "${value}",
			js_on_load: `watch('value', () => { throw new Error('boom'); });`
		});

		await set_data({ value: "still rendering" });

		await waitFor(() => expect(getByText("still rendering")).toBeVisible());
	});

	test("an error thrown in js_on_load leaves the rendered template intact", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			value: "survives",
			js_on_load: `throw new Error('js_on_load exploded');`
		});

		await waitFor(() => expect(getByText("survives")).toBeVisible());
	});

	test("server functions are callable from js_on_load", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			html_template: "<div class='result'>pending</div>",
			server: {
				lookup: async (name: string) => `found:${name}`
			},
			js_on_load: `server.lookup('ada').then((r) => { element.querySelector('.result').textContent = r; });`
		});

		await waitFor(() => expect(getByText("found:ada")).toBeVisible());
	});

	test("upload returns the stored path for a file", async () => {
		const { getByText } = await render(HTML, {
			...default_props,
			html_template: "<div class='result'>pending</div>",
			client: mock_client(),
			root: "",
			js_on_load: `upload(new File(['abc'], 'notes.txt', { type: 'text/plain' })).then(({ path }) => { element.querySelector('.result').textContent = path; });`
		});

		await waitFor(() => expect(getByText("notes.txt")).toBeVisible());
	});

	test("a failed upload dispatches an error event", async () => {
		const { listen } = await render(HTML, {
			...default_props,
			client: {
				upload: async () => {
					throw new Error("upload rejected");
				}
			},
			root: "",
			js_on_load: `upload(new File(['abc'], 'notes.txt')).catch(() => {});`
		});
		const error = listen("error", { retrospective: true });

		await waitFor(() => {
			expect(error).toHaveBeenCalledWith("upload rejected");
		});
	});
});

describe("Props: buttons", () => {
	afterEach(() => {
		cleanup();
		reset_document();
	});

	test("a custom button is rendered with its label", async () => {
		const { getByLabelText } = await render(HTML, {
			...default_props,
			show_label: true,
			buttons: [{ value: "Analyze", id: 7, icon: null }]
		});

		expect(getByLabelText("Analyze")).toBeVisible();
	});

	test("clicking a custom button dispatches custom_button_click with its id", async () => {
		const { listen, getByLabelText } = await render(HTML, {
			...default_props,
			show_label: true,
			buttons: [{ value: "Analyze", id: 7, icon: null }]
		});
		const custom = listen("custom_button_click");

		await fireEvent.click(getByLabelText("Analyze"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 7 });
	});

	test("each button reports its own id", async () => {
		const { listen, getByLabelText } = await render(HTML, {
			...default_props,
			show_label: true,
			buttons: [
				{ value: "First", id: 1, icon: null },
				{ value: "Second", id: 2, icon: null }
			]
		});
		const custom = listen("custom_button_click");

		await fireEvent.click(getByLabelText("Second"));

		expect(custom).toHaveBeenCalledWith({ id: 2 });
	});

	test("no buttons are rendered when the list is null", async () => {
		const { queryByRole } = await render(HTML, {
			...default_props,
			show_label: true,
			buttons: null
		});

		expect(queryByRole("button")).not.toBeInTheDocument();
	});

	test("buttons are hidden along with the label when show_label is false", async () => {
		const { queryByLabelText } = await render(HTML, {
			...default_props,
			show_label: false,
			buttons: [{ value: "Analyze", id: 7, icon: null }]
		});

		expect(queryByLabelText("Analyze")).not.toBeInTheDocument();
	});
});

describe("Children", () => {
	afterEach(() => {
		cleanup();
		reset_document();
	});

	test("renders children in place of the @children marker", async () => {
		const { getByTestId } = await render(HTMLWithChildren, {
			...default_props,
			html_template: "<p>before</p>@children<p>after</p>"
		});

		await waitFor(() => expect(getByTestId("slot-content")).toBeVisible());
	});

	test("renders the markup on both sides of @children", async () => {
		const { getByText } = await render(HTMLWithChildren, {
			...default_props,
			html_template: "<p>before</p>@children<p>after</p>"
		});

		await waitFor(() => {
			expect(getByText("before")).toBeVisible();
			expect(getByText("after")).toBeVisible();
		});
	});

	test("children come between the two template halves in document order", async () => {
		const { getByText, getByTestId } = await render(HTMLWithChildren, {
			...default_props,
			html_template: "<p>before</p>@children<p>after</p>"
		});

		await waitFor(() => expect(getByText("after")).toBeVisible());

		const child = getByTestId("slot-content");
		expect(
			getByText("before").compareDocumentPosition(child) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeGreaterThan(0);
		expect(
			child.compareDocumentPosition(getByText("after")) &
				Node.DOCUMENT_POSITION_FOLLOWING
		).toBeGreaterThan(0);
	});

	test("a template without @children still renders its children's host markup", async () => {
		const { getByText, queryByTestId } = await render(HTMLWithChildren, {
			...default_props,
			html_template: "<p>no marker</p>"
		});

		await waitFor(() => expect(getByText("no marker")).toBeVisible());
		expect(queryByTestId("slot-content")).not.toBeInTheDocument();
	});
});

describe("Events", () => {
	afterEach(() => {
		cleanup();
		reset_document();
	});

	test("change is not dispatched on mount", async () => {
		const { listen } = await render(HTML, default_props);
		const change = listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();
	});

	test("change is dispatched when the value is updated", async () => {
		const { listen, set_data } = await render(HTML, default_props);
		const change = listen("change");

		await set_data({ value: "updated" });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change is not dispatched when the value is set to the same string", async () => {
		const { listen, set_data } = await render(HTML, default_props);
		const change = listen("change");

		await set_data({ value: "initial" });

		expect(change).not.toHaveBeenCalled();
	});

	test("change is dispatched once per distinct value", async () => {
		const { listen, set_data } = await render(HTML, default_props);
		const change = listen("change");

		await set_data({ value: "one" });
		await set_data({ value: "two" });

		expect(change).toHaveBeenCalledTimes(2);
	});

	test("clear_status is dispatched when the error status is dismissed", async () => {
		const { listen, getByLabelText } = await render(HTML, {
			...default_props,
			loading_status: {
				status: "error",
				queue_position: null,
				queue_size: null,
				eta: null,
				message: "it broke",
				show_progress: "full",
				scroll_to_output: false,
				visible: true,
				fn_index: 0
			}
		});
		const clear_status = listen("clear_status");

		await fireEvent.click(getByLabelText("common.clear"));

		expect(clear_status).toHaveBeenCalledTimes(1);
	});
});

describe("get_data / set_data", () => {
	afterEach(() => {
		cleanup();
		reset_document();
	});

	test("get_data returns the current value", async () => {
		const { get_data } = await render(HTML, {
			...default_props,
			value: "current"
		});

		expect((await get_data()).value).toBe("current");
	});

	test("set_data updates the rendered output", async () => {
		const { set_data, getByText } = await render(HTML, default_props);

		await set_data({ value: "from the server" });

		await waitFor(() => expect(getByText("from the server")).toBeVisible());
	});

	test("set_data round-trips through get_data", async () => {
		const { set_data, get_data } = await render(HTML, default_props);

		await set_data({ value: "<b>bold</b>" });

		expect((await get_data()).value).toBe("<b>bold</b>");
	});

	test("set_data can replace the template as well as the value", async () => {
		const { set_data, getByRole } = await render(HTML, default_props);

		await set_data({ html_template: "<h3>${value}</h3>", value: "titled" });

		await waitFor(() =>
			expect(getByRole("heading", { name: "titled" })).toBeVisible()
		);
	});

	test("set_data updates an interpolated prop without touching the value", async () => {
		const { set_data, getByText } = await render(HTML, {
			...default_props,
			html_template: "<p>${label_text}: ${value}</p>",
			value: "kept",
			props: { label_text: "before" }
		});

		await set_data({ props: { label_text: "after" } });

		await waitFor(() => expect(getByText("after: kept")).toBeVisible());
	});

	test("a null value set from the server clears the rendered content", async () => {
		const { set_data, queryByText } = await render(HTML, {
			...default_props,
			value: "something"
		});

		await set_data({ value: null });

		await waitFor(() =>
			expect(queryByText("something")).not.toBeInTheDocument()
		);
	});
});

test.todo(
	"VISUAL: apply_default_css=true applies Gradio's prose styling to the rendered markup — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: apply_default_css=false leaves the rendered markup unstyled — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: min_height sets a minimum height on the html container once loading finishes — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: max_height caps the html container's height and makes it scroll — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: a pending loading_status fades the html container to 20% opacity — needs Playwright visual regression screenshot comparison"
);
test.todo(
	"VISUAL: show_label adds top padding to the html container so the floating label does not overlap it — needs Playwright visual regression screenshot comparison"
);
