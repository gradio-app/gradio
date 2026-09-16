import { test, describe, afterEach, expect } from "vitest";
import {
	cleanup,
	render,
	fireEvent,
	waitFor,
	mock_client,
	upload_file,
	drop_file,
	TEST_JPG,
	TEST_TXT
} from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";
import event from "@testing-library/user-event";
import { tick } from "svelte";

import MultimodalTextbox from "./Index.svelte";

const jpg_file = {
	path: "cats.jpg",
	orig_name: "cats.jpg",
	mime_type: "image/jpeg",
	meta: { _type: "gradio.FileData" }
};

const default_props = {
	label: "MultimodalTextbox",
	show_label: true,
	lines: 1,
	max_lines: 1,
	value: { text: "", files: [] },
	interactive: true,
	root: "http://localhost:7860",
	sources: ["upload"],
	submit_btn: true,
	client: mock_client()
};

function paste_event(
	text: string | null,
	image_name?: string,
	with_html = true
): ClipboardEvent {
	const data = new DataTransfer();
	if (text) {
		data.setData("text/plain", text);
		if (with_html) {
			data.setData("text/html", `<table><tr><td>${text}</td></tr></table>`);
		}
	}
	if (image_name) {
		data.items.add(
			new File([new Uint8Array([1, 2, 3])], image_name, { type: "image/png" })
		);
	}
	return new ClipboardEvent("paste", {
		clipboardData: data,
		bubbles: true,
		cancelable: true
	});
}

const uploaded_names = (upload: { mock: { calls: any[][] } }): string[] =>
	upload.mock.calls.flat(2).map((file) => file.orig_name);

run_shared_prop_tests({
	component: MultimodalTextbox,
	name: "MultimodalTextbox",
	base_props: default_props
});

describe("MultimodalTextbox", () => {
	afterEach(() => cleanup());

	test("renders the provided text and file thumbnails", async () => {
		const { getByRole, getAllByLabelText } = await render(MultimodalTextbox, {
			...default_props,
			value: { text: "hello world", files: [jpg_file, jpg_file] }
		});

		expect(getByRole("textbox")).toHaveValue("hello world");
		expect(getAllByLabelText("File thumbnail")).toHaveLength(2);
	});

	test("placeholder is shown in the textbox", async () => {
		const { getByPlaceholderText } = await render(MultimodalTextbox, {
			...default_props,
			placeholder: "Type a message"
		});

		expect(getByPlaceholderText("Type a message")).toBeVisible();
	});

	test("interactive: false disables the textbox and its buttons", async () => {
		const { getByRole } = await render(MultimodalTextbox, {
			...default_props,
			sources: ["upload", "microphone"],
			interactive: false
		});

		expect(getByRole("textbox")).toBeDisabled();
		expect(getByRole("button", { name: "Upload a file" })).toBeDisabled();
		expect(getByRole("button", { name: "Record audio" })).toBeDisabled();
		expect(getByRole("button", { name: "Submit" })).toBeDisabled();
	});

	test("typing updates get_data", async () => {
		const { getByRole, get_data } = await render(MultimodalTextbox, {
			...default_props,
			value: { text: "hi ", files: [] }
		});

		getByRole("textbox").focus();
		await event.keyboard("there");

		expect((await get_data()).value).toEqual({ text: "hi there", files: [] });
	});
});

describe("Props: sources", () => {
	afterEach(() => cleanup());

	test.each([
		[["upload"], true, false],
		[["microphone"], false, true],
		[["upload", "microphone"], true, true]
	])(
		"sources=%j shows upload=%s, microphone=%s",
		async (sources, has_upload, has_mic) => {
			const { queryByRole } = await render(MultimodalTextbox, {
				...default_props,
				sources
			});

			expect(queryByRole("button", { name: "Upload a file" }) !== null).toBe(
				has_upload
			);
			expect(queryByRole("button", { name: "Record audio" }) !== null).toBe(
				has_mic
			);
		}
	);

	test("file_count='single' hides the upload button once a file is attached", async () => {
		const { queryByRole } = await render(MultimodalTextbox, {
			...default_props,
			file_count: "single",
			value: { text: "", files: [jpg_file] }
		});

		expect(
			queryByRole("button", { name: "Upload a file" })
		).not.toBeInTheDocument();
	});
});

