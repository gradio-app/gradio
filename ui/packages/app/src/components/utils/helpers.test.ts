import { assert, describe, expect, test } from "vitest";
import { prettyBytes, deepCopy, randInt } from "./helpers";

describe("prettyBytes", () => {
	test("handle B", () => {
		assert.equal(prettyBytes(10), "10.0 B");
	});

	test("handles KB", () => {
		assert.equal(prettyBytes(1_300), "1.3 KB");
	});

	test("handles MB", () => {
		assert.equal(prettyBytes(1_300_000), "1.2 MB");
	});

	test("handles GB", () => {
		assert.equal(prettyBytes(1_300_000_123), "1.2 GB");
	});

	test("handles PB", () => {
		assert.equal(prettyBytes(1_300_000_123_000), "1.2 PB");
	});
});

describe("deepCopy", () => {
	test("handle arrays", () => {
		const array = [1, 2, 3];
		const copy = deepCopy(array);
		assert.ok(array !== copy);
		assert.deepEqual(array, copy);
	});

	test("handle objects", () => {
		const obj = { a: 1, b: 2, c: 3 };
		const copy = deepCopy(obj);
		assert.ok(obj !== copy);
		assert.deepEqual(obj, copy);
	});

	test("handle complex structures", () => {
		const obj = {
			a: 1,
			b: {
				a: 1,
				b: {
					a: 1,
					b: { a: 1, b: 2, c: 3 },
					c: [
						1,
						2,
						{ a: 1, b: { a: 1, b: { a: 1, b: 2, c: 3 }, c: [1, 2, 3] } }
					]
				},
				c: 3
			},
			c: 3
		};
		const copy = deepCopy(obj);
		assert.ok(obj !== copy);
		assert.deepEqual(obj, copy);
	});
});

describe("randInt", () => {
	test("returns a random number", () => {
		assert.typeOf(randInt(0, 10), "number");
	});

	test("respects min and max", () => {
		const n = randInt(0, 10);

		assert.ok(n > 0 && n < 10);
	});

	test("respects min and max when negative", () => {
		const n = randInt(-100, -10);
		assert.ok(n > -100 && n < -10);
	});
});
