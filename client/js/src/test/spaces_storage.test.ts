import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { spaces_storage_headers } from "../helpers/spaces_storage";
import {
	read_run_history_storage,
	SPACES_STORAGE_BUCKET
} from "../utils/run_history";

const { post_message } = vi.hoisted(() => ({ post_message: vi.fn() }));
vi.mock("../helpers/data", () => ({ post_message }));
vi.mock("../helpers/zerogpu", () => ({
	get_zerogpu_origin: () => "https://huggingface.co"
}));

const spaces_scope = { root: "http://x/", history_storage: "spaces" as const };

describe("spaces_storage_headers", () => {
	beforeEach(() => {
		post_message.mockReset();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("keeps runs in the browser when the page gives no token", async () => {
		// Outside the Space page nothing answers, so the request times out.
		vi.useFakeTimers();
		post_message.mockReturnValue(new Promise(() => {}));
		const pending = spaces_storage_headers(true);
		await vi.advanceTimersByTimeAsync(3000);
		expect(await pending).toEqual({});
		expect(read_run_history_storage(spaces_scope).type).toBe("browser");
		// A logged-out viewer gets an empty answer.
		post_message.mockResolvedValue({});
		expect(await spaces_storage_headers(true)).toEqual({});
		expect(read_run_history_storage(spaces_scope).type).toBe("browser");
	});

	it("saves to Spaces storage once the page hands out a token", async () => {
		post_message.mockResolvedValue({ "X-HF-Viewer-Token": "a" });
		expect(await spaces_storage_headers(true)).toEqual({
			"X-HF-Viewer-Token": "a"
		});
		expect(read_run_history_storage(spaces_scope)).toEqual({
			type: "bucket",
			bucket_id: SPACES_STORAGE_BUCKET
		});
	});

	it("reuses an answer until asked to refresh", async () => {
		post_message
			.mockResolvedValueOnce({ "X-HF-Viewer-Token": "a" })
			.mockResolvedValueOnce({ "X-HF-Viewer-Token": "b" });
		await spaces_storage_headers(true);
		expect(await spaces_storage_headers()).toEqual({
			"X-HF-Viewer-Token": "a"
		});
		expect(await spaces_storage_headers(true)).toEqual({
			"X-HF-Viewer-Token": "b"
		});
		expect(post_message).toHaveBeenCalledTimes(2);
	});
});
