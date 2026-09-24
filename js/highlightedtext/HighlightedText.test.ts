import { test, describe, afterEach, expect } from "vitest";
import { cleanup, fireEvent, render } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import HighlightedText from "./Index.svelte";

run_shared_prop_tests({
	component: HighlightedText,
	name: "HighlightedText",
	has_label: false,
	base_props: {
		value: [{ token: "Hello", class_or_confidence: null }],
		interactive: false
	}
});

describe("HighlightedText", () => {
	afterEach(() => cleanup());

	test("renders provided text and labels", async () => {
		const { getByText, getAllByText } = await render(HighlightedText, {
			interactive: false,
			value: [
				{ token: "The", class_or_confidence: null },
				{ token: "quick", class_or_confidence: "adjective" },
				{ token: " sneaky", class_or_confidence: "adjective" },
				{ token: "fox", class_or_confidence: "subject" },
				{ token: " jumped ", class_or_confidence: "past tense verb" },
				{ token: "over the", class_or_confidence: null },
				{ token: "lazy dog", class_or_confidence: "object" }
			]
		});

		const quick = getByText("quick");
		const adjectiveLabels = getAllByText("adjective");

		expect(quick).toBeVisible();
		expect(adjectiveLabels).toHaveLength(2);
	});

	test("renders a remove button per labelled token which dispatches change", async () => {
		const { getAllByLabelText, listen } = await render(HighlightedText, {
			interactive: true,
			value: [
				{ token: "The", class_or_confidence: null },
				{ token: "quick", class_or_confidence: "adjective" },
				{ token: " sneaky", class_or_confidence: "adjective" },
				{ token: "fox", class_or_confidence: "subject" },
				{ token: " jumped ", class_or_confidence: "past tense  verb" },
				{ token: "over the", class_or_confidence: null },
				{ token: "lazy dog", class_or_confidence: "object" }
			]
		});

		const change = listen("change");

		const removeButtons = getAllByLabelText("Remove label");

		expect(removeButtons).toHaveLength(5);
		expect(change).not.toHaveBeenCalled();

		await fireEvent.click(removeButtons[0]);

		expect(change).toHaveBeenCalledTimes(1);
	});

	describe("Score mode", () => {
		test("renders tokens with numeric confidence scores", async () => {
			const { getByText, getByTestId } = await render(HighlightedText, {
				interactive: false,
				value: [
					{ token: "good", class_or_confidence: 0.8 },
					{ token: " ", class_or_confidence: 0 },
					{ token: "bad", class_or_confidence: -0.6 }
				]
			});

			const goodToken = getByText("good");
			const badToken = getByText("bad");

			expect(goodToken).toBeVisible();
			expect(badToken).toBeVisible();

			expect(getByTestId("highlighted-text:textfield")).toBeVisible();
		});

		test("does not show category labels in score mode", async () => {
			const { queryAllByText } = await render(HighlightedText, {
				interactive: false,
				value: [
					{ token: "positive", class_or_confidence: 0.5 },
					{ token: "negative", class_or_confidence: -0.5 }
				]
			});

			expect(queryAllByText("0.5")).toHaveLength(0);
		});
	});

	describe("Legend", () => {
		test("shows category legend when show_legend is true", async () => {
			const { getByTestId, getByText } = await render(HighlightedText, {
				interactive: false,
				show_legend: true,
				value: [
					{ token: "Hello", class_or_confidence: "greeting" },
					{ token: "world", class_or_confidence: "noun" }
				]
			});

			expect(getByTestId("highlighted-text:category-legend")).toBeVisible();
			expect(getByText("greeting")).toBeVisible();
			expect(getByText("noun")).toBeVisible();
		});

		test("shows score legend when show_legend is true in score mode", async () => {
			const { getByTestId } = await render(HighlightedText, {
				interactive: false,
				show_legend: true,
				value: [
					{ token: "positive", class_or_confidence: 0.8 },
					{ token: "negative", class_or_confidence: -0.5 }
				]
			});

			expect(getByTestId("highlighted-text:color-legend")).toBeVisible();
		});

		test("hides legend when show_legend is false", async () => {
			const { queryByTestId } = await render(HighlightedText, {
				interactive: false,
				show_legend: false,
				value: [{ token: "Hello", class_or_confidence: "greeting" }]
			});

			expect(
				queryByTestId("highlighted-text:category-legend")
			).not.toBeInTheDocument();
		});
	});

	describe("Select events", () => {
		test("dispatches select when clicking an unlabeled selectable token", async () => {
			const { getByRole, listen } = await render(HighlightedText, {
				interactive: false,
				_selectable: true,
				value: [{ token: "clickable", class_or_confidence: null }]
			});

			const select = listen("select");
			await fireEvent.click(getByRole("button", { name: "clickable" }));

			expect(select).toHaveBeenCalledTimes(1);
			expect(select).toHaveBeenCalledWith({
				index: 0,
				value: ["clickable", null]
			});
		});

		test("does not select an unlabeled token without a select listener", async () => {
			const { getByText, queryByRole, listen } = await render(HighlightedText, {
				interactive: false,
				_selectable: false,
				value: [{ token: "static", class_or_confidence: null }]
			});

			const select = listen("select");
			expect(queryByRole("button", { name: "static" })).not.toBeInTheDocument();
			await fireEvent.click(getByText("static"));

			expect(select).not.toHaveBeenCalled();
		});

		test.each([
			["Enter", "{Enter}"],
			["Space", " "]
		])(
			"dispatches select from the %s key on an unlabeled selectable token",
			async (_key_name, key) => {
				const { getByRole, listen } = await render(HighlightedText, {
					interactive: false,
					_selectable: true,
					value: [{ token: "keyboard", class_or_confidence: null }]
				});

				const select = listen("select");
				getByRole("button", { name: "keyboard" }).focus();
				await event.keyboard(key);

				expect(select).toHaveBeenCalledTimes(1);
				expect(select).toHaveBeenCalledWith({
					index: 0,
					value: ["keyboard", null]
				});
			}
		);

		test("ignores repeated activation keydowns", async () => {
			const { getByRole, listen } = await render(HighlightedText, {
				interactive: false,
				_selectable: true,
				value: [{ token: "keyboard", class_or_confidence: null }]
			});

			const select = listen("select");
			const token = getByRole("button", { name: "keyboard" });
			await fireEvent.keyDown(token, { key: "Enter", repeat: true });

			expect(select).not.toHaveBeenCalled();

			await fireEvent.keyDown(token, { key: "Enter" });

			expect(select).toHaveBeenCalledTimes(1);
		});

		test("dispatches the rendered line when selecting a multiline token", async () => {
			const { getByRole, listen } = await render(HighlightedText, {
				interactive: false,
				_selectable: true,
				value: [
					{
						token: "first line\nsecond line",
						class_or_confidence: null
					}
				]
			});

			const select = listen("select");
			await fireEvent.click(getByRole("button", { name: "second line" }));

			expect(select).toHaveBeenCalledWith({
				index: 0,
				value: ["second line", null]
			});
		});

		test("keeps selectable category tokens in one roving tab stop", async () => {
			const { getAllByRole } = await render(HighlightedText, {
				interactive: false,
				_selectable: true,
				value: Array.from({ length: 47 }, (_, index) => ({
					token: `token ${index + 1}`,
					class_or_confidence: null
				}))
			});

			const tokens = getAllByRole("button");
			expect(tokens.filter((token) => token.tabIndex === 0)).toHaveLength(1);
			expect(tokens[0]).toHaveAttribute("tabindex", "0");
			expect(tokens[1]).toHaveAttribute("tabindex", "-1");

			tokens[0].focus();
			await event.keyboard("{ArrowRight}");

			expect(tokens[1]).toHaveFocus();
			expect(tokens[1]).toHaveAttribute("tabindex", "0");
			expect(tokens[0]).toHaveAttribute("tabindex", "-1");
		});

		test("does not expose labeled static output as buttons without a select listener", async () => {
			const { queryByRole } = await render(HighlightedText, {
				interactive: false,
				_selectable: false,
				value: [{ token: "static label", class_or_confidence: "category" }]
			});

			expect(
				queryByRole("button", { name: /static label/ })
			).not.toBeInTheDocument();
		});

		test("dispatches select event when clicking highlighted token", async () => {
			const { getByRole, listen } = await render(HighlightedText, {
				interactive: true,
				value: [{ token: "clickable", class_or_confidence: "label" }]
			});

			const select = listen("select");
			const token = getByRole("button", { name: /clickable/ });

			await fireEvent.click(token);

			expect(select).toHaveBeenCalledWith({
				index: 0,
				value: ["clickable", "label"]
			});
		});

		test("dispatches select event in non-interactive mode too", async () => {
			const { getByRole, listen } = await render(HighlightedText, {
				interactive: false,
				_selectable: true,
				value: [{ token: "clickable", class_or_confidence: "label" }]
			});

			const select = listen("select");
			const token = getByRole("button", { name: /clickable/ });

			await fireEvent.click(token);

			expect(select).toHaveBeenCalledWith({
				index: 0,
				value: ["clickable", "label"]
			});
		});
	});

	describe("Interactive editing", () => {
		test("shows label input when clicking on highlighted token in interactive mode", async () => {
			const { getByText, getByRole } = await render(HighlightedText, {
				interactive: true,
				value: [{ token: "editable", class_or_confidence: "original" }]
			});

			const token = getByText("editable");
			await fireEvent.click(token);

			expect(getByRole("textbox")).toBeInTheDocument();
		});

		test("preserves spaces while editing a label without extra select events", async () => {
			const { getByText, getByRole, queryByRole, listen } = await render(
				HighlightedText,
				{
					interactive: true,
					_selectable: true,
					value: [{ token: "editable", class_or_confidence: "original" }]
				}
			);

			const select = listen("select");
			await fireEvent.click(getByText("editable"));
			const select_calls_after_click = select.mock.calls.length;
			const input = getByRole("textbox");

			await fireEvent.input(input, { target: { value: "" } });
			input.focus();
			await event.keyboard("NAMED ENTITY");

			expect(input).toHaveValue("NAMED ENTITY");
			expect(select).toHaveBeenCalledTimes(select_calls_after_click);

			await event.keyboard("{Enter}");

			expect(queryByRole("textbox")).not.toBeInTheDocument();
			expect(select).toHaveBeenCalledTimes(select_calls_after_click);
		});

		test("closes the score editor on Enter without reopening it", async () => {
			const { getByRole, queryByRole, get_data } = await render(
				HighlightedText,
				{
					interactive: true,
					value: [
						{ token: "alpha", class_or_confidence: 0.5 },
						{ token: "beta", class_or_confidence: -0.5 }
					]
				}
			);

			await fireEvent.click(getByRole("button", { name: "alpha" }));
			const input = getByRole("spinbutton");
			await fireEvent.input(input, { target: { value: "0.7" } });
			input.focus();
			await event.keyboard("{Enter}");

			expect(queryByRole("spinbutton")).not.toBeInTheDocument();
			expect((await get_data()).value).toEqual([
				{ token: "alpha", class_or_confidence: 0.7 },
				{ token: "beta", class_or_confidence: -0.5 }
			]);
		});

		test("keeps score tokens in one roving tab stop and ignores repeat keydowns", async () => {
			const { getAllByRole, listen } = await render(HighlightedText, {
				interactive: false,
				_selectable: true,
				value: [
					{ token: "positive", class_or_confidence: 0.5 },
					{ token: "negative", class_or_confidence: -0.5 }
				]
			});

			const select = listen("select");
			const tokens = getAllByRole("button");
			expect(tokens[0]).toHaveAttribute("tabindex", "0");
			expect(tokens[1]).toHaveAttribute("tabindex", "-1");

			tokens[0].focus();
			await fireEvent.keyDown(tokens[0], { key: "Enter", repeat: true });
			expect(select).not.toHaveBeenCalled();

			await event.keyboard("{ArrowRight}");
			expect(tokens[1]).toHaveFocus();
		});

		test("editing a label updates the value and dispatches change", async () => {
			const { getByText, getByPlaceholderText, listen, get_data } =
				await render(HighlightedText, {
					interactive: true,
					value: [{ token: "editable", class_or_confidence: "original" }]
				});

			const change = listen("change");
			await fireEvent.click(getByText("editable"));

			const input = getByPlaceholderText("label");
			await event.clear(input);
			await event.type(input, "updated");
			await fireEvent.blur(input);

			expect(change).toHaveBeenCalled();
			expect((await get_data()).value).toEqual([
				{ token: "editable", class_or_confidence: "updated" }
			]);
		});

		test("does not show label input in non-interactive mode", async () => {
			const { getByText, queryByRole } = await render(HighlightedText, {
				interactive: false,
				value: [{ token: "not-editable", class_or_confidence: "label" }]
			});

			const token = getByText("not-editable");
			await fireEvent.click(token);

			expect(queryByRole("textbox")).not.toBeInTheDocument();
		});
	});
});

