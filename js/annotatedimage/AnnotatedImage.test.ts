import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import AnnotatedImage from "./Index.svelte";

const fake_image = {
	path: "test.png",
	url: "https://example.com/test.png",
	orig_name: "test.png",
	size: 1024,
	mime_type: "image/png",
	is_stream: false
};

const fake_mask_1 = {
	path: "mask1.png",
	url: "https://example.com/mask1.png",
	orig_name: "mask1.png",
	size: 512,
	mime_type: "image/png",
	is_stream: false
};

const fake_mask_2 = {
	path: "mask2.png",
	url: "https://example.com/mask2.png",
	orig_name: "mask2.png",
	size: 512,
	mime_type: "image/png",
	is_stream: false
};

const fake_value = {
	image: fake_image,
	annotations: [
		{ image: fake_mask_1, label: "cat" },
		{ image: fake_mask_2, label: "dog" }
	]
};

const single_annotation_value = {
	image: fake_image,
	annotations: [{ image: fake_mask_1, label: "cat" }]
};

const default_props = {
	value: null as any,
	label: "Annotated Image",
	show_label: true,
	show_legend: true,
	color_map: {} as Record<string, string>,
	buttons: ["fullscreen"] as (
		| string
		| { value: string; id: number; icon: null }
	)[]
};

// BlockLabel in AnnotatedImage doesn't use data-testid='block-info',
// so the shared show_label: false test fails. Disable has_label and
// write custom label tests below.
run_shared_prop_tests({
	component: AnnotatedImage,
	name: "AnnotatedImage",
	base_props: {
		...default_props
	},
	has_label: false,
	has_validation_error: false
});

describe("Label", () => {
	afterEach(() => cleanup());

	test("label text is rendered", async () => {
		const { getByText } = await render(AnnotatedImage, {
			...default_props,
			label: "My Image",
			show_label: true
		});

		expect(getByText("My Image")).toBeTruthy();
		expect(getByText("My Image")).toBeVisible();
	});

	test("show_label=false hides the label visually", async () => {
		const { getByText } = await render(AnnotatedImage, {
			...default_props,
			label: "My Image",
			show_label: false
		});

		// BlockLabel hides via CSS when show_label is false
		expect(getByText("My Image")).not.toBeVisible();
	});
});

describe("AnnotatedImage", () => {
	afterEach(() => cleanup());

	test("renders empty state when value is null", async () => {
		const { queryByAltText } = await render(AnnotatedImage, {
			...default_props,
			value: null
		});

		expect(queryByAltText("the base file that is annotated")).toBeNull();
	});

	test("renders base image when value is set", async () => {
		const { getByAltText } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		const img = getByAltText("the base file that is annotated");
		expect(img).toBeTruthy();
		expect(img.getAttribute("src")).toBe("https://example.com/test.png");
	});

	test("renders annotation masks when value has annotations", async () => {
		const { container } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		const masks = container.querySelectorAll("img.mask");
		expect(masks.length).toBe(2);
		expect(masks[0].getAttribute("src")).toBe("https://example.com/mask1.png");
		expect(masks[1].getAttribute("src")).toBe("https://example.com/mask2.png");
	});
});

describe("Props: show_legend", () => {
	afterEach(() => cleanup());

	test("show_legend=true renders legend buttons for each annotation", async () => {
		const { getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value,
			show_legend: true
		});

		expect(getByRole("button", { name: "cat" })).toBeTruthy();
		expect(getByRole("button", { name: "dog" })).toBeTruthy();
		expect(getByRole("button", { name: "cat" })).toBeVisible();
		expect(getByRole("button", { name: "dog" })).toBeVisible();
	});

	test("show_legend=false hides legend", async () => {
		const { queryByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value,
			show_legend: false
		});

		expect(queryByRole("button", { name: "cat" })).toBeNull();
		expect(queryByRole("button", { name: "dog" })).toBeNull();
	});

	test("legend is not rendered when value is null", async () => {
		const { queryByRole } = await render(AnnotatedImage, {
			...default_props,
			value: null,
			show_legend: true
		});

		expect(queryByRole("button", { name: "cat" })).toBeNull();
	});
});

