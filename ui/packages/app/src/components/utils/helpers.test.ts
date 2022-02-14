import { assert, describe, expect, it } from "vitest";
import { prettyBytes } from "./helpers";

describe("prettyBytes", () => {
	it("handle B", () => {
		assert.equal(prettyBytes(10), "10.0 B");
	});

	it("handles KB", () => {
		assert.equal(prettyBytes(1_300), "1.3 KB");
	});

	it("handles MB", () => {
		assert.equal(prettyBytes(1_300_000), "1.2 MB");
	});

	it("handles GB", () => {
		assert.equal(prettyBytes(1_300_000_123), "1.2 GB");
	});

	it("handles PB", () => {
		assert.equal(prettyBytes(1_300_000_123_000), "1.2 PB");
	});
});