describe("Props: combine_adjacent", () => {
	afterEach(() => cleanup());

	const adjacent = [
		{ token: "The ", class_or_confidence: null },
		{ token: "quick", class_or_confidence: "adjective" },
		{ token: " brown", class_or_confidence: "adjective" },
		{ token: " fox", class_or_confidence: "noun" }
	];

	test("adjacent tokens sharing a category are merged into one", async () => {
		const { getByText } = await render(HighlightedText, {
			interactive: false,
			combine_adjacent: true,
			value: adjacent
		});

		expect(getByText("quick brown")).toBeVisible();
	});

	test("merged tokens carry a single category label", async () => {
		const { getAllByText } = await render(HighlightedText, {
			interactive: false,
			combine_adjacent: true,
			value: adjacent
		});

		expect(getAllByText("adjective")).toHaveLength(1);
	});

	test("adjacent tokens are kept separate when combine_adjacent is false", async () => {
		const { getAllByText, queryByText } = await render(HighlightedText, {
			interactive: false,
			combine_adjacent: false,
			value: adjacent
		});

		expect(queryByText("quick brown")).not.toBeInTheDocument();
		expect(getAllByText("adjective")).toHaveLength(2);
	});

	test("tokens with different categories are never merged", async () => {
		const { getByText } = await render(HighlightedText, {
			interactive: false,
			combine_adjacent: true,
			value: adjacent
		});

		expect(getByText("fox")).toBeVisible();
	});
});

