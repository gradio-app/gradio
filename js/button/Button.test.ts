import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Button from "./Index.svelte";

const default_props = {
	value: "Submit",
	variant: "primary" as const,
	size: "md" as const,
	link: null as string | null,
	icon: null,
	link_target: "_blank" as const,
	interactive: true
};

run_shared_prop_tests({
	component: Button,
	name: "Button",
	base_props: { ...default_props },
	has_label: false,
	has_validation_error: false,
	visible_false_hides: true,
	has_block_wrapper: false
});

describe("Button", () => {
	afterEach(() => cleanup());

	test("renders the value as the button's accessible name", async () => {
		const { getByRole } = await render(Button, {
			...default_props,
			value: "Click Me"
		});

		expect(getByRole("button", { name: "Click Me" })).toBeVisible();
	});

	test("renders as a button by default (no link)", async () => {
		const { getByRole, queryByRole } = await render(Button, {
			...default_props
		});

		expect(getByRole("button", { name: "Submit" })).toBeVisible();
		expect(queryByRole("link")).toBeNull();
	});

	test("renders as a link when link is provided", async () => {
		const { getByRole, queryByRole } = await render(Button, {
			...default_props,
			link: "https://example.com"
		});

		const link = getByRole("link", { name: "Submit" }) as HTMLAnchorElement;
		expect(link).toBeVisible();
		expect(link.href).toBe("https://example.com/");
		expect(queryByRole("button")).toBeNull();
	});

	test("link with _blank target is secure against reverse-tabnabbing", async () => {
		const { getByRole } = await render(Button, {
			...default_props,
			link: "https://example.com",
			link_target: "_blank" as const
		});

		const link = getByRole("link", { name: "Submit" });
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});

	test("link with _self target opens in same tab", async () => {
		const { getByRole } = await render(Button, {
			...default_props,
			link: "https://example.com",
			link_target: "_self" as const
		});

		const link = getByRole("link", { name: "Submit" });
		expect(link).toHaveAttribute("target", "_self");
		expect(link).not.toHaveAttribute("rel");
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=true enables the button", async () => {
		const { getByRole } = await render(Button, {
			...default_props,
			interactive: true
		});

		expect(getByRole("button", { name: "Submit" })).toBeEnabled();
	});

	test("interactive=false disables the button", async () => {
		const { getByRole } = await render(Button, {
			...default_props,
			interactive: false
		});

		expect(getByRole("button", { name: "Submit" })).toBeDisabled();
	});

	test("interactive=false on a link sets aria-disabled", async () => {
		const { getByRole } = await render(Button, {
			...default_props,
			interactive: false,
			link: "https://example.com"
		});

		expect(getByRole("link", { name: "Submit" })).toHaveAttribute(
			"aria-disabled",
			"true"
		);
	});
});

describe("Events: click", () => {
	afterEach(() => cleanup());

	test("clicking an interactive button fires click event", async () => {
		const { getByRole, listen } = await render(Button, {
			...default_props
		});

		const click = listen("click");
		await fireEvent.click(getByRole("button", { name: "Submit" }));

		expect(click).toHaveBeenCalledTimes(1);
	});

	test("clicking a disabled button does not fire click event", async () => {
		const { getByRole, listen } = await render(Button, {
			...default_props,
			interactive: false
		});

		const click = listen("click");
		await event.click(getByRole("button", { name: "Submit" }));

		expect(click).not.toHaveBeenCalled();
	});
});