describe("Props: submit_btn / stop_btn", () => {
	afterEach(() => cleanup());

	test("string values render as button text", async () => {
		const { getByRole } = await render(MultimodalTextbox, {
			...default_props,
			submit_btn: "Send",
			stop_btn: "Halt"
		});

		expect(getByRole("button", { name: "Submit" })).toHaveTextContent("Send");
		expect(getByRole("button", { name: "Stop" })).toHaveTextContent("Halt");
	});

	test("falsy values render no buttons", async () => {
		const { queryByRole } = await render(MultimodalTextbox, {
			...default_props,
			submit_btn: false,
			stop_btn: null
		});

		expect(queryByRole("button", { name: "Submit" })).not.toBeInTheDocument();
		expect(queryByRole("button", { name: "Stop" })).not.toBeInTheDocument();
	});
});

describe("Events", () => {
	afterEach(() => cleanup());

	test("typing emits change, but mounting does not", async () => {
		const { getByRole, listen } = await render(MultimodalTextbox, {
			...default_props,
			value: { text: "hi", files: [] }
		});
		const change = listen("change", { retrospective: true });

		expect(change).not.toHaveBeenCalled();

		getByRole("textbox").focus();
		await event.keyboard("!");

		expect(change).toHaveBeenLastCalledWith({ text: "hi!", files: [] });
	});

	test("Enter submits a single-line textbox, Shift+Enter does not", async () => {
		const { getByRole, listen } = await render(
			MultimodalTextbox,
			default_props
		);
		const submit = listen("submit");

		getByRole("textbox").focus();
		await event.keyboard("{Shift>}{Enter}{/Shift}");
		expect(submit).not.toHaveBeenCalled();

		await event.keyboard("{Enter}");
		await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
	});

	test("Shift+Enter submits a multi-line textbox", async () => {
		const { getByRole, listen } = await render(MultimodalTextbox, {
			...default_props,
			lines: 3,
			max_lines: 5
		});
		const submit = listen("submit");

		getByRole("textbox").focus();
		await event.keyboard("{Shift>}{Enter}{/Shift}");

		await waitFor(() => expect(submit).toHaveBeenCalledTimes(1));
	});

	test("submit and stop buttons emit submit and stop", async () => {
		const { getByRole, listen } = await render(MultimodalTextbox, {
			...default_props,
			stop_btn: true
		});
		const submit = listen("submit");
		const stop = listen("stop");

		await fireEvent.click(getByRole("button", { name: "Submit" }));
		await fireEvent.click(getByRole("button", { name: "Stop" }));

		expect(submit).toHaveBeenCalledTimes(1);
		expect(stop).toHaveBeenCalledTimes(1);
	});

	test("focus and blur are emitted", async () => {
		const { getByRole, listen } = await render(
			MultimodalTextbox,
			default_props
		);
		const focus = listen("focus");
		const blur = listen("blur");

		await fireEvent.focus(getByRole("textbox"));
		await fireEvent.blur(getByRole("textbox"));

		expect(focus).toHaveBeenCalledTimes(1);
		expect(blur).toHaveBeenCalledTimes(1);
	});

	test("select emits the selected text and its range", async () => {
		const { getByRole, listen } = await render(MultimodalTextbox, {
			...default_props,
			value: { text: "hello world", files: [] }
		});
		const select = listen("select");
		const textbox = getByRole("textbox") as HTMLTextAreaElement;

		textbox.setSelectionRange(6, 11);
		await fireEvent.select(textbox);

		expect(select).toHaveBeenCalledWith({ value: "world", index: [6, 11] });
	});
});

describe("Files", () => {
	afterEach(() => cleanup());

	test("uploading a file emits upload and adds it to the value", async () => {
		const { listen, get_data, getAllByLabelText } = await render(
			MultimodalTextbox,
			default_props
		);
		const upload = listen("upload");

		await upload_file(TEST_JPG);

		await waitFor(() => expect(upload).toHaveBeenCalledTimes(1));
		expect(getAllByLabelText("File thumbnail")).toHaveLength(1);
		const { value } = await get_data();
		expect(value.files.map((f: any) => f.orig_name)).toEqual([
			TEST_JPG.orig_name
		]);
	});

	test("removing a thumbnail removes the file from the value", async () => {
		const { getAllByRole, get_data, queryByLabelText } = await render(
			MultimodalTextbox,
			{ ...default_props, value: { text: "", files: [jpg_file, jpg_file] } }
		);

		await fireEvent.click(getAllByRole("button", { name: "Remove file" })[0]);

		expect((await get_data()).value.files).toHaveLength(1);
		await fireEvent.click(getAllByRole("button", { name: "Remove file" })[0]);
		expect(queryByLabelText("File thumbnail")).not.toBeInTheDocument();
	});

	test("dropping a file outside file_types emits an error and uploads nothing", async () => {
		const { listen } = await render(MultimodalTextbox, {
			...default_props,
			file_types: [".jpg"]
		});
		const error = listen("error");
		const upload = listen("upload");

		await drop_file(TEST_TXT, "[aria-label='Multimedia input field']");

		await waitFor(() =>
			expect(error).toHaveBeenCalledWith(
				"1 file(s) were rejected. Accepted formats: .jpg"
			)
		);
		expect(upload).not.toHaveBeenCalled();
	});
});

