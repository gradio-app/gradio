import { test, describe, afterEach, beforeEach, expect, vi } from "vitest";
import { cleanup, render, fireEvent } from "@self/tootils/render";
import { run_shared_prop_tests } from "@self/tootils/shared-prop-tests";

import DownloadButton from "./Index.svelte";

const default_props = {
	value: null,
	variant: "secondary" as const,
	size: "lg" as const,
	icon: null,
	label: "Download",
	interactive: true
};

run_shared_prop_tests({
	component: DownloadButton,
	name: "DownloadButton",
	base_props: { ...default_props },
	has_label: false,
	has_validation_error: false,
	visible_false_hides: true,
	has_block_wrapper: false
});

function spy_anchor_click(): {
	captured: { href: string; download: string }[];
	restore: () => void;
} {
	const captured: { href: string; download: string }[] = [];
	const spy = vi
		.spyOn(HTMLAnchorElement.prototype, "click")
		.mockImplementation(function (this: HTMLAnchorElement) {
			captured.push({ href: this.href, download: this.download });
		});
	return { captured, restore: () => spy.mockRestore() };
}

describe("Props: label", () => {
	afterEach(() => cleanup());

	test("renders the label as the button's accessible name", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			label: "download CSV"
		});

		expect(getByRole("button", { name: "download CSV" })).toBeVisible();
	});

	test("null label renders an empty button", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			label: null
		});

		expect(getByRole("button")).toBeVisible();
	});
});

describe("Props: icon", () => {
	afterEach(() => cleanup());

	test("renders icon image when icon prop is set", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			icon: {
				url: "https://gradio.app/icon.svg",
				path: "icon.svg",
				orig_name: "icon.svg"
			}
		});

		const img = getByRole("img");
		expect(img).toHaveAttribute("src", "https://gradio.app/icon.svg");
	});

	test("does not render icon image when icon prop is null", async () => {
		const { queryByRole } = await render(DownloadButton, {
			...default_props,
			icon: null
		});

		expect(queryByRole("img")).not.toBeInTheDocument();
	});
});

describe("Props: value", () => {
	let anchor_spy: ReturnType<typeof spy_anchor_click>;

	beforeEach(() => {
		anchor_spy = spy_anchor_click();
	});

	afterEach(() => {
		anchor_spy.restore();
		cleanup();
	});

	test("clicking triggers a synthetic anchor click with the file URL", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/files/report.pdf",
				orig_name: "report.pdf",
				path: "report.pdf"
			} as any
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured).toHaveLength(1);
		expect(anchor_spy.captured[0].href).toBe(
			"https://gradio.app/files/report.pdf"
		);
	});

	test("uses orig_name as the download filename when provided", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/abc123",
				orig_name: "weekly-downloads.pdf",
				path: "abc123"
			} as any
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured[0].download).toBe("weekly-downloads.pdf");
	});

	test("derives filename from URL when orig_name is missing", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/files/data.csv",
				orig_name: "",
				path: "files/data.csv"
			} as any
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured[0].download).toBe("data.csv");
	});

	test("strips query string from URL-derived filename", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/files/data.csv?token=abc&v=2",
				orig_name: "",
				path: "files/data.csv"
			} as any
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured[0].download).toBe("data.csv");
	});

	test("strips hash fragment from URL-derived filename", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/files/notes.md#section-2",
				orig_name: "",
				path: "files/notes.md"
			} as any
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured[0].download).toBe("notes.md");
	});

	test("does not trigger download when value is null", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: null
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured).toHaveLength(0);
	});

	test("does not trigger download when value.url is missing", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: { url: "", orig_name: "file.txt", path: "file.txt" } as any
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured).toHaveLength(0);
	});
});

describe("Props: disabled", () => {
	afterEach(() => cleanup());

	test("interactive=false renders the button as disabled", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			interactive: false,
			value: {
				url: "https://gradio.app/files/report.pdf",
				orig_name: "report.pdf",
				path: "report.pdf"
			} as any
		});

		expect(getByRole("button", { name: "Download" })).toBeDisabled();
	});

	test("interactive=true renders the button as enabled", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			interactive: true
		});

		expect(getByRole("button", { name: "Download" })).toBeEnabled();
	});
});

