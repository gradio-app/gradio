import { describe, it, expect } from "vitest";
import { merge_runs, is_valid_bucket_id } from "../utils/bucket_sync";
import type { StoredRun } from "../utils/run_history";

function make_run(
	id: string,
	started_at: string,
	completed_at?: string
): StoredRun {
	return {
		id,
		endpoint: "/predict",
		api_name: "predict",
		fn_index: 0,
		page: "",
		inputs: null,
		outputs: null,
		status: "complete",
		started_at,
		completed_at
	};
}

describe("merge_runs", () => {
	it("dedupes by id, keeping the fresher run", () => {
		const local = [
			make_run("a", "2026-01-01T00:00:00Z", "2026-01-01T00:00:05Z")
		];
		const remote = [
			make_run("a", "2026-01-01T00:00:00Z", "2026-01-01T00:00:10Z")
		];
		const merged = merge_runs(local, remote);
		expect(merged).toHaveLength(1);
		expect(merged[0].completed_at).toBe("2026-01-01T00:00:10Z");
	});

	it("sorts newest-first by started_at", () => {
		const merged = merge_runs(
			[make_run("a", "2026-01-01T00:00:00Z")],
			[
				make_run("b", "2026-01-02T00:00:00Z"),
				make_run("c", "2026-01-03T00:00:00Z")
			]
		);
		expect(merged.map((r) => r.id)).toEqual(["c", "b", "a"]);
	});

	it("returns empty when both inputs are empty", () => {
		expect(merge_runs([], [])).toEqual([]);
	});
});

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