describe("Paste", () => {
	afterEach(() => cleanup());

	test("text longer than max_plain_text_length is uploaded as a file", async () => {
		const { getByRole, listen } = await render(MultimodalTextbox, {
			...default_props,
			max_plain_text_length: 10
		});
		const upload = listen("upload");
		const paste = paste_event("x".repeat(20), undefined, false);

		getByRole("textbox").dispatchEvent(paste);

		await waitFor(() =>
			expect(uploaded_names(upload)).toEqual(["pasted_text.txt"])
		);
		expect(paste.defaultPrevented).toBe(true);
	});

	test("a paste is handled as text or as an image, never both", async () => {
		const { getByRole, listen } = await render(
			MultimodalTextbox,
			default_props
		);
		const upload = listen("upload");
		const textbox = getByRole("textbox");

		const excel_paste = paste_event("1\t2\n3\t4", "cells.png");
		textbox.dispatchEvent(excel_paste);
		// an image alone is still attached; waiting for that upload also bounds
		// the assertion that the paste above uploaded nothing
		const image_paste = paste_event(null, "screenshot.png");
		textbox.dispatchEvent(image_paste);

		await waitFor(() =>
			expect(uploaded_names(upload)).toContain("screenshot.png")
		);
		await tick();

		expect(uploaded_names(upload)).toEqual(["screenshot.png"]);
		expect(excel_paste.defaultPrevented).toBe(false);
		expect(image_paste.defaultPrevented).toBe(true);
	});

	test("text with no HTML flavor leaves the image alone", async () => {
		const { getByRole, listen } = await render(
			MultimodalTextbox,
			default_props
		);
		const upload = listen("upload");

		// a file manager copying an image can put its path in text/plain with
		// no text/html, and there the image is the point of the paste
		getByRole("textbox").dispatchEvent(
			paste_event("file:///cats.jpg", "cats.jpg", false)
		);

		await waitFor(() => expect(uploaded_names(upload)).toEqual(["cats.jpg"]));
	});

	test("with nowhere to upload, only a text paste falls back to the browser", async () => {
		const { getByRole, listen } = await render(MultimodalTextbox, {
			...default_props,
			// file_count "single" with a file already attached unmounts Upload
			file_count: "single",
			value: { text: "", files: [jpg_file] },
			max_plain_text_length: 1000
		});
		const upload = listen("upload");
		const textbox = getByRole("textbox");

		const image_paste = paste_event(null, "screenshot.png");
		textbox.dispatchEvent(image_paste);
		const long_paste = paste_event("x".repeat(2000));
		textbox.dispatchEvent(long_paste);
		const path_paste = paste_event("file:///cats.jpg", "cats.jpg", false);
		textbox.dispatchEvent(path_paste);

		await tick();
		await tick();

		expect(upload).not.toHaveBeenCalled();
		// the browser would paste the image's file name, which is worth nothing
		expect(image_paste.defaultPrevented).toBe(true);
		// text is its own fallback, so it must not be swallowed either way
		expect(long_paste.defaultPrevented).toBe(false);
		expect(path_paste.defaultPrevented).toBe(false);
	});
});

describe("get_data / set_data", () => {
	afterEach(() => cleanup());

	test("set_data updates the DOM, emits change, and round-trips", async () => {
		const { getByRole, getAllByLabelText, set_data, get_data, listen } =
			await render(MultimodalTextbox, default_props);
		const change = listen("change");
		const value = { text: "from backend", files: [jpg_file] };

		await set_data({ value });

		expect(getByRole("textbox")).toHaveValue("from backend");
		expect(getAllByLabelText("File thumbnail")).toHaveLength(1);
		expect(change).toHaveBeenCalledTimes(1);
		expect((await get_data()).value).toEqual(value);
	});

	test("a null value falls back to empty text and no files", async () => {
		const { getByRole, get_data } = await render(MultimodalTextbox, {
			...default_props,
			value: null
		});

		expect(getByRole("textbox")).toHaveValue("");
		expect((await get_data()).value).toEqual({ text: "", files: [] });
	});
});
