import { test, describe, expect, vi, afterEach, assert } from "vitest";
import { cleanup, render } from "@self/tootils/render";
import event from "@testing-library/user-event";
import { setupi18n } from "../core/src/i18n";
import UploadButton from "./Index.svelte";

describe("UploadButton", () => {
	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	test.skip("Uploads with blob", async () => {
		vi.mock("@gradio/client", async () => {
			const actual = await vi.importActual("@gradio/client");
			console.log(actual);

			return {
				...actual,
				prepare_files: () => [],
				// upload: vi.fn((f) => new Promise((res) => res([]))),
				upload_files: vi.fn((f) => new Promise((res) => res({})))
			};
		});

		const api = await import("@gradio/client");

		setupi18n();

		const { getByTestId } = await render(UploadButton, {
			label: "file",
			value: null,
			root: "http://localhost:7860",
			file_count: "1"
		});

		const item = getByTestId("file-upload-button"); // container.querySelectorAll("input")[0];

		const file = new File(["hello"], "my-audio.wav", { type: "audio/wav" });
		await event.upload(item, file);

		expect(api.upload_files).toHaveBeenCalled();
	});

	// we need mocks for this test now, no time atm.
	test.skip("upload sets change event", async () => {
		vi.mock("@gradio/client", async () => {
			const actual = await vi.importActual("@gradio/client");

			return {
				...actual,
				prepare_files: () => [],
				// upload: vi.fn((f) => new Promise((res) => res([]))),
				upload_files: vi.fn((f) => new Promise((res) => res({})))
			};
		});

		await import("@gradio/client");
		setupi18n();
		const { component, getByTestId, wait_for_event } = await render(
			UploadButton,
			{
				label: "file",
				value: null,
				root: "http://localhost:7860",
				file_count: "1"
			}
		);

		const item = getByTestId("file-upload-button"); //container.querySelectorAll("input")[0];
		const file = new File(["hello"], "my-audio.wav", { type: "audio/wav" });
		event.upload(item, file);
		const mock = await wait_for_event("change");
		expect(mock.callCount).toBe(1);
		const [data] = component.$capture_state().value;
		expect(data).toBeTruthy();
		assert.equal(data.name, "my-audio.wav");
	});
});
