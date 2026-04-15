import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Dropdown from "./Index.svelte";
import { handle_filter } from "./shared/utils";

const single_select_props = {
	label: "Dropdown",
	show_label: true,
	value: "apple",
	choices: [
		["apple", "apple"],
		["banana", "banana"],
		["cherry", "cherry"]
	] as [string, string | number][],
	filterable: true,
	interactive: true,
	multiselect: false,
	max_choices: null,
	allow_custom_value: false
};

const tuple_choices: [string, string | number][] = [
	["Apple Display", "apple_val"],
	["Banana Display", "banana_val"],
	["Cherry Display", "cherry_val"]
];

const multiselect_props = {
	label: "Multiselect",
	show_label: true,
	value: [] as (string | number)[],
	choices: [
		["apple", "apple"],
		["banana", "banana"],
		["cherry", "cherry"]
	] as [string, string | number][],
	filterable: true,
	interactive: true,
	multiselect: true,
	max_choices: null,
	allow_custom_value: false
};

run_shared_prop_tests({
	component: Dropdown,
	name: "Dropdown",
	base_props: {
		value: "apple",
		choices: [
			["apple", "apple"],
			["banana", "banana"]
		],
		filterable: true,
		interactive: true,
		multiselect: false,
		max_choices: null
	}
});

describe("Single-select: Rendering", () => {
	afterEach(() => cleanup());

	test("renders provided value as display text", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			value: "banana"
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("banana");
	});

	test("renders display name when value differs from display name", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			choices: tuple_choices,
			value: "banana_val"
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("Banana Display");
	});

	test("renders empty input when value is null", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			value: null
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("");
	});

	test("renders empty input when value is undefined", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			value: undefined
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("");
	});

	test("input is disabled when interactive is false", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			interactive: false
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input).toBeDisabled();
	});

	test("input is readonly when filterable is false", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			filterable: false
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input).toHaveAttribute("readonly");
	});

	test("input is not readonly when filterable is true", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			filterable: true
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input).not.toHaveAttribute("readonly");
	});
});

