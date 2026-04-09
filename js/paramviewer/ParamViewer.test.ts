import { afterEach, describe, expect, test } from "vitest";
import { cleanup, fireEvent, render } from "@self/tootils/render";

import ParamViewer from "./Index.svelte";

const value = {
	foo: {
		type: "str",
		description: "See [docs](https://www.gradio.app/docs)",
		default: '"bar"',
	},
	bar: {
		type: "int",
		description: "Plain description",
		default: "1",
	},
};

describe("ParamViewer", () => {
	afterEach(cleanup);

	test("renders the header and markdown links in descriptions", async () => {
		const { getByText, container } = await render(ParamViewer, {
			value,
			header: "Parameters",
			linkify: [],
			anchor_links: false,
			max_height: undefined,
		});

		expect(getByText("Parameters")).toBeTruthy();
		const link = container.querySelector(
			'.description a[href="https://www.gradio.app/docs"]',
		) as HTMLAnchorElement | null;
		expect(link?.textContent).toBe("docs");
	});

	test("toggle-all opens every parameter details element", async () => {
		const { container, getByTitle } = await render(ParamViewer, {
			value,
			header: "Parameters",
			linkify: [],
			anchor_links: "api",
			max_height: 240,
		});

		await fireEvent.click(getByTitle("Open All"));

		const details = Array.from(
			container.querySelectorAll("details.param"),
		) as HTMLDetailsElement[];
		expect(details).toHaveLength(2);
		expect(details.every((detail) => detail.open)).toBe(true);
		expect(details[0]?.id).toBe("param-api-foo");
		expect(details[1]?.id).toBe("param-api-bar");
	});
});
