import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";

import Button from "./Index.svelte";

const loading_status = {
	status: "complete" as const,
	eta: 0,
	queue_position: 1,
	queue_size: 1,
	scroll_to_output: false,
	visible: true,
	fn_index: 0,
	show_progress: "full" as const,
	type: "input" as const,
	stream_state: "closed" as const
};

const default_props = {
	value: "Submit",
	variant: "primary" as const,
	size: "md" as const,
	link: null as string | null,
	icon: null,
	link_target: "_blank" as const,
	interactive: true,
	loading_status
};

describe("Button", () => {
	afterEach(() => cleanup());

	test("renders with correct text", async () => {
		const { getByText } = await render(Button, {
			...default_props
		});

		expect(getByText("Submit")).toBeTruthy();
	});

	test("renders with custom value", async () => {
		const { getByText } = await render(Button, {
			...default_props,
			value: "Click Me"
		});

		expect(getByText("Click Me")).toBeTruthy();
	});

	test("renders as a button element when no link is provided", async () => {
		const { container } = await render(Button, {
			...default_props
		});

		const button = container.querySelector("button");
		expect(button).not.toBeNull();
		expect(container.querySelector("a")).toBeNull();
	});

	test("renders as an anchor element when link is provided", async () => {
		const { container } = await render(Button, {
			...default_props,
			link: "https://example.com"
		});

		const anchor = container.querySelector("a");
		expect(anchor).not.toBeNull();
		expect(anchor?.getAttribute("href")).toBe("https://example.com");
	});

	test("anchor has target and rel attributes", async () => {
		const { container } = await render(Button, {
			...default_props,
			link: "https://example.com",
			link_target: "_blank" as const
		});

		const anchor = container.querySelector("a");
		expect(anchor?.getAttribute("target")).toBe("_blank");
		expect(anchor?.getAttribute("rel")).toBe("noopener noreferrer");
	});

	test("anchor with _self target has no rel attribute", async () => {
		const { container } = await render(Button, {
			...default_props,
			link: "https://example.com",
			link_target: "_self" as const
		});

		const anchor = container.querySelector("a");
		expect(anchor?.getAttribute("target")).toBe("_self");
		expect(anchor?.getAttribute("rel")).toBeNull();
	});
});

describe("Props: variant", () => {
	afterEach(() => cleanup());

	test("applies primary variant class", async () => {
		const { container } = await render(Button, {
			...default_props,
			variant: "primary" as const
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("primary")).toBe(true);
	});

	test("applies secondary variant class", async () => {
		const { container } = await render(Button, {
			...default_props,
			variant: "secondary" as const
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("secondary")).toBe(true);
	});

	test("applies stop variant class", async () => {
		const { container } = await render(Button, {
			...default_props,
			variant: "stop" as const
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("stop")).toBe(true);
	});
});

describe("Props: size", () => {
	afterEach(() => cleanup());

	test("applies sm size class", async () => {
		const { container } = await render(Button, {
			...default_props,
			size: "sm" as const
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("sm")).toBe(true);
	});

	test("applies md size class", async () => {
		const { container } = await render(Button, {
			...default_props,
			size: "md" as const
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("md")).toBe(true);
	});

	test("applies lg size class", async () => {
		const { container } = await render(Button, {
			...default_props,
			size: "lg" as const
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("lg")).toBe(true);
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("button is enabled when interactive is true", async () => {
		const { container } = await render(Button, {
			...default_props,
			interactive: true
		});

		const button = container.querySelector("button") as HTMLButtonElement;
		expect(button.disabled).toBe(false);
	});

	test("button is disabled when interactive is false", async () => {
		const { container } = await render(Button, {
			...default_props,
			interactive: false
		});

		const button = container.querySelector("button") as HTMLButtonElement;
		expect(button.disabled).toBe(true);
	});
});

describe("Props: visible", () => {
	afterEach(() => cleanup());

	test("button is visible by default", async () => {
		const { container } = await render(Button, {
			...default_props
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("hidden")).toBe(false);
	});

	test("button is hidden when visible is false", async () => {
		const { container } = await render(Button, {
			...default_props,
			visible: false
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("hidden")).toBe(true);
	});

	test("button is hidden when visible is 'hidden'", async () => {
		const { container } = await render(Button, {
			...default_props,
			visible: "hidden"
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("hidden")).toBe(true);
	});
});

describe("Props: elem_id and elem_classes", () => {
	afterEach(() => cleanup());

	test("elem_id is applied to the button", async () => {
		const { container } = await render(Button, {
			...default_props,
			elem_id: "my-button"
		});

		expect(container.querySelector("#my-button")).not.toBeNull();
	});

	test("elem_classes are applied to the button", async () => {
		const { container } = await render(Button, {
			...default_props,
			elem_classes: ["custom-class"]
		});

		const button = container.querySelector("button");
		expect(button?.classList.contains("custom-class")).toBe(true);
	});
});

describe("Events: click", () => {
	afterEach(() => cleanup());

	test("clicking the button fires click event", async () => {
		const { container, listen } = await render(Button, {
			...default_props
		});

		const click = listen("click");
		const button = container.querySelector("button") as HTMLButtonElement;

		await fireEvent.click(button);

		expect(click).toHaveBeenCalledTimes(1);
	});
});