describe("Props: show_inline_category", () => {
	afterEach(() => cleanup());

	test("the category is shown beside its token by default", async () => {
		const { getByText } = await render(HighlightedText, {
			interactive: false,
			show_inline_category: true,
			value: [{ token: "Hello", class_or_confidence: "greeting" }]
		});

		expect(getByText("greeting")).toBeVisible();
	});

	test("show_inline_category: false hides the category beside the token", async () => {
		const { getByText, queryByText } = await render(HighlightedText, {
			interactive: false,
			show_inline_category: false,
			value: [{ token: "Hello", class_or_confidence: "greeting" }]
		});

		expect(getByText("Hello")).toBeVisible();
		expect(queryByText("greeting")).not.toBeInTheDocument();
	});

	test("the inline category gives way to the legend when both are on", async () => {
		const { getAllByText } = await render(HighlightedText, {
			interactive: false,
			show_legend: true,
			show_inline_category: true,
			value: [{ token: "Hello", class_or_confidence: "greeting" }]
		});

		// Only the legend entry remains — the inline copy is suppressed.
		expect(getAllByText("greeting")).toHaveLength(1);
	});
});

describe("Props: show_whitespaces", () => {
	afterEach(() => cleanup());

	test("whitespace-only tokens are dropped by default", async () => {
		const { queryAllByText } = await render(HighlightedText, {
			interactive: false,
			show_whitespaces: false,
			value: [
				{ token: "a", class_or_confidence: "x" },
				{ token: "   ", class_or_confidence: "gap" },
				{ token: "b", class_or_confidence: "x" }
			]
		});

		expect(queryAllByText("gap")).toHaveLength(0);
	});

	test("show_whitespaces: true keeps whitespace-only tokens", async () => {
		const { getAllByText } = await render(HighlightedText, {
			interactive: false,
			show_whitespaces: true,
			value: [
				{ token: "a", class_or_confidence: "x" },
				{ token: "   ", class_or_confidence: "gap" },
				{ token: "b", class_or_confidence: "x" }
			]
		});

		expect(getAllByText("gap")).toHaveLength(1);
	});

	test("blank lines inside a multiline token are dropped by default", async () => {
		const { getByText, queryAllByRole } = await render(HighlightedText, {
			interactive: false,
			_selectable: true,
			show_whitespaces: false,
			value: [{ token: "first\n\nlast", class_or_confidence: null }]
		});

		expect(getByText("first")).toBeVisible();
		expect(queryAllByRole("button")).toHaveLength(2);
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	const button_props = {
		interactive: true,
		label: "Entities",
		show_label: true,
		value: [{ token: "Hello", class_or_confidence: "greeting" }]
	};

	test("a custom button is rendered with its label", async () => {
		const { getByLabelText } = await render(HighlightedText, {
			...button_props,
			buttons: [{ value: "Reset", id: 4, icon: null }]
		});

		expect(getByLabelText("Reset")).toBeVisible();
	});

	test("clicking a custom button dispatches custom_button_click with its id", async () => {
		const { getByLabelText, listen } = await render(HighlightedText, {
			...button_props,
			buttons: [{ value: "Reset", id: 4, icon: null }]
		});
		const custom = listen("custom_button_click");

		await fireEvent.click(getByLabelText("Reset"));

		expect(custom).toHaveBeenCalledTimes(1);
		expect(custom).toHaveBeenCalledWith({ id: 4 });
	});

	test("buttons are not rendered in non-interactive mode", async () => {
		const { queryByLabelText } = await render(HighlightedText, {
			...button_props,
			interactive: false,
			buttons: [{ value: "Reset", id: 4, icon: null }]
		});

		expect(queryByLabelText("Reset")).not.toBeInTheDocument();
	});

	test("buttons are not rendered when the label is hidden", async () => {
		const { queryByLabelText } = await render(HighlightedText, {
			...button_props,
			show_label: false,
			buttons: [{ value: "Reset", id: 4, icon: null }]
		});

		expect(queryByLabelText("Reset")).not.toBeInTheDocument();
	});
});

describe("Props: label / show_label", () => {
	afterEach(() => cleanup());

	test("the label is rendered when show_label is true", async () => {
		const { getByText } = await render(HighlightedText, {
			interactive: false,
			label: "Entities",
			show_label: true,
			value: [{ token: "Hello", class_or_confidence: "greeting" }]
		});

		expect(getByText("Entities")).toBeVisible();
	});

	test("show_label: false removes the label from the DOM", async () => {
		const { queryByText } = await render(HighlightedText, {
			interactive: false,
			label: "Entities",
			show_label: false,
			value: [{ token: "Hello", class_or_confidence: "greeting" }]
		});

		expect(queryByText("Entities")).not.toBeInTheDocument();
	});

	test("an empty label renders no label element", async () => {
		const { queryByText } = await render(HighlightedText, {
			interactive: false,
			label: "",
			show_label: true,
			value: [{ token: "Hello", class_or_confidence: "greeting" }]
		});

		expect(queryByText("Entities")).not.toBeInTheDocument();
	});
});

describe("Empty state", () => {
	afterEach(() => cleanup());

	test("an empty value renders no tokens", async () => {
		const { queryByTestId } = await render(HighlightedText, {
			interactive: false,
			value: []
		});

		expect(
			queryByTestId("highlighted-text:category-legend")
		).not.toBeInTheDocument();
	});

	test("a null value renders no tokens", async () => {
		const { queryByText } = await render(HighlightedText, {
			interactive: false,
			value: null
		});

		expect(queryByText("Hello")).not.toBeInTheDocument();
	});

	test("the empty state is replaced once a value arrives", async () => {
		const { set_data, getByText } = await render(HighlightedText, {
			interactive: false,
			value: null
		});

		await set_data({ value: [{ token: "Hello", class_or_confidence: null }] });

		expect(getByText("Hello")).toBeVisible();
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change is not dispatched on mount", async () => {
		const { listen } = await render(HighlightedText, {
			interactive: false,
			value: [{ token: "Hello", class_or_confidence: null }]
		});
		const change = listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();
	});

	test("change is dispatched when a new value arrives", async () => {
		const { listen, set_data } = await render(HighlightedText, {
			interactive: false,
			value: [{ token: "Hello", class_or_confidence: null }]
		});
		const change = listen("change");

		await set_data({
			value: [{ token: "Goodbye", class_or_confidence: null }]
		});

		expect(change).toHaveBeenCalledTimes(1);
	});

	test("an edit and a value pushed from the server each dispatch change once", async () => {
		const { getAllByLabelText, listen, set_data } = await render(
			HighlightedText,
			{
				interactive: true,
				value: [{ token: "Hello", class_or_confidence: "greeting" }]
			}
		);
		const change = listen("change");

		await fireEvent.click(getAllByLabelText("Remove label")[0]);
		expect(change).toHaveBeenCalledTimes(1);

		await set_data({
			value: [{ token: "Goodbye", class_or_confidence: "parting" }]
		});
		expect(change).toHaveBeenCalledTimes(2);
	});

	test("change is not dispatched when an unrelated prop changes", async () => {
		const { listen, set_data } = await render(HighlightedText, {
			interactive: false,
			value: [{ token: "Hello", class_or_confidence: null }]
		});
		const change = listen("change");

		await set_data({ show_legend: true });

		expect(change).not.toHaveBeenCalled();
	});

	test("clear_status is dispatched when the error status is dismissed", async () => {
		const { listen, getByLabelText } = await render(HighlightedText, {
			interactive: false,
			value: [{ token: "Hello", class_or_confidence: null }],
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
	afterEach(() => cleanup());

	const value = [
		{ token: "Hello", class_or_confidence: "greeting" },
		{ token: " world", class_or_confidence: null }
	];

	test("get_data returns the current tokens", async () => {
		const { get_data } = await render(HighlightedText, {
			interactive: false,
			value
		});

		expect((await get_data()).value).toEqual(value);
	});

	test("set_data updates the rendered tokens", async () => {
		const { set_data, getByText, queryByText } = await render(HighlightedText, {
			interactive: false,
			value
		});

		await set_data({
			value: [{ token: "Replaced", class_or_confidence: "other" }]
		});

		expect(getByText("Replaced")).toBeVisible();
		expect(queryByText("Hello")).not.toBeInTheDocument();
	});

	test("set_data round-trips through get_data", async () => {
		const { set_data, get_data } = await render(HighlightedText, {
			interactive: false,
			value: []
		});

		await set_data({ value });

		expect((await get_data()).value).toEqual(value);
	});

	test("set_data can switch the component from categories to scores", async () => {
		const { set_data, getByTestId } = await render(HighlightedText, {
			interactive: false,
			show_legend: true,
			value
		});

		await set_data({ value: [{ token: "Hello", class_or_confidence: 0.5 }] });

		expect(getByTestId("highlighted-text:color-legend")).toBeVisible();
	});

	test("removing a label is reflected in get_data", async () => {
		const { getAllByLabelText, get_data } = await render(HighlightedText, {
			interactive: true,
			value: [{ token: "Hello", class_or_confidence: "greeting" }]
		});

		await fireEvent.click(getAllByLabelText("Remove label")[0]);

		expect((await get_data()).value).toEqual([
			{ token: "Hello", class_or_confidence: null }
		]);
	});
});