describe("Props: color_map", () => {
	afterEach(() => cleanup());

	test("color_map applies custom background colors to legend items", async () => {
		const { getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value,
			color_map: { cat: "#ff0000", dog: "#00ff00" }
		});

		const catBtn = getByRole("button", { name: "cat" });
		const dogBtn = getByRole("button", { name: "dog" });

		// color_map colors get '88' (0x88/0xff ≈ 0.533) appended for semi-transparency
		// The browser normalizes to rgba
		expect(catBtn.style.backgroundColor).toContain("rgba(255, 0, 0");
		expect(dogBtn.style.backgroundColor).toContain("rgba(0, 255, 0");
	});

	test("without color_map, masks have hue-rotate filter style", async () => {
		const { container } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value,
			color_map: {}
		});

		const masks = container.querySelectorAll("img.mask");
		// First mask: hue-rotate(0deg), second: hue-rotate(180deg)
		expect(masks[0].getAttribute("style")).toContain("hue-rotate(0deg)");
		expect(masks[1].getAttribute("style")).toContain("hue-rotate(180deg)");
	});

	test("with color_map, masks have no hue-rotate filter", async () => {
		const { container } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value,
			color_map: { cat: "#ff0000", dog: "#00ff00" }
		});

		const masks = container.querySelectorAll("img.mask");
		for (const mask of masks) {
			const style = mask.getAttribute("style");
			// Should be null or not contain hue-rotate
			if (style) {
				expect(style).not.toContain("hue-rotate");
			}
		}
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("fullscreen button renders when 'fullscreen' is in buttons", async () => {
		const { getByLabelText } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value,
			buttons: ["fullscreen"]
		});

		expect(getByLabelText("Fullscreen")).toBeTruthy();
		expect(getByLabelText("Fullscreen")).toBeVisible();
	});

	test("empty buttons array shows no fullscreen button", async () => {
		const { queryByLabelText } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value,
			buttons: []
		});

		expect(queryByLabelText("Fullscreen")).toBeNull();
	});

	test("custom button renders and dispatches custom_button_click", async () => {
		const { listen, getByLabelText } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value,
			buttons: [{ value: "Analyze", id: 5, icon: null }]
		});

		const custom = listen("custom_button_click");
		const btn = getByLabelText("Analyze");

		await fireEvent.click(btn);

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 5 });
	});

	test("buttons not rendered when value is null (empty state)", async () => {
		const { queryByLabelText } = await render(AnnotatedImage, {
			...default_props,
			value: null,
			buttons: ["fullscreen"]
		});

		expect(queryByLabelText("Fullscreen")).toBeNull();
	});
});

describe("Events: change", () => {
	afterEach(() => cleanup());

	test("setting value triggers change event", async () => {
		const { listen, set_data } = await render(AnnotatedImage, {
			...default_props,
			value: null
		});

		const change = listen("change");

		await set_data({ value: fake_value });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change event is not triggered on mount with null value", async () => {
		const { listen } = await render(AnnotatedImage, {
			...default_props,
			value: null
		});

		const change = listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();
	});

	test("change event does not fire once on mount when initial value is set", async () => {
		// The component's $effect fires change when old_value != value on mount
		const { listen } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		const change = listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();
	});

	test("changing value multiple times triggers change each time", async () => {
		const { listen, set_data } = await render(AnnotatedImage, {
			...default_props,
			value: null
		});

		const change = listen("change");

		await set_data({ value: fake_value });
		expect(change).toHaveBeenCalledTimes(1);
		await set_data({ value: single_annotation_value });

		expect(change).toHaveBeenCalledTimes(2);
	});

	test("setting value to null after a value triggers change", async () => {
		const { listen, set_data } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		const change = listen("change");

		await set_data({ value: null });

		expect(change).toHaveBeenCalledTimes(1);
	});
});

