import { test, describe, afterEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import Dialogue from "./Index.svelte";
import type { DialogueLine } from "./utils";

// These are backend functions that do not exist when the tests run
// the mocks are neccessary
function mock_server() {
	return {
		format: vi.fn(async (value: DialogueLine[]): Promise<string> => {
			return value.map((line) => `${line.speaker}: ${line.text}`).join("\n");
		}),
		unformat: vi.fn(
			async (params: { text: string }): Promise<DialogueLine[]> => {
				const lines = params.text.split("\n").filter((line) => line.trim());
				return lines.map((line) => {
					const colonIndex = line.indexOf(":");
					if (colonIndex > -1) {
						return {
							speaker: line.slice(0, colonIndex).trim(),
							text: line.slice(colonIndex + 1).trim()
						};
					}
					return { speaker: "", text: line.trim() };
				});
			}
		)
	};
}

const default_props = {
	label: "Dialogue",
	show_label: true,
	interactive: true,
	value: [{ speaker: "Speaker1", text: "Hello" }],
	speakers: ["Speaker1", "Speaker2"],
	tags: ["tag1", "tag2", "tag3"],
	ui_mode: "both" as const,
	max_lines: undefined as number | undefined,
	buttons: ["copy"],
	placeholder: "Enter text...",
	submit_btn: false,
	color_map: undefined as Record<string, string> | undefined,
	separator: "\n",
	info: "",
	server: mock_server()
};

run_shared_prop_tests({
	component: Dialogue,
	name: "Dialogue",
	base_props: {
		value: [{ speaker: "Speaker1", text: "Hello" }],
		speakers: ["Speaker1", "Speaker2"],
		tags: ["tag1", "tag2"],
		ui_mode: "both",
		interactive: true,
		server: mock_server()
	}
});

describe("Dialogue", () => {
	afterEach(() => cleanup());

	test("renders with dialogue lines from value", async () => {
		const { getByDisplayValue } = await render(Dialogue, {
			...default_props,
			value: [
				{ speaker: "Speaker1", text: "Hello world" },
				{ speaker: "Speaker2", text: "How are you?" }
			]
		});

		expect(getByDisplayValue("Hello world")).toBeInTheDocument();
		expect(getByDisplayValue("How are you?")).toBeInTheDocument();
	});

	test("renders empty line when value is empty array and speakers exist", async () => {
		const { getAllByRole } = await render(Dialogue, {
			...default_props,
			value: [],
			speakers: ["Speaker1"]
		});

		// An empty line is automatically added
		const textareas = getAllByRole("textbox");
		expect(textareas.length).toEqual(1);
	});
});

describe("Props: ui_mode", () => {
	afterEach(() => cleanup());

	test("ui_mode='dialogue' shows only dialogue lines view", async () => {
		const { queryByTestId, queryByRole, getByDisplayValue } = await render(
			Dialogue,
			{
				...default_props,
				ui_mode: "dialogue",
				value: [{ speaker: "Speaker1", text: "Hello" }]
			}
		);

		expect(getByDisplayValue("Hello")).toBeInTheDocument();
		expect(queryByTestId("textbox")).not.toBeInTheDocument();
		expect(queryByRole("switch")).not.toBeInTheDocument();
	});

	test("ui_mode='text' shows only plain text view", async () => {
		const { getByTestId, queryByRole } = await render(Dialogue, {
			...default_props,
			ui_mode: "text",
			value: "Plain text value"
		});

		expect(getByTestId("textbox")).toBeInTheDocument();
		expect(queryByRole("switch")).not.toBeInTheDocument();
	});

	test("ui_mode='both' shows dialogue view with switch to toggle", async () => {
		const { getByDisplayValue, getByRole } = await render(Dialogue, {
			...default_props,
			ui_mode: "both",
			value: [{ speaker: "Speaker1", text: "Hello" }]
		});

		expect(getByDisplayValue("Hello")).toBeInTheDocument();
		expect(getByRole("switch")).toBeVisible();
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=false disables textareas", async () => {
		const { getByDisplayValue } = await render(Dialogue, {
			...default_props,
			interactive: false,
			value: [{ speaker: "Speaker1", text: "Hello" }]
		});

		const textarea = getByDisplayValue("Hello") as HTMLTextAreaElement;
		expect(textarea).toBeDisabled();
	});

	test("interactive=true enables textareas", async () => {
		const { getByDisplayValue } = await render(Dialogue, {
			...default_props,
			interactive: true,
			value: [{ speaker: "Speaker1", text: "Hello" }]
		});

		const textarea = getByDisplayValue("Hello") as HTMLTextAreaElement;
		expect(textarea).toBeEnabled();
	});

	test("interactive=false hides add/delete buttons", async () => {
		const { queryByRole } = await render(Dialogue, {
			...default_props,
			interactive: false,
			value: [
				{ speaker: "Speaker1", text: "Line1" },
				{ speaker: "Speaker2", text: "Line2" }
			]
		});

		// When interactive=false, the buttons should not be visible in the DOM
		// because the parent container has class:hidden which removes them from layout
		const addButton = queryByRole("button", { name: "Add new line" });
		const deleteButton = queryByRole("button", { name: "Remove current line" });

		expect(addButton).not.toBeInTheDocument();
		expect(deleteButton).not.toBeInTheDocument();
	});
});

describe("Props: placeholder", () => {
	afterEach(() => cleanup());

	test("placeholder is shown in textarea", async () => {
		const { getByPlaceholderText } = await render(Dialogue, {
			...default_props,
			value: [{ speaker: "Speaker1", text: "" }],
			placeholder: "Type your message here..."
		});

		expect(
			getByPlaceholderText("Type your message here...")
		).toBeInTheDocument();
	});
});

describe("Props: submit_btn", () => {
	afterEach(() => cleanup());

	test("submit_btn=false does not render submit button", async () => {
		const { queryByTestId } = await render(Dialogue, {
			...default_props,
			submit_btn: false
		});

		const submitButton = queryByTestId("dialogue-submit-button");
		expect(submitButton).not.toBeInTheDocument();
	});

	test("submit_btn=true renders default submit button", async () => {
		const { getByTestId } = await render(Dialogue, {
			...default_props,
			submit_btn: true
		});

		const submitButton = getByTestId("dialogue-submit-button");
		expect(submitButton).toBeInTheDocument();
	});

	test("submit_btn='Custom Text' renders submit button with custom text", async () => {
		const { getByRole } = await render(Dialogue, {
			...default_props,
			submit_btn: "Send Message"
		});

		const submitButton = getByRole("button", { name: "Send Message" });
		expect(submitButton).toBeInTheDocument();
	});
});

describe("Props: buttons", () => {
	afterEach(() => cleanup());

	test("buttons=['copy'] shows copy button", async () => {
		const { getByLabelText } = await render(Dialogue, {
			...default_props,
			buttons: ["copy"]
		});

		expect(getByLabelText("Copy")).toBeInTheDocument();
	});

	test("custom buttons trigger custom_button_click event", async () => {
		const { getByLabelText, listen } = await render(Dialogue, {
			...default_props,
			buttons: [{ value: "custom", id: 42, icon: null }]
		});

		const customClick = listen("custom_button_click");
		const customButton = getByLabelText("custom");
		await fireEvent.click(customButton);

		expect(customClick).toHaveBeenCalledTimes(1);
		expect(customClick).toHaveBeenCalledWith({ id: 42 });
	});
});

describe("Props: max_lines", () => {
	afterEach(() => cleanup());

	test("add button is hidden when max_lines is reached", async () => {
		const { queryAllByTestId } = await render(Dialogue, {
			...default_props,
			max_lines: 2,
			value: [
				{ speaker: "Speaker1", text: "Line1" },
				{ speaker: "Speaker2", text: "Line2" }
			]
		});

		const addButtons = queryAllByTestId(/^dialogue-add-button-/);
		expect(addButtons.length).toBe(1);
	});
});

describe("Props: tags", () => {
	afterEach(() => cleanup());

	test("typing ':' shows tag autocomplete menu with matching options", async () => {
		const { getByDisplayValue, queryByTestId } = await render(Dialogue, {
			...default_props,
			tags: ["greeting", "farewell", "question"],
			value: [{ speaker: "Speaker1", text: "" }]
		});

		const textarea = getByDisplayValue("") as HTMLTextAreaElement;
		textarea.focus();
		await event.type(textarea, "Hello :");

		expect(queryByTestId("dialogue-tag-menu")).toBeInTheDocument();
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("input event is dispatched when text is entered", async () => {
		const { getByDisplayValue, listen } = await render(Dialogue, {
			...default_props,
			value: [{ speaker: "Speaker1", text: "" }]
		});

		const inputEvent = listen("input");
		const textarea = getByDisplayValue("") as HTMLTextAreaElement;
		textarea.focus();
		await event.type(textarea, "abc");

		expect(inputEvent).toHaveBeenCalled();
	});

	test("change event is dispatched when value changes from outside", async () => {
		const { listen, set_data } = await render(Dialogue, {
			...default_props,
			value: [{ speaker: "Speaker1", text: "Initial" }]
		});

		const changeEvent = listen("change");
		await set_data({ value: [{ speaker: "Speaker1", text: "Updated" }] });

		expect(changeEvent).toHaveBeenCalledTimes(1);
	});

	test("submit event is dispatched when submit button is clicked", async () => {
		const { getByTestId, listen } = await render(Dialogue, {
			...default_props,
			submit_btn: true
		});

		const submitEvent = listen("submit");
		const submitButton = getByTestId("dialogue-submit-button");
		await fireEvent.click(submitButton);

		expect(submitEvent).toHaveBeenCalledTimes(1);
	});

	test("no spurious change event on mount", async () => {
		const { listen } = await render(Dialogue, {
			...default_props,
			value: [{ speaker: "Speaker1", text: "Hello" }]
		});

		const changeEvent = listen("change", { retrospective: true });
		expect(changeEvent).not.toHaveBeenCalled();
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("set_data updates the dialogue lines", async () => {
		const { getByDisplayValue, set_data } = await render(Dialogue, {
			...default_props,
			value: [{ speaker: "Speaker1", text: "Hello world" }]
		});

		const initialTextarea = getByDisplayValue("Hello world");
		expect(initialTextarea).toBeInTheDocument();

		await set_data({ value: [{ speaker: "Speaker1", text: "Updated value" }] });

		const updatedTextarea = getByDisplayValue("Updated value");
		expect(updatedTextarea).toBeInTheDocument();
		expect(() => getByDisplayValue("Hello world")).toThrow();
	});

	test("set_data with string value switches to plain text mode", async () => {
		const { getByTestId, set_data } = await render(Dialogue, {
			...default_props,
			ui_mode: "both",
			value: [{ speaker: "Speaker1", text: "Dialogue mode" }]
		});

		await set_data({ value: "Plain text mode value" });

		const textbox = getByTestId("textbox") as HTMLTextAreaElement;
		expect(textbox.value).toBe("Plain text mode value");
	});

	test("get_data returns current dialogue value", async () => {
		const { get_data } = await render(Dialogue, {
			...default_props,
			value: [{ speaker: "Speaker1", text: "Hello" }]
		});

		await vi.waitFor(async () => {
			const data = await get_data();
			expect(data.value).toEqual([{ speaker: "Speaker1", text: "Hello" }]);
		});
	});

	test("get_data reflects user input changes", async () => {
		const { get_data, getByDisplayValue } = await render(Dialogue, {
			...default_props,
			value: [{ speaker: "Speaker1", text: "" }]
		});

		const textarea = getByDisplayValue("") as HTMLTextAreaElement;
		textarea.focus();
		await event.type(textarea, "User typed text");

		const data = await get_data();
		expect(data.value).toBeDefined();
		expect(data.value[0]).toBeDefined();
		expect(data.value[0].text).toBe("User typed text");
	});
});

describe("Interactive features", () => {
	afterEach(() => cleanup());

	test("clicking add button creates a new dialogue line", async () => {
		const { getByTestId, getByDisplayValue } = await render(Dialogue, {
			...default_props,
			value: [{ speaker: "Speaker1", text: "First line" }]
		});

		const addButton = getByTestId("dialogue-add-button-0");
		await fireEvent.click(addButton);

		expect(getByDisplayValue("First line")).toBeInTheDocument();
		expect(getByTestId("dialogue-add-button-1")).toBeInTheDocument();
	});

	test("clicking delete button removes a dialogue line", async () => {
		const { getByTestId, getByDisplayValue, queryByDisplayValue } =
			await render(Dialogue, {
				...default_props,
				value: [
					{ speaker: "Speaker1", text: "Line 1" },
					{ speaker: "Speaker2", text: "Line 2" }
				]
			});

		expect(getByDisplayValue("Line 1")).toBeInTheDocument();
		expect(getByDisplayValue("Line 2")).toBeInTheDocument();

		const deleteButton = getByTestId("dialogue-delete-button-1");
		await fireEvent.click(deleteButton);

		expect(getByDisplayValue("Line 1")).toBeInTheDocument();
		expect(queryByDisplayValue("Line 2")).not.toBeInTheDocument();
	});
});

describe("Mode switching", () => {
	afterEach(() => cleanup());

	test("mock server format/unformat round-trip works correctly", async () => {
		const serverMock = mock_server();
		const { getByTestId, getByDisplayValue, getByRole } = await render(
			Dialogue,
			{
				...default_props,
				ui_mode: "both",
				value: [
					{ speaker: "Speaker1", text: "Hello world" },
					{ speaker: "Speaker2", text: "How are you?" }
				],
				server: serverMock
			}
		);

		const switchButton = getByRole("switch");
		await fireEvent.click(switchButton);

		expect(serverMock.format).toHaveBeenCalled();
		expect(serverMock.format).toHaveBeenCalledWith(
			expect.arrayContaining([
				expect.objectContaining({
					speaker: "Speaker1",
					text: "Hello world"
				}),
				expect.objectContaining({
					speaker: "Speaker2",
					text: "How are you?"
				})
			])
		);

		const textbox = getByTestId("textbox") as HTMLTextAreaElement;
		expect(textbox.value).toBe("Speaker1: Hello world\nSpeaker2: How are you?");

		await fireEvent.click(switchButton);

		expect(serverMock.unformat).toHaveBeenCalled();
		expect(serverMock.unformat).toHaveBeenCalledWith(
			expect.objectContaining({
				text: "Speaker1: Hello world\nSpeaker2: How are you?"
			})
		);

		expect(getByDisplayValue("Hello world")).toBeInTheDocument();
		expect(getByDisplayValue("How are you?")).toBeInTheDocument();
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("handles undefined max_lines", async () => {
		const { queryAllByTestId } = await render(Dialogue, {
			...default_props,
			max_lines: undefined,
			value: [
				{ speaker: "Speaker1", text: "Line 1" },
				{ speaker: "Speaker2", text: "Line 2" },
				{ speaker: "Speaker1", text: "Line 3" }
			]
		});

		const addButtons = queryAllByTestId(/^dialogue-add-button-/);
		expect(addButtons.length).toBe(3);
	});

	test("event deduplication: change not fired for identical value", async () => {
		const { listen, set_data } = await render(Dialogue, {
			...default_props,
			value: [{ speaker: "Speaker1", text: "Hello" }]
		});

		const changeEvent = listen("change", { retrospective: true });
		await set_data({ value: [{ speaker: "Speaker1", text: "Hello" }] });
		expect(changeEvent).not.toHaveBeenCalled();
	});
});

describe("Plain text mode", () => {
	afterEach(() => cleanup());

	test("switching to plain text mode shows textarea", async () => {
		const { getByTestId, getByRole } = await render(Dialogue, {
			...default_props,
			ui_mode: "both",
			value: [{ speaker: "Speaker1", text: "Dialogue text" }]
		});

		await fireEvent.click(getByRole("switch"));

		expect(getByTestId("textbox")).toBeInTheDocument();
	});

	test("plain text mode with string initial value", async () => {
		const { getByTestId } = await render(Dialogue, {
			...default_props,
			ui_mode: "text",
			value: "Initial plain text"
		});

		const textbox = getByTestId("textbox") as HTMLTextAreaElement;
		expect(textbox.value).toBe("Initial plain text");
	});
});

test.todo(
	"VISUAL: color_map prop applies custom colors to speaker backgrounds — needs Playwright visual regression screenshot comparison"
);

test.todo(
	"VISUAL: default speaker colors are applied when color_map is not provided — needs Playwright visual regression screenshot comparison"
);
