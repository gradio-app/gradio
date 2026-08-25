import { describe, it, expect, vi, afterEach } from "vitest";
import { is_valid_bucket_id, list_bucket_records } from "../utils/bucket_sync";

describe("is_valid_bucket_id", () => {
	it("accepts user/name form", () => {
		expect(is_valid_bucket_id("alice/my-history")).toBe(true);
	});

	it("rejects missing slash", () => {
		expect(is_valid_bucket_id("alice")).toBe(false);
	});

	it("rejects path traversal", () => {
		expect(is_valid_bucket_id("alice/..")).toBe(false);
		expect(is_valid_bucket_id("../etc")).toBe(false);
		expect(is_valid_bucket_id("alice/./x")).toBe(false);
	});

	it("rejects empty segments", () => {
		expect(is_valid_bucket_id("alice/")).toBe(false);
		expect(is_valid_bucket_id("/name")).toBe(false);
	});
});

describe("list_bucket_records", () => {
	const orig = globalThis.fetch;
	afterEach(() => {
		globalThis.fetch = orig;
	});

	it("reports a failed request instead of an empty history", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 409,
			json: async () => ({ detail: "no bucket connected" })
		}) as any;
		const res = await list_bucket_records("http://x");
		expect(res.ok).toBe(false);
		expect(res.status).toBe(409);
		expect(res.records).toEqual([]);
	});

	it("returns records on success", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ records: [{ record_id: "r1" }] })
		}) as any;
		const res = await list_bucket_records("http://x");
		expect(res.ok).toBe(true);
		expect(res.records).toHaveLength(1);
	});

	it("does not emit a root-absolute URL when root is empty", async () => {
		const spy = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ records: [] })
		});
		globalThis.fetch = spy as any;
		await list_bucket_records("");
		const called = String(spy.mock.calls[0][0]);
		// must resolve against the document base, not "/gradio_api/..."
		expect(called.startsWith("/gradio_api/")).toBe(false);
		expect(called).toContain("gradio_api/run-history/records");
	});
});
