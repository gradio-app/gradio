import { describe, it, expect } from "vitest";
import { is_valid_bucket_id } from "../utils/bucket_sync";

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