describe("Events: select", () => {
	afterEach(() => cleanup());

	test("clicking legend item dispatches select with value and index", async () => {
		const { listen, getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		const select = listen("select");

		await fireEvent.click(getByRole("button", { name: "cat" }));

		expect(select).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith({ value: "cat", index: 0 });
	});

	test("clicking second legend item dispatches correct index", async () => {
		const { listen, getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		const select = listen("select");

		await fireEvent.click(getByRole("button", { name: "dog" }));

		expect(select).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith({ value: "dog", index: 1 });
	});

	test("clicking multiple legend items dispatches select for each", async () => {
		const { listen, getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		const select = listen("select");

		await fireEvent.click(getByRole("button", { name: "cat" }));
		await fireEvent.click(getByRole("button", { name: "dog" }));

		expect(select).toHaveBeenCalledTimes(2);
		expect(select).toHaveBeenNthCalledWith(1, { value: "cat", index: 0 });
		expect(select).toHaveBeenNthCalledWith(2, { value: "dog", index: 1 });
	});
});

describe("Legend hover interactions", () => {
	afterEach(() => cleanup());

	test("hovering over legend item sets active class on corresponding mask", async () => {
		const { container, getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		await fireEvent.mouseOver(getByRole("button", { name: "cat" }));

		const masks = container.querySelectorAll("img.mask");
		expect(masks[0].classList.contains("active")).toBe(true);
	});

	test("hovering over legend item sets inactive class on other masks", async () => {
		const { container, getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		await fireEvent.mouseOver(getByRole("button", { name: "cat" }));

		const masks = container.querySelectorAll("img.mask");
		expect(masks[0].classList.contains("active")).toBe(true);
		expect(masks[1].classList.contains("inactive")).toBe(true);
	});

	test("mouseout resets all masks to default state", async () => {
		const { container, getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		await fireEvent.mouseOver(getByRole("button", { name: "cat" }));
		await fireEvent.mouseOut(getByRole("button", { name: "cat" }));

		const masks = container.querySelectorAll("img.mask");
		expect(masks[0].classList.contains("active")).toBe(false);
		expect(masks[0].classList.contains("inactive")).toBe(false);
		expect(masks[1].classList.contains("active")).toBe(false);
		expect(masks[1].classList.contains("inactive")).toBe(false);
	});

	test("focus on legend item activates mask (keyboard accessibility)", async () => {
		const { container, getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		await fireEvent.focus(getByRole("button", { name: "dog" }));

		const masks = container.querySelectorAll("img.mask");
		expect(masks[1].classList.contains("active")).toBe(true);
		expect(masks[0].classList.contains("inactive")).toBe(true);
	});

	test("blur on legend item resets masks (keyboard accessibility)", async () => {
		const { container, getByRole } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		await fireEvent.focus(getByRole("button", { name: "dog" }));
		await fireEvent.blur(getByRole("button", { name: "dog" }));

		const masks = container.querySelectorAll("img.mask");
		expect(masks[0].classList.contains("active")).toBe(false);
		expect(masks[0].classList.contains("inactive")).toBe(false);
		expect(masks[1].classList.contains("active")).toBe(false);
		expect(masks[1].classList.contains("inactive")).toBe(false);
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns null when no value", async () => {
		const { get_data } = await render(AnnotatedImage, {
			...default_props,
			value: null
		});

		const data = await get_data();
		expect(data.value).toBeNull();
	});

	test("set_data updates the displayed image", async () => {
		const { set_data, getByAltText } = await render(AnnotatedImage, {
			...default_props,
			value: null
		});

		await set_data({ value: fake_value });

		const img = getByAltText("the base file that is annotated");
		expect(img).toBeTruthy();
		expect(img.getAttribute("src")).toBe("https://example.com/test.png");
	});

	test("get_data reflects set_data value (round-trip)", async () => {
		const { get_data, set_data } = await render(AnnotatedImage, {
			...default_props,
			value: null
		});

		await set_data({ value: fake_value });

		const data = await get_data();
		expect(data.value).toEqual(fake_value);
	});

	test("set_data to null shows empty state", async () => {
		const { set_data, queryByAltText } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value
		});

		await set_data({ value: null });

		expect(queryByAltText("the base file that is annotated")).toBeNull();
	});

	test("set_data updates legend items", async () => {
		const { set_data, getByRole, queryByRole } = await render(AnnotatedImage, {
			...default_props,
			value: null
		});

		await set_data({ value: fake_value });

		expect(getByRole("button", { name: "cat" })).toBeTruthy();
		expect(getByRole("button", { name: "dog" })).toBeTruthy();

		await set_data({ value: single_annotation_value });

		expect(getByRole("button", { name: "cat" })).toBeTruthy();
		expect(queryByRole("button", { name: "dog" })).toBeNull();
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("single annotation renders without errors in hue calculation", async () => {
		const { container } = await render(AnnotatedImage, {
			...default_props,
			value: single_annotation_value,
			color_map: {}
		});

		const masks = container.querySelectorAll("img.mask");
		expect(masks.length).toBe(1);
		// With 1 annotation: hue-rotate(0 * 360 / 1) = hue-rotate(0deg)
		expect(masks[0].getAttribute("style")).toContain("hue-rotate(0deg)");
	});

	test("value with empty annotations array renders base image but no masks or legend", async () => {
		const { container, getByAltText, queryByRole } = await render(
			AnnotatedImage,
			{
				...default_props,
				value: {
					image: fake_image,
					annotations: []
				}
			}
		);

		expect(getByAltText("the base file that is annotated")).toBeTruthy();

		const masks = container.querySelectorAll("img.mask");
		expect(masks.length).toBe(0);

		// No legend buttons since there are no annotations
		expect(queryByRole("button", { name: "cat" })).toBeNull();
	});

	test("color_map with only some labels falls back to hue-rotate for unmapped labels", async () => {
		const { container } = await render(AnnotatedImage, {
			...default_props,
			value: fake_value,
			color_map: { cat: "#ff0000" } // only cat is mapped, dog is not
		});

		const masks = container.querySelectorAll("img.mask");
		// cat mask: has color_map entry, no hue-rotate
		const catStyle = masks[0].getAttribute("style");
		if (catStyle) {
			expect(catStyle).not.toContain("hue-rotate");
		}
		// dog mask: no color_map entry, should have hue-rotate
		expect(masks[1].getAttribute("style")).toContain("hue-rotate");
	});
});

test.todo(
	"VISUAL: mask opacity transitions on hover — masks should fade to 0.3 opacity on container hover, active mask at 1.0, inactive at 0 — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: height/width props control component dimensions — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: default hue-rotate coloring distributes colors evenly across the color wheel — needs Playwright visual regression screenshot comparison"
);
