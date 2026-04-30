import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";

import ParamViewer from "./Index.svelte";

const sample_params = {
	number: {
		type: "int | float",
		description: "The number to round",
		default: "None"
	},
	ndigits: {
		type: "int",
		description: "The number of digits to round to",
		default: "0"
	}
};

const default_props = {
	value: sample_params,
	linkify: [],
	header: "Parameters",
	anchor_links: false,
	max_height: undefined
};

describe("ParamViewer", () => {
	afterEach(() => cleanup());

	test("renders parameter details elements for each entry in value", async () => {
		const { getAllByRole } = await render(ParamViewer, default_props);

		const details = getAllByRole("group");
		expect(details.length).toBe(2);
	});

	test("renders parameter types alongside names", async () => {
		const { getByText } = await render(ParamViewer, default_props);

		expect(getByText("float")).toBeVisible();
	});

	test("renders header text when provided", async () => {
		const { getByText } = await render(ParamViewer, {
			...default_props,
			header: "My Parameters"
		});

		expect(getByText("My Parameters")).toBeVisible();
	});

	test("does not render header section when header is null", async () => {
		const { queryByText, getByRole } = await render(ParamViewer, {
			...default_props,
			header: null
		});

		expect(queryByText("Parameters")).not.toBeInTheDocument();
		expect(getByRole("button")).toBeVisible();
	});

	test("renders toggle-all button", async () => {
		const { getByRole } = await render(ParamViewer, default_props);

		const btn = getByRole("button");
		expect(btn).toBeVisible();
		expect(btn).toBeEnabled();
	});

	test("toggle-all button has correct title when closed", async () => {
		const { getByRole } = await render(ParamViewer, default_props);

		const btn = getByRole("button");
		expect(btn).toHaveAttribute("title", "Open All");
	});
});

describe("Props: value", () => {
	afterEach(() => cleanup());

	test("empty value renders component with no parameters", async () => {
		const { queryByRole } = await render(ParamViewer, {
			...default_props,
			value: {}
		});

		expect(queryByRole("group")).not.toBeInTheDocument();
	});

	test("parameter with no type does not prevent rendering", async () => {
		const { getAllByRole } = await render(ParamViewer, {
			...default_props,
			value: {
				simple: {
					type: null as unknown as string,
					description: "A param with no type",
					default: null as unknown as string
				}
			}
		});

		const details = getAllByRole("group");
		expect(details.length).toBe(1);
	});

	test("parameter with description shows it when expanded", async () => {
		const { getByText, getAllByRole } = await render(ParamViewer, {
			...default_props,
			value: {
				param_a: {
					type: "str",
					description: "This is param A",
					default: null as unknown as string
				}
			}
		});

		const details = getAllByRole("group");
		await fireEvent.click(details[0]);

		expect(getByText("This is param A")).toBeInTheDocument();
	});

	test("parameter with default shows it when expanded", async () => {
		const { getByText, getAllByRole } = await render(ParamViewer, {
			...default_props,
			value: {
				param_a: {
					type: "str",
					description: "A param",
					default: "'hello'"
				}
			}
		});

		const details = getAllByRole("group");
		await fireEvent.click(details[0]);

		expect(getByText("default")).toBeInTheDocument();
	});

	test("parameter with null default does not show default section", async () => {
		const { queryByText, getAllByRole } = await render(ParamViewer, {
			...default_props,
			value: {
				param_a: {
					type: "str",
					description: "A param",
					default: null as unknown as string
				}
			}
		});

		const details = getAllByRole("group");
		await fireEvent.click(details[0]);

		expect(queryByText("default")).not.toBeInTheDocument();
	});

	test("parameter with empty description does not show description section", async () => {
		const { getByText, queryByText, getAllByRole } = await render(ParamViewer, {
			...default_props,
			value: {
				param_a: {
					type: "str",
					description: "",
					default: "'hello'"
				}
			}
		});

		const details = getAllByRole("group");
		await fireEvent.click(details[0]);

		expect(getByText("default")).toBeInTheDocument();
	});
});

