import { describe, it, expect, vi, afterEach } from "vitest";
import {
	asset_url,
	connect_bucket,
	is_valid_bucket_id,
	list_bucket_records,
	list_user_buckets
} from "../utils/bucket_sync";

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
			status: 401,
			json: async () => ({ detail: "oauth session required" })
		}) as any;
		const res = await list_bucket_records("http://x", "alice/h");
		expect(res.ok).toBe(false);
		expect(res.status).toBe(401);
		expect(res.data).toEqual([]);
	});

	it("returns records on success", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ records: [{ record_id: "r1" }] })
		}) as any;
		const res = await list_bucket_records("http://x", "alice/h");
		expect(res.ok).toBe(true);
		expect(res.data).toHaveLength(1);
	});

	it("names the bucket on every request rather than relying on session state", async () => {
		const spy = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ records: [] })
		});
		globalThis.fetch = spy as any;
		await list_bucket_records("http://x", "alice/my-history");
		const called = String(spy.mock.calls[0][0]);
		expect(called).toContain("bucket=alice%2Fmy-history");
		expect(called).not.toContain("endpoint=");
		expect(called).not.toContain("limit=");
	});

	it("does not emit a root-absolute URL when root is empty", async () => {
		const spy = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ records: [] })
		});
		globalThis.fetch = spy as any;
		await list_bucket_records("", "alice/h");
		const called = String(spy.mock.calls[0][0]);
		// must resolve against the document base, not "/gradio_api/..."
		expect(called.startsWith("/gradio_api/")).toBe(false);
		expect(called).toContain("gradio_api/run-history/records");
	});
});

describe("bucket setup", () => {
	const orig = globalThis.fetch;
	afterEach(() => {
		globalThis.fetch = orig;
	});

	it("ignores the connect response body", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ ok: true })
		}) as any;
		const result = await connect_bucket("http://x", "alice/history");
		expect(result).toMatchObject({ ok: true, data: null });
	});

	it("returns bucket ids as strings", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => ({ buckets: ["alice/one", "alice/two"] })
		}) as any;
		expect(await list_user_buckets("http://x")).toMatchObject({
			ok: true,
			data: ["alice/one", "alice/two"]
		});
	});

	it("preserves authentication errors for the connect UI", async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: false,
			status: 401,
			json: async () => ({ detail: "oauth session required" })
		}) as any;
		expect(await list_user_buckets("http://x")).toMatchObject({
			ok: false,
			status: 401,
			data: [],
			detail: "oauth session required"
		});
	});
});

describe("asset_url", () => {
	it("addresses an asset by bucket, endpoint and record", () => {
		const url = asset_url("http://x", "alice/h", "predict", "r1", "a001.png");
		expect(url).toContain("/run-history/records/predict/r1/assets/a001.png");
		expect(url).toContain("bucket=alice%2Fh");
	});
});
