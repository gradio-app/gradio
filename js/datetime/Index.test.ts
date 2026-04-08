import { test, describe, afterEach, expect } from "vitest";
import { cleanup, render, fireEvent, waitFor } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";

import DateTime from "./Index.svelte";
import { tick } from "svelte";

const default_props = {
	show_label: true,
	value: "2020-10-15 12:30:00",
	label: "DateTime",
	include_time: true,
	interactive: true
};

run_shared_prop_tests({
	component: DateTime,
	name: "DateTime",
	base_props: { value: "", include_time: true, interactive: true },
	// DateTime dispatches a bare 'change' with no payload and does not render
	// a validation_error element; disable the shared validation error test.
	has_validation_error: false
});

describe("DateTime", () => {
	afterEach(() => cleanup());

	test("renders the provided value in the input", async () => {
		const { getByDisplayValue } = await render(DateTime, {
			...default_props,
			value: "2020-10-15 12:30:00"
		});
		const input = getByDisplayValue("2020-10-15 12:30:00") as HTMLInputElement;
		expect(input.value).toBe("2020-10-15 12:30:00");
	});

	test("null value renders an empty input", async () => {
		const { getByRole } = await render(DateTime, {
			...default_props,
			value: null
		});
		const input = getByRole("textbox") as HTMLInputElement;
		expect(input.value).toBe("");
	});

	test("empty string value renders an empty input", async () => {
		const { getByRole } = await render(DateTime, {
			...default_props,
			value: ""
		});
		const input = getByRole("textbox") as HTMLInputElement;
		expect(input.value).toBe("");
	});
});

describe("Props: include_time", () => {
	afterEach(() => cleanup());

	test("include_time=true shows YYYY-MM-DD HH:MM:SS placeholder", async () => {
		const { getByPlaceholderText } = await render(DateTime, {
			...default_props,
			value: "",
			include_time: true
		});
		expect(getByPlaceholderText("YYYY-MM-DD HH:MM:SS")).toBeTruthy();
	});

	test("include_time=false shows YYYY-MM-DD placeholder", async () => {
		const { getByPlaceholderText } = await render(DateTime, {
			...default_props,
			value: "",
			include_time: false
		});
		expect(getByPlaceholderText("YYYY-MM-DD")).toBeTruthy();
	});

	test("include_time=false renders a date-only value correctly", async () => {
		const { getByDisplayValue } = await render(DateTime, {
			...default_props,
			value: "2020-10-15",
			include_time: false
		});
		expect(getByDisplayValue("2020-10-15")).toBeTruthy();
	});
});

describe("Props: interactive", () => {
	afterEach(() => cleanup());

	test("interactive=true enables the input", async () => {
		const { getByRole } = await render(DateTime, {
			...default_props,
			interactive: true
		});
		expect(getByRole("textbox")).toBeEnabled();
	});

	test("interactive=false disables the input", async () => {
		const { getByRole } = await render(DateTime, {
			...default_props,
			interactive: false
		});
		expect(getByRole("textbox")).toBeDisabled();
	});

	test("interactive=true renders the calendar button", async () => {
		const { getByRole } = await render(DateTime, {
			...default_props,
			interactive: true
		});
		expect(getByRole("button")).toBeTruthy();
	});

	test("interactive=false hides the calendar button", async () => {
		const { queryByRole } = await render(DateTime, {
			...default_props,
			interactive: false
		});
		expect(queryByRole("button")).toBeNull();
	});

	test.todo(
		"VISUAL: interactive=false applies subdued/disabled styling to the component — needs Playwright visual regression"
	);
});

describe("Props: info", () => {
	afterEach(() => cleanup());

	test("info text is rendered when provided", async () => {
		const { getByText } = await render(DateTime, {
			...default_props,
			info: "Enter a date and time"
		});
		await waitFor(() => {
			expect(getByText("Enter a date and time")).toBeTruthy();
		});
	});

	test("info text is not rendered when not provided", async () => {
		const { queryByText } = await render(DateTime, {
			...default_props,
			info: undefined
		});
		expect(queryByText("Enter a date and time")).toBeNull();
	});
});

describe("Edge cases", () => {
	afterEach(() => cleanup());

	test("no spurious change event on mount", async () => {
		const { listen } = await render(DateTime, {
			...default_props,
			value: "2020-10-15 12:30:00"
		});
		const change = listen("change", { retrospective: true });
		await tick();
		await tick();
		expect(change).not.toHaveBeenCalled();
	});

	test("setting the same value twice fires change only once", async () => {
		const { listen, set_data } = await render(DateTime, {
			...default_props,
			value: ""
		});
		const change = listen("change");
		await set_data({ value: "2021-05-20 09:00:00" });
		await set_data({ value: "2021-05-20 09:00:00" });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test.todo(
		"VISUAL: invalid format input turns the text subdued — needs Playwright visual regression screenshot comparison"
	);
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("change: emitted when value is updated via set_data", async () => {
		const { listen, set_data } = await render(DateTime, default_props);
		const change = listen("change");
		await set_data({ value: "2021-05-20 09:00:00" });
		expect(change).toHaveBeenCalledTimes(1);
	});

	test("change: dispatched without a payload (value is accessed via get_data)", async () => {
		// DateTime's change event has no payload — the new value is read via get_data.
		const { listen, set_data, get_data } = await render(DateTime, default_props);
		const change = listen("change");
		await set_data({ value: "2021-05-20 09:00:00" });
		expect(change).toHaveBeenCalledTimes(1);
		const data = await get_data();
		expect(data.value).toBe("2021-05-20 09:00:00");
	});

	test("submit: emitted when Enter is pressed in the input with a new valid value", async () => {
		const { getByRole, listen } = await render(DateTime, {
			...default_props,
			value: ""
		});
		const submit = listen("submit");
		const input = getByRole("textbox");

		input.focus();
		// Type a valid date then press Enter
		await event.type(input, "2021-05-20 09:00:00");
		await event.keyboard("{Enter}");

		expect(submit).toHaveBeenCalledTimes(1);
	});

	test("change: emitted on blur when a new valid value has been typed", async () => {
		const { getByRole, listen } = await render(DateTime, {
			...default_props,
			value: ""
		});
		const change = listen("change");
		const input = getByRole("textbox");

		input.focus();
		await event.type(input, "2021-05-20 09:00:00");
		input.blur();
		await fireEvent.blur(input);

		await waitFor(() => {
			expect(change).toHaveBeenCalled();
		});
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("get_data returns the initial value", async () => {
		const { get_data } = await render(DateTime, {
			...default_props,
			value: "2020-10-15 12:30:00"
		});
		const data = await get_data();
		expect(data.value).toBe("2020-10-15 12:30:00");
	});

	test("set_data updates the displayed value in the input", async () => {
		const { set_data, getByRole } = await render(DateTime, {
			...default_props,
			value: ""
		});
		await set_data({ value: "2021-05-20 09:00:00" });
		const input = getByRole("textbox") as HTMLInputElement;
		expect(input.value).toBe("2021-05-20 09:00:00");
	});

	test("set_data → get_data round-trip returns the set value", async () => {
		const { set_data, get_data } = await render(DateTime, {
			...default_props,
			value: ""
		});
		await set_data({ value: "2021-05-20 09:00:00" });
		const data = await get_data();
		expect(data.value).toBe("2021-05-20 09:00:00");
	});
});
