import { test, describe, assert, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Textbox from "./Index.svelte";
import { tick } from "svelte";

const default_props = {
	show_label: true,
	max_lines: 10,
	lines: 1,
	value: "hi ",
	label: "Textbox",
	interactive: true
};

run_shared_prop_tests({
	component: Textbox,
	name: "Textbox",
	base_props: {
		lines: 1,
		max_lines: 10,
		value: "",
		interactive: true
	},
	get_interactive_element: (result) => result.getByRole("textbox")
});

describe("Textbox", () => {
	afterEach(() => cleanup());

	test("renders provided value", async () => {
		const { getByDisplayValue } = await render(Textbox, {
			...default_props,
			max_lines: 1,
			value: "hello world",
			interactive: false
		});

		const item: HTMLInputElement = getByDisplayValue(
			"hello world"
		) as HTMLInputElement;
		assert.equal(item.value, "hello world");
	});

	test("changing the text should update the value", async () => {
		const { getByDisplayValue } = await render(Textbox, default_props);

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;

		item.focus();
		await event.keyboard("some text");

		expect(item.value).toBe("hi some text");
	});
});

describe("Props: type", () => {
	afterEach(() => cleanup());

	test("type='text' renders a text input", async () => {
		const result = await render(Textbox, {
			...default_props,
			type: "text",
			max_lines: 1
		});
		const el = result.getByRole("textbox");
		expect(el.tagName).toBe("INPUT");
	});

	test("type='password' renders a password input", async () => {
		const result = await render(Textbox, {
			...default_props,
			type: "password",
			max_lines: 1
		});
		const el = result.getByTestId("password");
		expect(el).toBeTruthy();
	});

	test("type='email' renders an email input", async () => {
		const result = await render(Textbox, {
			...default_props,
			type: "email",
			max_lines: 1
		});
		const el = result.getByRole("textbox");
		expect(el).toHaveAttribute("type", "email");
	});
});

describe("Props: lines", () => {
	afterEach(() => cleanup());

	test("lines=1 renders an input element", async () => {
		const result = await render(Textbox, {
			...default_props,
			lines: 1,
			max_lines: 1
		});
		const el = result.getByRole("textbox");
		expect(el.tagName).toBe("INPUT");
	});

	test("lines > 1 renders a textarea with correct rows", async () => {
		const result = await render(Textbox, {
			...default_props,
			lines: 5,
			max_lines: 10
		});
		const el = result.getByRole("textbox");
		expect(el.tagName).toBe("TEXTAREA");
		expect(el).toHaveAttribute("rows", "5");
	});
});

describe("Props: text content", () => {
	afterEach(() => cleanup());

	test("placeholder text is rendered", async () => {
		const result = await render(Textbox, {
			...default_props,
			value: "",
			placeholder: "Enter text..."
		});
		const el = result.getByPlaceholderText("Enter text...");
		expect(el).toBeTruthy();
	});

	test("max_length limits input length", async () => {
		const result = await render(Textbox, {
			...default_props,
			value: "",
			max_length: 5,
			max_lines: 1
		});
		const el = result.getByRole("textbox") as HTMLInputElement;
		el.focus();
		await event.type(el, "abcdefgh");
		expect(el).toHaveValue("abcde");
	});

	test("value is rendered in the input", async () => {
		const result = await render(Textbox, {
			...default_props,
			value: "hello world"
		});
		result.getByDisplayValue("hello world");
	});
});

describe("Props: directional", () => {
	afterEach(() => cleanup());

	test("rtl=true sets right-to-left direction", async () => {
		const result = await render(Textbox, {
			...default_props,
			rtl: true,
			max_lines: 1
		});
		const el = result.getByRole("textbox");
		expect(el).toHaveAttribute("dir", "rtl");
	});

	test("rtl=false sets left-to-right direction", async () => {
		const result = await render(Textbox, {
			...default_props,
			rtl: false,
			max_lines: 1
		});
		const el = result.getByRole("textbox");
		expect(el).toHaveAttribute("dir", "ltr");
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("submit_btn=true renders a submit button", async () => {
		const result = await render(Textbox, {
			...default_props,
			submit_btn: true
		});
		const btn = result.getByTestId("submit-button");
		expect(btn).toBeTruthy();
	});

	test("submit_btn with string renders the string as button text", async () => {
		const result = await render(Textbox, {
			...default_props,
			submit_btn: "Send it"
		});
		const btn = result.getByRole("button", { name: "Send it" });
		expect(btn).toBeTruthy();
	});

	test("stop_btn=true renders a stop button", async () => {
		const result = await render(Textbox, {
			...default_props,
			stop_btn: true
		});
		const btn = result.getByTestId("stop-button");
		expect(btn).toBeTruthy();
	});

	test("stop_btn with string renders the string as button text", async () => {
		const result = await render(Textbox, {
			...default_props,
			stop_btn: "Cancel"
		});
		const btn = result.getByRole("button", { name: "Cancel" });
		expect(btn).toBeTruthy();
	});

	test("no submit_btn or stop_btn renders no buttons", async () => {
		const result = await render(Textbox, {
			...default_props,
			submit_btn: false,
			stop_btn: false
		});
		const btn = result.queryByRole("button");
		expect(btn).toBeNull();
	});
});

describe("Props: info", () => {
	afterEach(() => cleanup());

	test("info renders descriptive text", async () => {
		const result = await render(Textbox, {
			...default_props,
			info: "Additional info here"
		});
		const el = result.getByText("Additional info here");
		expect(el).toBeTruthy();
	});

	test("no info does not render info text", async () => {
		const result = await render(Textbox, {
			...default_props,
			info: undefined
		});
		const el = result.queryByText("Additional info here");
		expect(el).toBeNull();
	});
});

describe("Props: html_attributes", () => {
	afterEach(() => cleanup());

	test("spellcheck is applied to the input", async () => {
		const result = await render(Textbox, {
			...default_props,
			max_lines: 1,
			html_attributes: { spellcheck: "false" }
		});
		const el = result.getByRole("textbox");
		expect(el).toHaveAttribute("spellcheck", "false");
	});

	test("autocomplete is applied to the input", async () => {
		const result = await render(Textbox, {
			...default_props,
			max_lines: 1,
			html_attributes: { autocomplete: "username" }
		});
		const el = result.getByRole("textbox");
		expect(el).toHaveAttribute("autocomplete", "username");
	});
});

describe("Props: autofocus", () => {
	afterEach(() => cleanup());

	test("autofocus=true focuses the element on mount", async () => {
		const result = await render(Textbox, {
			...default_props,
			autofocus: true,
			max_lines: 1
		});
		const el = result.getByRole("textbox");
		expect(el).toHaveFocus();
	});
});

describe("Interactive behavior", () => {
	afterEach(() => cleanup());

	test("interactive=false disables the input", async () => {
		const result = await render(Textbox, {
			...default_props,
			interactive: false,
			max_lines: 1
		});
		const el = result.getByTestId("textbox");
		expect(el).toBeDisabled();
	});

	test("interactive=true enables the input", async () => {
		const result = await render(Textbox, {
			...default_props,
			interactive: true,
			max_lines: 1
		});
		const el = result.getByRole("textbox");
		expect(el).toBeEnabled();
	});

	test("interactive=false disables a textarea too", async () => {
		const result = await render(Textbox, {
			...default_props,
			interactive: false,
			lines: 3,
			max_lines: 5
		});
		const el = result.getByRole("textbox");
		expect(el).toBeDisabled();
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("value defaults to empty string when null", async () => {
		const result = await render(Textbox, {
			...default_props,
			value: null,
			max_lines: 1
		});
		const el = result.getByRole("textbox") as HTMLInputElement;
		expect(el).toHaveValue("");
	});

	test("no spurious change event on mount", async () => {
		const { listen } = await render(Textbox, {
			...default_props,
			value: "initial"
		});
		const change = listen("change");
		await tick();
		await tick();
		expect(change).not.toHaveBeenCalled();
	});

	test("change deduplication: same value does not re-fire", async () => {
		const { listen, set_data } = await render(Textbox, {
			...default_props,
			value: ""
		});
		const change = listen("change");
		await set_data({ value: "hello" });
		await set_data({ value: "hello" });
		expect(change).toHaveBeenCalledTimes(1);
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change: emitted when value changes from outside", async () => {
		const { listen, set_data } = await render(Textbox, default_props);

		const change = listen("change");

		await set_data({ value: "hello world" });

		expect(change).toHaveBeenCalledTimes(1);
		expect(change).toHaveBeenCalledWith("hello world");
	});

	test("input: emitted on each keystroke", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, default_props);

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;
		const input = listen("input");

		item.focus();
		await event.keyboard("ab");

		expect(input).toHaveBeenCalled();
		expect(input).toHaveBeenCalledTimes(1);
	});

	test("submit: emitted on Enter key in single-line textbox", async () => {
		const { getByDisplayValue, listen, get_data } = await render(
			Textbox,
			default_props
		);

		const item: HTMLInputElement = getByDisplayValue("hi") as HTMLInputElement;
		const submit = listen("submit");

		item.focus();
		await event.keyboard("ab");
		await event.keyboard("{Enter}");

		expect(submit).toHaveBeenCalledTimes(1);
		const new_data = await get_data();
		expect(new_data.value).toEqual("hi ab");
	});

	test("submit: emitted when submit button is clicked", async () => {
		const { listen, getByTestId } = await render(Textbox, {
			...default_props,
			submit_btn: true
		});

		const submit = listen("submit");
		const btn = getByTestId("submit-button") as HTMLButtonElement;

		fireEvent.click(btn);

		expect(submit).toHaveBeenCalledTimes(1);
	});

	test("blur: emitted when input loses focus", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, default_props);

		const item = getByDisplayValue("hi");
		const blur = listen("blur");

		item.focus();
		item.blur();

		expect(blur).toHaveBeenCalledTimes(1);
	});

	test("focus: emitted when input gains focus", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, default_props);

		const item = getByDisplayValue("hi");
		const focus = listen("focus");

		item.focus();

		expect(focus).toHaveBeenCalledTimes(1);
	});

	test("select: emitted when text is selected", async () => {
		const { getByDisplayValue, listen } = await render(Textbox, {
			...default_props,
			value: "hello world"
		});

		const item = getByDisplayValue("hello world") as HTMLInputElement;
		const select = listen("select");

		item.focus();
		item.setSelectionRange(0, 5);
		await fireEvent.select(item);

		expect(select).toHaveBeenCalledWith({
			value: "hello",
			index: [0, 5]
		});
	});

	test("stop: emitted when stop button is clicked", async () => {
		const { listen, getByTestId } = await render(Textbox, {
			...default_props,
			stop_btn: true
		});

		const stop = listen("stop");
		const btn = getByTestId("stop-button");

		await fireEvent.click(btn);

		expect(stop).toHaveBeenCalledTimes(1);
	});

	test("copy: emitted when copy button is clicked", async () => {
		const { listen, getByLabelText } = await render(Textbox, {
			...default_props,
			value: "copy me",
			buttons: ["copy"]
		});

		const copy = listen("copy");
		const btn = getByLabelText("Copy");

		btn.focus();

		await fireEvent.click(btn);
		await tick();

		expect(copy).toHaveBeenCalledTimes(1);
		expect(copy).toHaveBeenCalledWith({ value: "copy me" });
	});

	test("custom_button_click: emitted when custom button is clicked", async () => {
		const { listen, getByLabelText } = await render(Textbox, {
			...default_props,
			buttons: [{ value: "Run", id: 42, icon: null }]
		});

		const custom = listen("custom_button_click");
		const btn = getByLabelText("Run");
		await fireEvent.click(btn);

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 42 });
	});
});
