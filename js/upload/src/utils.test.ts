import { afterEach, describe, expect, test, vi } from "vitest";
import { create_drag, is_valid_mimetype } from "./utils";

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