describe("get_data / set_data", () => {
	let anchor_spy: ReturnType<typeof spy_anchor_click>;

	beforeEach(() => {
		anchor_spy = spy_anchor_click();
	});

	afterEach(() => {
		anchor_spy.restore();
		cleanup();
	});

	test("get_data returns the current value", async () => {
		const file_value = {
			url: "https://gradio.app/files/report.pdf",
			orig_name: "report.pdf",
			path: "report.pdf"
		};
		const { get_data } = await render(DownloadButton, {
			...default_props,
			value: file_value as any
		});

		expect((await get_data()).value).toEqual(file_value);
	});

	test("get_data returns null when no value is set", async () => {
		const { get_data } = await render(DownloadButton, {
			...default_props,
			value: null
		});

		expect((await get_data()).value).toBeNull();
	});

	test("set_data updates the value used for download", async () => {
		const { getByRole, set_data } = await render(DownloadButton, {
			...default_props,
			value: null
		});

		await set_data({
			value: {
				url: "https://gradio.app/files/updated.pdf",
				orig_name: "updated.pdf",
				path: "updated.pdf"
			}
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured).toHaveLength(1);
		expect(anchor_spy.captured[0].href).toBe(
			"https://gradio.app/files/updated.pdf"
		);
		expect(anchor_spy.captured[0].download).toBe("updated.pdf");
	});

	test("set_data then get_data round-trips the value", async () => {
		const { get_data, set_data } = await render(DownloadButton, {
			...default_props,
			value: null
		});

		const new_value = {
			url: "https://gradio.app/files/data.csv",
			orig_name: "data.csv",
			path: "data.csv"
		};
		await set_data({ value: new_value });

		expect((await get_data()).value).toEqual(new_value);
	});
});

describe("Events", () => {
	let anchor_spy: ReturnType<typeof spy_anchor_click>;

	beforeEach(() => {
		anchor_spy = spy_anchor_click();
	});

	afterEach(() => {
		anchor_spy.restore();
		cleanup();
	});

	test("does not dispatch spurious click event on mount", async () => {
		const { listen } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/file.zip",
				orig_name: "file.zip",
				path: "file.zip"
			} as any
		});

		const click = listen("click", { retrospective: true });
		expect(click).not.toHaveBeenCalled();
	});

	test("dispatches click event with a downloadable value", async () => {
		const { getByRole, listen } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/file.zip",
				orig_name: "file.zip",
				path: "file.zip"
			} as any
		});

		const click = listen("click");
		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(click).toHaveBeenCalledTimes(1);
	});

	test("dispatches click event even when value is null", async () => {
		const { getByRole, listen } = await render(DownloadButton, {
			...default_props,
			value: null
		});

		const click = listen("click");
		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(click).toHaveBeenCalledTimes(1);
	});
});

describe("Edge cases", () => {
	let anchor_spy: ReturnType<typeof spy_anchor_click>;

	beforeEach(() => {
		anchor_spy = spy_anchor_click();
	});

	afterEach(() => {
		anchor_spy.restore();
		cleanup();
	});

	test("falls back to 'file' when orig_name is empty and URL ends with a trailing slash", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/files/",
				orig_name: "",
				path: "files/"
			} as any
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured).toHaveLength(1);
		expect(anchor_spy.captured[0].download).toBe("file");
	});

	test("falls back to 'file' when URL has no path segments after domain", async () => {
		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/",
				orig_name: "",
				path: ""
			} as any
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(anchor_spy.captured).toHaveLength(1);
		expect(anchor_spy.captured[0].download).toBe("file");
	});

	test("does not leak anchor elements into document.body after download", async () => {
		const anchors_before = document.body.querySelectorAll("a").length;

		const { getByRole } = await render(DownloadButton, {
			...default_props,
			value: {
				url: "https://gradio.app/files/report.pdf",
				orig_name: "report.pdf",
				path: "report.pdf"
			} as any
		});

		await fireEvent.click(getByRole("button", { name: "Download" }));

		expect(document.body.querySelectorAll("a").length).toBe(anchors_before);
	});
});