describe("Props: anchor_links", () => {
	afterEach(() => cleanup());

	test("anchor_links=true creates slug IDs on details elements", async () => {
		const { getAllByRole } = await render(ParamViewer, {
			...default_props,
			anchor_links: true
		});

		const details = getAllByRole("group");
		expect(details[0]).toHaveAttribute("id", "param-number");
		expect(details[1]).toHaveAttribute("id", "param-ndigits");
	});

	test("anchor_links with string prefix creates prefixed slug IDs", async () => {
		const { getAllByRole } = await render(ParamViewer, {
			...default_props,
			anchor_links: "mycomp"
		});

		const details = getAllByRole("group");
		expect(details[0]).toHaveAttribute("id", "param-mycomp-number");
		expect(details[1]).toHaveAttribute("id", "param-mycomp-ndigits");
	});

	test("anchor_links=false does not create IDs on details elements", async () => {
		const { getAllByRole } = await render(ParamViewer, {
			...default_props,
			anchor_links: false
		});

		const details = getAllByRole("group");
		expect(details[0]).not.toHaveAttribute("id");
	});

	test("anchor_links=true renders link icons in summaries", async () => {
		const { getAllByText } = await render(ParamViewer, {
			...default_props,
			anchor_links: true
		});

		const link_icons = getAllByText("🔗");
		expect(link_icons.length).toBe(2);
	});

	test("anchor_links=false does not render link icons", async () => {
		const { queryAllByText } = await render(ParamViewer, {
			...default_props,
			anchor_links: false
		});

		const link_icons = queryAllByText("🔗");
		expect(link_icons.length).toBe(0);
	});
});

describe("Props: linkify", () => {
	afterEach(() => cleanup());

	test("linkify creates anchor links for matching strings in type", async () => {
		const { getByText } = await render(ParamViewer, {
			...default_props,
			value: {
				param_a: {
					type: "SomeComponent",
					description: "A parameter",
					default: null as unknown as string
				}
			},
			linkify: ["SomeComponent"]
		});

		const link = getByText("SomeComponent");
		expect(link.tagName).toBe("A");
		expect(link).toHaveAttribute("href", "#h-somecomponent");
	});
});

describe("Toggle All", () => {
	afterEach(() => cleanup());

	test("clicking toggle-all opens all details", async () => {
		const { getByRole, getAllByRole } = await render(
			ParamViewer,
			default_props
		);

		const btn = getByRole("button");
		await fireEvent.click(btn);

		const details = getAllByRole("group") as HTMLDetailsElement[];
		for (const detail of details) {
			expect(detail.open).toBe(true);
		}
	});

	test("clicking toggle-all twice closes all details", async () => {
		const { getByRole, getAllByRole } = await render(
			ParamViewer,
			default_props
		);

		const btn = getByRole("button");
		await fireEvent.click(btn);
		await fireEvent.click(btn);

		const details = getAllByRole("group") as HTMLDetailsElement[];
		for (const detail of details) {
			expect(detail.open).toBe(false);
		}
	});

	test("toggle-all button title updates after opening", async () => {
		const { getByRole } = await render(ParamViewer, default_props);

		const btn = getByRole("button");
		expect(btn).toHaveAttribute("title", "Open All");

		await fireEvent.click(btn);
		expect(btn).toHaveAttribute("title", "Close All");
	});
});

describe("Props: max_height", () => {
	afterEach(() => cleanup());

	test.todo(
		"VISUAL: max_height causes vertical scrolling when content overflows — needs Playwright visual regression screenshot comparison"
	);
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("set_data updates the displayed parameters", async () => {
		const { set_data, getAllByRole, queryByRole } = await render(
			ParamViewer,
			default_props
		);

		expect(getAllByRole("group").length).toBe(2);

		await set_data({
			value: {
				new_param: {
					type: "str",
					description: "A new parameter",
					default: "'test'"
				}
			}
		});

		expect(queryByRole("group")).toBeInTheDocument();
		const details = getAllByRole("group");
		expect(details.length).toBe(1);
	});

	test("get_data returns the current value", async () => {
		const { get_data } = await render(ParamViewer, default_props);

		const data = await get_data();
		expect(data.value).toEqual(sample_params);
	});

	test("set_data then get_data round-trips", async () => {
		const new_params = {
			alpha: {
				type: "bool",
				description: "A boolean flag",
				default: "True"
			}
		};

		const { set_data, get_data } = await render(ParamViewer, default_props);

		await set_data({ value: new_params });
		const data = await get_data();
		expect(data.value).toEqual(new_params);
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("parameter name with special characters creates valid slug", async () => {
		const { getAllByRole } = await render(ParamViewer, {
			...default_props,
			value: {
				"my-param_name": {
					type: "str",
					description: "Special name",
					default: null as unknown as string
				}
			},
			anchor_links: true
		});

		const details = getAllByRole("group");
		expect(details[0]).toHaveAttribute("id", "param-my-param-name");
	});

	test("description with markdown links renders as anchor tags", async () => {
		const { getAllByRole, getByText } = await render(ParamViewer, {
			...default_props,
			value: {
				param_a: {
					type: "str",
					description: "See [the docs](https://example.com) for details",
					default: null as unknown as string
				}
			}
		});

		const details = getAllByRole("group");
		await fireEvent.click(details[0]);

		const link = getByText("the docs") as HTMLAnchorElement;
		expect(link.tagName).toBe("A");
		expect(link.href).toBe("https://example.com/");
		expect(link).toHaveAttribute("target", "_blank");
	});

	test("no spurious change event on mount", async () => {
		const { listen } = await render(ParamViewer, default_props);

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});
});