describe("Single-select: Options display", () => {
	afterEach(() => cleanup());

	test("focus shows all options", async () => {
		const { getByLabelText, getAllByTestId } = await render(
			Dropdown,
			single_select_props
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		expect(options).toHaveLength(3);
	});

	test("options display names, not internal values", async () => {
		const { getByLabelText, getAllByTestId } = await render(Dropdown, {
			...single_select_props,
			choices: tuple_choices,
			value: "apple_val"
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		expect(options[0]).toHaveAttribute("aria-label", "Apple Display");
		expect(options[1]).toHaveAttribute("aria-label", "Banana Display");
		expect(options[2]).toHaveAttribute("aria-label", "Cherry Display");
	});

	test("selected option is marked as selected", async () => {
		const { getByLabelText, getAllByTestId } = await render(Dropdown, {
			...single_select_props,
			value: "banana"
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		expect(options[0]).toHaveAttribute("aria-selected", "false");
		expect(options[1]).toHaveAttribute("aria-selected", "true");
		expect(options[2]).toHaveAttribute("aria-selected", "false");
	});

	test("options not shown when interactive is false", async () => {
		const { getByLabelText, queryAllByTestId } = await render(Dropdown, {
			...single_select_props,
			interactive: false
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = queryAllByTestId("dropdown-option");
		expect(options).toHaveLength(0);
	});

	test("blur hides options", async () => {
		const { getByLabelText, getAllByTestId, queryAllByTestId } = await render(
			Dropdown,
			single_select_props
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		expect(getAllByTestId("dropdown-option")).toHaveLength(3);

		await input.blur();
		await waitFor(() => {
			expect(queryAllByTestId("dropdown-option")).toHaveLength(0);
		});
	});
});

describe("Single-select: Filtering", () => {
	afterEach(() => cleanup());

	test("typing filters options case-insensitively", async () => {
		const { getByLabelText, getAllByTestId } = await render(Dropdown, {
			...single_select_props,
			value: null
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		await event.keyboard("BAN");

		const options = getAllByTestId("dropdown-option");
		expect(options).toHaveLength(1);
		expect(options[0]).toHaveAttribute("aria-label", "banana");
	});

	test("blur and re-focus resets filter to show all options", async () => {
		const { getByLabelText, getAllByTestId } = await render(Dropdown, {
			...single_select_props,
			value: "apple"
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		await event.keyboard("z");

		await input.blur();
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		expect(options).toHaveLength(3);
	});

	test("partial match filtering works", async () => {
		const { getByLabelText, getAllByTestId } = await render(Dropdown, {
			...single_select_props,
			value: null,
			choices: [
				["pineapple", "pineapple"],
				["apple", "apple"],
				["grape", "grape"]
			] as [string, string | number][]
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		await event.keyboard("apple");

		const options = getAllByTestId("dropdown-option");
		expect(options).toHaveLength(2);
	});
});

describe("Single-select: Selection", () => {
	afterEach(() => cleanup());

	test("clicking an option selects it and updates input", async () => {
		const { getByLabelText, getAllByTestId } = await render(
			Dropdown,
			single_select_props
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[1]);

		expect(input.value).toBe("banana");
	});

	test("clicking an option updates get_data value", async () => {
		const { getByLabelText, getAllByTestId, get_data } = await render(
			Dropdown,
			single_select_props
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[2]);

		const data = await get_data();
		expect(data.value).toBe("cherry");
	});

	test("clicking an option with tuple choices returns internal value via get_data", async () => {
		const { getByLabelText, getAllByTestId, get_data } = await render(
			Dropdown,
			{
				...single_select_props,
				choices: tuple_choices,
				value: "apple_val"
			}
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[1]);

		expect(input.value).toBe("Banana Display");
		const data = await get_data();
		expect(data.value).toBe("banana_val");
	});

	test("arrow down then Enter selects first option", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			value: null
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		await event.keyboard("{ArrowDown}");
		await event.keyboard("{Enter}");

		expect(input.value).toBe("apple");
	});

	test("selecting a new option replaces the previous one", async () => {
		const { getByLabelText, getAllByTestId } = await render(
			Dropdown,
			single_select_props
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		let options = getAllByTestId("dropdown-option");
		await event.click(options[1]);
		expect(input.value).toBe("banana");

		await input.focus();
		options = getAllByTestId("dropdown-option");
		await event.click(options[2]);
		expect(input.value).toBe("cherry");
	});

	test("clicking option updates selected marker", async () => {
		const { getByLabelText, getAllByTestId } = await render(
			Dropdown,
			single_select_props
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("apple");
		await input.focus();
		let options = getAllByTestId("dropdown-option");
		expect(options[0]).toHaveClass("selected");

		await event.click(options[1]);
		expect(input.value).toBe("banana");
		await input.focus();
		options = getAllByTestId("dropdown-option");
		expect(options[1]).toHaveClass("selected");
	});
});

describe("Single-select: Custom values", () => {
	afterEach(() => cleanup());

	test("allow_custom_value=false: blur reverts invalid typed text", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			allow_custom_value: false,
			value: "apple"
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		await event.keyboard("pie");
		expect(input.value).toBe("applepie");

		await input.blur();
		expect(input.value).toBe("apple");
	});

	test("allow_custom_value=true: blur keeps custom typed text", async () => {
		const { getByLabelText, get_data } = await render(Dropdown, {
			...single_select_props,
			allow_custom_value: true,
			value: "apple"
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		await event.keyboard("pie");
		expect(input.value).toBe("applepie");

		await input.blur();
		expect(input.value).toBe("applepie");
		const data = await get_data();
		expect(data.value).toBe("applepie");
	});

	test("allow_custom_value=true: Enter accepts custom value", async () => {
		const { getByLabelText, get_data } = await render(Dropdown, {
			...single_select_props,
			allow_custom_value: true,
			value: null
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		await event.keyboard("custom_text{Enter}");

		const data = await get_data();
		expect(data.value).toBe("custom_text");
	});

	test("allow_custom_value=false: Enter with no matching active option keeps current value", async () => {
		const { getByLabelText, get_data } = await render(Dropdown, {
			...single_select_props,
			allow_custom_value: false,
			value: "apple"
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		// Type something that filters to no results, then Enter
		await event.keyboard("xyz");
		await input.blur();

		const data = await get_data();
		expect(data.value).toBe("apple");
	});

	test("regression #12548: selecting a tuple choice with allow_custom_value=true returns internal value, not display name", async () => {
		const { getByLabelText, getAllByTestId, get_data } = await render(
			Dropdown,
			{
				...single_select_props,
				choices: [
					["hello", "goodbye"],
					["abc", "123"]
				] as [string, string | number][],
				value: null,
				allow_custom_value: true
			}
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		expect(input.value).toBe("hello");
		const data = await get_data();
		expect(data.value).toBe("goodbye");
	});

	test("regression #12548: blur on a matching choice name with allow_custom_value=true returns internal value", async () => {
		const { getByLabelText, get_data } = await render(Dropdown, {
			...single_select_props,
			choices: [
				["hello", "goodbye"],
				["abc", "123"]
			] as [string, string | number][],
			value: null,
			allow_custom_value: true
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		await event.keyboard("hello");
		await input.blur();

		const data = await get_data();
		expect(data.value).toBe("goodbye");
	});

	test("undefined initial value with allow_custom_value=true renders empty", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			value: undefined,
			allow_custom_value: true
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("");
	});
});

describe("Single-select: Events", () => {
	afterEach(() => cleanup());

	test("no spurious change event on mount", async () => {
		const { listen } = await render(Dropdown, single_select_props);

		const change = listen("change", { retrospective: true });
		expect(change).not.toHaveBeenCalled();
	});

	test("change fires when value changes via set_data", async () => {
		const { listen, set_data } = await render(Dropdown, single_select_props);

		const change = listen("change");
		await set_data({ value: "banana" });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change event deduplication: setting same value does not fire again", async () => {
		const { listen, set_data } = await render(Dropdown, single_select_props);

		const change = listen("change");
		await set_data({ value: "banana" });
		await set_data({ value: "banana" });

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change fires when option is clicked", async () => {
		const { getByLabelText, getAllByTestId, listen } = await render(
			Dropdown,
			single_select_props
		);

		const change = listen("change");
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[1]);

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("input fires when option is selected", async () => {
		const { getByLabelText, getAllByTestId, listen } = await render(
			Dropdown,
			single_select_props
		);

		const input_event = listen("input");
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[1]);

		expect(input_event).toHaveBeenCalled();
	});

	test("select fires with correct data when option is clicked", async () => {
		const { getByLabelText, getAllByTestId, listen } = await render(
			Dropdown,
			single_select_props
		);

		const select = listen("select");
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[2]);

		expect(select).toHaveBeenCalledTimes(1);
		expect(select).toHaveBeenCalledWith({
			index: 2,
			value: "cherry",
			selected: true
		});
	});

	test("focus fires when input gains focus", async () => {
		const { getByLabelText, listen } = await render(
			Dropdown,
			single_select_props
		);

		const focus = listen("focus");
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		expect(focus).toHaveBeenCalledTimes(1);
	});

	test("blur fires when input loses focus", async () => {
		const { getByLabelText, listen } = await render(
			Dropdown,
			single_select_props
		);

		const blur = listen("blur");
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		await input.blur();

		expect(blur).toHaveBeenCalledTimes(1);
	});

	test("regression #12634: key_up fires with current input value after keypress", async () => {
		const { getByLabelText, listen } = await render(Dropdown, {
			...single_select_props,
			value: null,
			allow_custom_value: true
		});

		const key_up = listen("key_up");
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		await event.keyboard("a");

		expect(key_up).toHaveBeenCalledWith(
			expect.objectContaining({ key: "a", input_value: "a" })
		);
	});

	test("regression #12634: key_up passes updated value, not stale value", async () => {
		const { getByLabelText, listen } = await render(Dropdown, {
			...single_select_props,
			value: null,
			allow_custom_value: true
		});

		const key_up = listen("key_up");
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();

		await event.keyboard("1");
		await event.keyboard("5");
		await event.keyboard("4");

		expect(key_up).toHaveBeenLastCalledWith(
			expect.objectContaining({ key: "4", input_value: "154" })
		);
	});
});

describe("Single-select: get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns current value", async () => {
		const { get_data } = await render(Dropdown, single_select_props);

		const data = await get_data();
		expect(data.value).toBe("apple");
	});

	test("set_data updates displayed value", async () => {
		const { getByLabelText, set_data } = await render(
			Dropdown,
			single_select_props
		);

		await set_data({ value: "cherry" });
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("cherry");
	});

	test("set_data updates displayed text for tuple choices", async () => {
		const { getByLabelText, set_data } = await render(Dropdown, {
			...single_select_props,
			choices: tuple_choices,
			value: "apple_val"
		});

		await set_data({ value: "cherry_val" });
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("Cherry Display");
	});

	test("round-trip: set_data then get_data returns same value", async () => {
		const { get_data, set_data } = await render(Dropdown, single_select_props);

		await set_data({ value: "banana" });
		const data = await get_data();
		expect(data.value).toBe("banana");
	});

	test("set_data to null clears the input", async () => {
		const { getByLabelText, set_data, get_data } = await render(
			Dropdown,
			single_select_props
		);

		await set_data({ value: null });
		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("");
		const data = await get_data();
		expect(data.value).toBeNull();
	});

	test("user interaction reflected in get_data", async () => {
		const { getByLabelText, getAllByTestId, get_data } = await render(
			Dropdown,
			single_select_props
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		await input.focus();
		const options = getAllByTestId("dropdown-option");
		await event.click(options[2]);

		const data = await get_data();
		expect(data.value).toBe("cherry");
	});
});

describe("Multiselect: Rendering", () => {
	afterEach(() => cleanup());

	test("renders with empty value (no tokens)", async () => {
		const { container } = await render(Dropdown, multiselect_props);

		const tokens = container.querySelectorAll(".token");
		expect(tokens).toHaveLength(0);
	});

	test("renders selected values as tokens", async () => {
		const { getByText } = await render(Dropdown, {
			...multiselect_props,
			value: ["apple", "cherry"]
		});

		expect(getByText("apple")).toBeTruthy();
		expect(getByText("cherry")).toBeTruthy();
	});

	test("renders display names for tuple choices in tokens", async () => {
		const { getByText } = await render(Dropdown, {
			...multiselect_props,
			choices: tuple_choices,
			value: ["apple_val", "cherry_val"]
		});

		expect(getByText("Apple Display")).toBeTruthy();
		expect(getByText("Cherry Display")).toBeTruthy();
	});

	test("disabled state: no remove buttons on tokens", async () => {
		const { container } = await render(Dropdown, {
			...multiselect_props,
			value: ["apple", "banana"],
			interactive: false
		});

		const tokens = container.querySelectorAll(".token");
		expect(tokens).toHaveLength(2);
		const removeButtons = container.querySelectorAll(".token-remove");
		expect(removeButtons).toHaveLength(0);
	});
});

describe("Multiselect: Options display", () => {
	afterEach(() => cleanup());

	test("focus shows all options", async () => {
		const { container, getAllByTestId } = await render(
			Dropdown,
			multiselect_props
		);

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		expect(options).toHaveLength(3);
	});

	test("selected options are marked as selected", async () => {
		const { container, getAllByTestId } = await render(Dropdown, {
			...multiselect_props,
			value: ["apple", "cherry"]
		});

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		expect(options[0]).toHaveAttribute("aria-selected", "true");
		expect(options[1]).toHaveAttribute("aria-selected", "false");
		expect(options[2]).toHaveAttribute("aria-selected", "true");
	});
});

describe("Multiselect: Selection", () => {
	afterEach(() => cleanup());

	test("clicking an option adds a token", async () => {
		const { container, getAllByTestId } = await render(
			Dropdown,
			multiselect_props
		);

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		await input.focus();
		const tokens = container.querySelectorAll(".token");
		expect(tokens).toHaveLength(1);
		expect(tokens[0].textContent).toContain("apple");
	});

	test("clicking same option twice toggles it (add then remove)", async () => {
		const { container, getAllByTestId, get_data } = await render(
			Dropdown,
			multiselect_props
		);

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		let options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		let data = await get_data();
		expect(data.value).toEqual(["apple"]);

		await input.focus();
		options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		data = await get_data();
		expect(data.value).toEqual([]);
	});

	test("multiple options can be selected", async () => {
		const { container, getAllByTestId, get_data } = await render(
			Dropdown,
			multiselect_props
		);

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();
		let options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		await input.focus();
		options = getAllByTestId("dropdown-option");
		await event.click(options[2]);

		const data = await get_data();
		expect(data.value).toEqual(["apple", "cherry"]);
	});

	test("remove button on token removes that selection", async () => {
		const { container, get_data } = await render(Dropdown, {
			...multiselect_props,
			value: ["apple", "banana", "cherry"]
		});

		const removeButtons = container.querySelectorAll(
			".token-remove:not(.remove-all)"
		);
		expect(removeButtons).toHaveLength(3);

		await event.click(removeButtons[1]);

		const data = await get_data();
		expect(data.value).toEqual(["apple", "cherry"]);
	});

	test("clear-all button removes all selections", async () => {
		const { container, get_data } = await render(Dropdown, {
			...multiselect_props,
			value: ["apple", "banana"]
		});

		const clearAll = container.querySelector(".remove-all") as HTMLElement;
		expect(clearAll).toBeInTheDocument();

		await event.click(clearAll);

		const data = await get_data();
		expect(data.value).toEqual([]);
	});

	test("remove button on each token works independently", async () => {
		const { container, get_data } = await render(Dropdown, {
			...multiselect_props,
			value: ["apple", "banana", "cherry"]
		});

		const removeButtons = container.querySelectorAll(
			".token-remove:not(.remove-all)"
		);

		await event.click(removeButtons[0]);

		const data = await get_data();
		expect(data.value).toEqual(["banana", "cherry"]);
	});

	test("max_choices limits the number of selections", async () => {
		const { container, getAllByTestId, get_data } = await render(Dropdown, {
			...multiselect_props,
			max_choices: 2
		});

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();
		let options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		await input.focus();
		options = getAllByTestId("dropdown-option");
		await event.click(options[1]);

		const data = await get_data();
		expect((data.value as string[]).length).toBeLessThanOrEqual(2);
	});

	test("max_choices closes the options panel when limit is met", async () => {
		const { container, getAllByTestId, queryAllByTestId } = await render(
			Dropdown,
			{
				...multiselect_props,
				max_choices: 2
			}
		);

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();
		let options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		await input.focus();
		options = getAllByTestId("dropdown-option");
		await event.click(options[1]);

		await waitFor(() => {
			expect(queryAllByTestId("dropdown-option")).toHaveLength(0);
		});
	});

	test("backspace removes the last token when input is empty", async () => {
		const { container, get_data } = await render(Dropdown, {
			...multiselect_props,
			value: ["apple", "banana", "cherry"]
		});

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		await fireEvent.keyDown(input, { key: "Backspace" });

		const data = await get_data();
		expect(data.value).toEqual(["apple", "banana"]);
	});

	test("Enter selects the active option when allow_custom_value is false", async () => {
		const { container, get_data } = await render(Dropdown, {
			...multiselect_props,
			allow_custom_value: false
		});

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		// When allow_custom_value=false, active_index defaults to first filtered option
		await event.keyboard("{Enter}");

		const data = await get_data();
		expect(data.value).toContain("apple");
	});
});

describe("Multiselect: Custom values", () => {
	afterEach(() => cleanup());

	test("allow_custom_value=true: blur adds typed text as token", async () => {
		const { container, get_data } = await render(Dropdown, {
			...multiselect_props,
			allow_custom_value: true
		});

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();
		await event.keyboard("custom_fruit");
		await input.blur();

		const data = await get_data();
		expect(data.value).toEqual(["custom_fruit"]);
	});

	test("allow_custom_value=false: blur clears typed text without adding", async () => {
		const { container, get_data } = await render(Dropdown, {
			...multiselect_props,
			allow_custom_value: false
		});

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();
		await event.keyboard("custom_fruit");
		await input.blur();

		const data = await get_data();
		expect(data.value).toEqual([]);
	});

	test("allow_custom_value=true: Enter adds custom value", async () => {
		const { container, get_data } = await render(Dropdown, {
			...multiselect_props,
			allow_custom_value: true
		});

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();
		await event.keyboard("new_item{Enter}");

		const data = await get_data();
		expect(data.value).toContain("new_item");
	});

	test("mix of choices and custom values", async () => {
		const { container, getAllByTestId, get_data } = await render(Dropdown, {
			...multiselect_props,
			allow_custom_value: true
		});

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		let options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		await input.focus();
		await event.keyboard("custom{Enter}");

		const data = await get_data();
		expect(data.value).toContain("apple");
		expect(data.value).toContain("custom");
	});
});

describe("Multiselect: Filtering", () => {
	afterEach(() => cleanup());

	test("typing filters options", async () => {
		const { container, getAllByTestId } = await render(
			Dropdown,
			multiselect_props
		);

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();
		await event.keyboard("ban");

		const options = getAllByTestId("dropdown-option");
		expect(options).toHaveLength(1);
		expect(options[0]).toHaveAttribute("aria-label", "banana");
	});
});

describe("Multiselect: Events", () => {
	afterEach(() => cleanup());

	test("change fires when option is selected", async () => {
		const { container, getAllByTestId, listen } = await render(
			Dropdown,
			multiselect_props
		);

		const change = listen("change");
		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		expect(change).toHaveBeenCalled();
	});

	test("change fires when value changes via set_data", async () => {
		const { listen, set_data } = await render(Dropdown, multiselect_props);

		const change = listen("change");
		await set_data({ value: ["apple", "banana"] });

		expect(change).toHaveBeenCalled();
	});

	test("select fires with selected=true when adding", async () => {
		const { container, getAllByTestId, listen } = await render(
			Dropdown,
			multiselect_props
		);

		const select = listen("select");
		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[1]);

		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({
				value: "banana",
				selected: true
			})
		);
	});

	test("select fires with selected=false when removing via toggle", async () => {
		const { container, getAllByTestId, listen } = await render(Dropdown, {
			...multiselect_props,
			value: ["banana"]
		});

		const select = listen("select");
		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[1]);

		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({
				value: "banana",
				selected: false
			})
		);
	});

	test("focus fires when input gains focus", async () => {
		const { container, listen } = await render(Dropdown, multiselect_props);

		const focus = listen("focus");
		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		expect(focus).toHaveBeenCalledTimes(1);
	});

	test("blur fires when input loses focus", async () => {
		const { container, listen } = await render(Dropdown, multiselect_props);

		const blur = listen("blur");
		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();
		await input.blur();

		expect(blur).toHaveBeenCalledTimes(1);
	});
});

describe("Multiselect: get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns current value array", async () => {
		const { get_data } = await render(Dropdown, {
			...multiselect_props,
			value: ["apple", "cherry"]
		});

		const data = await get_data();
		expect(data.value).toEqual(["apple", "cherry"]);
	});

	test("get_data returns empty array for no selections", async () => {
		const { get_data } = await render(Dropdown, multiselect_props);

		const data = await get_data();
		expect(data.value).toEqual([]);
	});

	test("set_data updates tokens", async () => {
		const { container, set_data } = await render(Dropdown, multiselect_props);

		await set_data({ value: ["banana", "cherry"] });

		const tokens = container.querySelectorAll(".token");
		expect(tokens).toHaveLength(2);
		expect(tokens[0].textContent).toContain("banana");
		expect(tokens[1].textContent).toContain("cherry");
	});

	test("round-trip: set_data then get_data", async () => {
		const { get_data, set_data } = await render(Dropdown, multiselect_props);

		await set_data({ value: ["apple", "cherry"] });
		const data = await get_data();
		expect(data.value).toEqual(["apple", "cherry"]);
	});

	test("set_data to empty array clears all tokens", async () => {
		const { container, set_data, get_data } = await render(Dropdown, {
			...multiselect_props,
			value: ["apple", "banana"]
		});

		await set_data({ value: [] });

		const tokens = container.querySelectorAll(".token");
		expect(tokens).toHaveLength(0);
		const data = await get_data();
		expect(data.value).toEqual([]);
	});
});

describe("Regression: #12629 — Buttons on multiselect", () => {
	afterEach(() => cleanup());

	test("buttons are rendered in multiselect mode when show_label is true", async () => {
		const { container } = await render(Dropdown, {
			...multiselect_props,
			show_label: true,
			buttons: [{ label: "B1", id: "btn1" }]
		});

		const customButton = container.querySelector(
			"button.custom-button"
		) as HTMLElement;
		expect(customButton).toBeInTheDocument();
	});

	test("buttons are rendered in single-select mode", async () => {
		const { container } = await render(Dropdown, {
			...single_select_props,
			show_label: true,
			buttons: [{ label: "B1", id: "btn1" }]
		});

		const customButton = container.querySelector(
			"button.custom-button"
		) as HTMLElement;
		expect(customButton).toBeInTheDocument();
	});
});

describe("Regression: #12764 — Multiselect event propagation", () => {
	afterEach(() => cleanup());

	test("selecting a multiselect option correctly dispatches select event without side effects", async () => {
		const { container, getAllByTestId, listen } = await render(Dropdown, {
			...multiselect_props,
			value: []
		});

		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");

		const select = listen("select");
		await event.click(options[0]);

		expect(select).toHaveBeenCalledWith(
			expect.objectContaining({
				value: "apple",
				selected: true
			})
		);
	});

	test("selecting a multiselect option with buttons does not trigger custom_button_click", async () => {
		const { container, getAllByTestId, listen } = await render(Dropdown, {
			...multiselect_props,
			show_label: true,
			buttons: [{ label: "TestBtn", id: "test_btn" }],
			value: []
		});

		const custom_click = listen("custom_button_click");
		const input = container.querySelector("input") as HTMLInputElement;
		await input.focus();

		const options = getAllByTestId("dropdown-option");
		await event.click(options[0]);

		expect(custom_click).not.toHaveBeenCalled();
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("empty choices array renders without error", async () => {
		const { getByLabelText, queryAllByTestId } = await render(Dropdown, {
			...single_select_props,
			choices: [],
			value: null
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("");

		await input.focus();
		const options = queryAllByTestId("dropdown-option");
		expect(options).toHaveLength(0);
	});

	test("value not in choices renders empty when custom values not allowed", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			value: "nonexistent",
			allow_custom_value: false
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("");
	});

	test("value not in choices renders as-is when custom values allowed", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			value: "nonexistent",
			allow_custom_value: true
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("nonexistent");
	});

	test("numeric values work correctly", async () => {
		const { get_data, getByLabelText, getAllByTestId } = await render(
			Dropdown,
			{
				...single_select_props,
				choices: [
					["One", 1],
					["Two", 2],
					["Three", 3]
				] as [string, number][],
				value: 1
			}
		);

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("One");

		await input.focus();
		const options = getAllByTestId("dropdown-option");
		await event.click(options[2]);

		const data = await get_data();
		expect(data.value).toBe(3);
	});

	test("blurring after typing reverts to selected display name when custom not allowed", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			choices: [
				["Apple Fruit", "apple_val"],
				["Banana Fruit", "banana_val"]
			] as [string, string][],
			value: "apple_val",
			allow_custom_value: false
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("Apple Fruit");

		await input.focus();
		await event.keyboard("xyz");
		expect(input.value).toBe("Apple Fruitxyz");

		await input.blur();
		expect(input.value).toBe("Apple Fruit");
	});

	test("first item can be default value with tuple choices", async () => {
		const { getByLabelText } = await render(Dropdown, {
			...single_select_props,
			choices: [
				["apple_choice", "apple_internal_value"],
				["zebra_choice", "zebra_internal_value"]
			] as [string, string][],
			value: "apple_internal_value"
		});

		const input = getByLabelText("Dropdown") as HTMLInputElement;
		expect(input.value).toBe("apple_choice");
	});
});

describe("handle_filter", () => {
	const choices: [string, string | number][] = [
		["Apple", "apple"],
		["Banana", "banana"],
		["Cherry", "cherry"],
		["Apricot", "apricot"]
	];

	test("returns all indices when input_text is empty", () => {
		expect(handle_filter(choices, "")).toEqual([0, 1, 2, 3]);
	});

	test("filters by case-insensitive substring match on display name", () => {
		expect(handle_filter(choices, "ap")).toEqual([0, 3]);
	});

	test("returns empty array when no choices match", () => {
		expect(handle_filter(choices, "xyz")).toEqual([]);
	});

	test("matches full display name", () => {
		expect(handle_filter(choices, "banana")).toEqual([1]);
	});

	test("is case-insensitive", () => {
		expect(handle_filter(choices, "CHERRY")).toEqual([2]);
	});

	test("handles empty choices array", () => {
		expect(handle_filter([], "test")).toEqual([]);
	});

	test("matches substring anywhere in display name", () => {
		expect(handle_filter(choices, "an")).toEqual([1]);
	});
});

test.todo(
	"VISUAL: subdued text color applied when input text doesn't match any choice and allow_custom_value is false — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: show_options border/shadow styling changes when dropdown is open — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: token styling in multiselect mode — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: regression #12993 — dropdown options list repositions on page scroll — needs Playwright visual/integration test with scrolling"
);
