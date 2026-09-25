import { afterEach, describe, expect, test, vi } from "vitest";
import {
	create_drag,
	invalid_file_type_message,
	is_valid_mimetype,
	to_accept_attribute
} from "./utils";

describe("is_valid_mimetype", () => {
	test("matches compound extensions", () => {
		expect(is_valid_mimetype(".nii.gz", "brain.nii.gz", "")).toBe(true);
		expect(is_valid_mimetype(".tar.gz", "src.tar.gz", "")).toBe(true);
		expect(is_valid_mimetype(".nii.gz", "brain.nii", "")).toBe(false);
		expect(is_valid_mimetype(".nii", "brain.nii.gz", "")).toBe(false);
	});

	test("a compound extension does not stop the plain one from matching", () => {
		expect(is_valid_mimetype(".gz", "brain.nii.gz", "")).toBe(true);
	});

	test("still matches plain extensions, and is case insensitive", () => {
		expect(is_valid_mimetype(".png", "photo.png", "")).toBe(true);
		expect(is_valid_mimetype(".png", "photo.PNG", "")).toBe(true);
		expect(is_valid_mimetype(".png", "photo.jpg", "")).toBe(false);
	});

	test("the extension has to be a real suffix, not just a substring", () => {
		expect(is_valid_mimetype(".js", "my.js.txt", "")).toBe(false);
	});

	test("a file whose whole name is the extension does not match", () => {
		expect(is_valid_mimetype(".png", ".png", "")).toBe(false);
		expect(is_valid_mimetype(".nii.gz", ".nii.gz", "")).toBe(false);
		expect(is_valid_mimetype(".nii.gz", "nii.gz", "")).toBe(false);
	});

	test("still matches mime categories and wildcards", () => {
		expect(is_valid_mimetype("image/*", "photo.png", "image/png")).toBe(true);
		expect(is_valid_mimetype("image/*", "clip.mp4", "video/mp4")).toBe(false);
		expect(is_valid_mimetype("*", "anything.xyz", "")).toBe(true);
		expect(is_valid_mimetype(null, "anything.xyz", "")).toBe(true);
	});

	test("accepts a comma-separated string or an array", () => {
		expect(is_valid_mimetype(".png, .nii.gz", "brain.nii.gz", "")).toBe(true);
		expect(is_valid_mimetype([".png", ".nii.gz"], "brain.nii.gz", "")).toBe(
			true
		);
	});
});

describe("to_accept_attribute", () => {
	test("widens a compound extension so the native picker can resolve it", () => {
		expect(to_accept_attribute([".nii.gz"])).toBe(".nii.gz, .gz");
		expect(to_accept_attribute([".tar.gz", ".png"])).toBe(".tar.gz, .gz, .png");
	});

	test("leaves plain extensions and mime types untouched", () => {
		expect(to_accept_attribute([".png"])).toBe(".png");
		expect(to_accept_attribute(["image/*"])).toBe("image/*");
		expect(to_accept_attribute("*")).toBe("*");
	});

	test("does not duplicate an extension that is already listed", () => {
		expect(to_accept_attribute([".tar.gz", ".gz"])).toBe(".tar.gz, .gz");
	});

	test("accepts a comma-separated string", () => {
		expect(to_accept_attribute(".tar.gz, .png")).toBe(".tar.gz, .gz, .png");
	});

	test("preserves the no-filter cases", () => {
		expect(to_accept_attribute(null)).toBe(undefined);
		expect(to_accept_attribute("")).toBe("");
		expect(to_accept_attribute([])).toBe("");
	});
});

describe("create_drag", () => {
	afterEach(() => {
		document.body.innerHTML = "";
		vi.restoreAllMocks();
	});

	test("does not open the file input when an ignored child is clicked", () => {
		const click = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		const node = document.createElement("div");
		const toolbar = document.createElement("div");
		const button = document.createElement("button");

		toolbar.className = "toolbar-wrap";
		toolbar.appendChild(button);
		node.appendChild(toolbar);
		document.body.appendChild(node);

		const { drag } = create_drag();
		const action = drag(node, { ignore_click_selector: ".toolbar-wrap" });

		button.click();

		expect(click).not.toHaveBeenCalled();
		action.destroy();
	});

	test("opens the file input when the dropzone is clicked", () => {
		const click = vi
			.spyOn(HTMLInputElement.prototype, "click")
			.mockImplementation(() => {});
		const node = document.createElement("div");

		document.body.appendChild(node);

		const { drag } = create_drag();
		const action = drag(node, { ignore_click_selector: ".toolbar-wrap" });

		node.click();

		expect(click).toHaveBeenCalledOnce();
		action.destroy();
	});
});

describe("invalid_file_type_message", () => {
	const make_files = (names: string[]): File[] =>
		names.map((name) => new File([""], name));

	test("truncates long lists of rejected files", () => {
		const files = make_files(
			Array.from({ length: 100 }, (_, i) => `file_${i}.png`)
		);
		expect(invalid_file_type_message(files, ".txt")).toBe(
			"Invalid file types: file_0.png, file_1.png, file_2.png, file_3.png, file_4.png and 95 more. Only .txt allowed."
		);
	});

	test("uses the relative path of files from a directory upload", () => {
		const file = new File([""], "a.png");
		Object.defineProperty(file, "webkitRelativePath", {
			value: "folder/sub/a.png"
		});
		expect(invalid_file_type_message([file], ".txt")).toBe(
			"Invalid file type: folder/sub/a.png. Only .txt allowed."
		);
	});
});
