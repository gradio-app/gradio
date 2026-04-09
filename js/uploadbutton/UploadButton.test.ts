import { afterEach, describe, expect, test, vi } from "vitest";
import { cleanup, render } from "@self/tootils/render";

import UploadButton from "./Index.svelte";

describe("UploadButton", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	test("renders the label and maps accepted file types for the hidden input", async () => {
		const { getByText, getByTestId } = await render(UploadButton, {
			label: "Upload files",
			interactive: true,
			visible: true,
			value: null,
			file_count: "multiple",
			file_types: ["image", ".json"],
			size: "lg",
			icon: null,
			variant: "secondary",
			root: "/tmp",
		});

		expect(getByText("Upload files")).toBeTruthy();
		const input = getByTestId("Upload files-upload-button") as HTMLInputElement;
		expect(input.accept).toBe("image/*, .json");
		expect(input.multiple).toBe(true);
	});

	test("clicking the button triggers the hidden file input and dispatches click", async () => {
		const { container, listen } = await render(UploadButton, {
			label: "Upload file",
			interactive: true,
			visible: true,
			value: null,
			file_count: "single",
			file_types: [],
			size: "lg",
			icon: null,
			variant: "secondary",
			root: "/tmp",
		});
		const click = listen("click");
		const input = container.querySelector(
			'input[type="file"]',
		) as HTMLInputElement;
		const inputClick = vi.spyOn(input, "click").mockImplementation(() => {});
		const button = container.querySelector("button") as HTMLButtonElement;

		button.click();

		expect(click).toHaveBeenCalledTimes(1);
		expect(inputClick).toHaveBeenCalledTimes(1);
	});

	test("disables the button when interactive is false", async () => {
		const { container } = await render(UploadButton, {
			label: "Upload file",
			interactive: false,
			visible: true,
			value: null,
			file_count: "single",
			file_types: [],
			size: "lg",
			icon: null,
			variant: "secondary",
			root: "/tmp",
		});

		const button = container.querySelector("button") as HTMLButtonElement;
		expect(button.disabled).toBe(true);
	});
});
