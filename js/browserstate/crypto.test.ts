import { describe, test, expect } from "vitest";
import { encrypt, decrypt } from "./crypto";

describe("encrypt", () => {
	test("returns a string in ivString:cipherString format", () => {
		const result = encrypt("hello", "my-secret");
		const parts = result.split(":");
		expect(parts.length).toBe(2);
		expect(parts[0].length).toBeGreaterThan(0);
		expect(parts[1].length).toBeGreaterThan(0);
	});

	test("output differs from the original input", () => {
		const input = "hello world";
		expect(encrypt(input, "secret")).not.toBe(input);
	});

	test("two encryptions of the same data produce different ciphertext (random IV)", () => {
		const data = "same input data";
		const key = "same-key";
		expect(encrypt(data, key)).not.toBe(encrypt(data, key));
	});

	test("different keys produce different ciphertext for the same data", () => {
		const data = "same data";
		expect(encrypt(data, "key-A")).not.toBe(encrypt(data, "key-B"));
	});
});

describe("decrypt", () => {
	test("round-trips a plain string value", () => {
		const original = "hello world";
		const key = "my-secret-key";
		expect(decrypt(encrypt(original, key), key)).toBe(original);
	});

	test("round-trips a JSON-stringified object", () => {
		const obj = { user: "alice", count: 42 };
		const key = "secret";
		const roundtripped = JSON.parse(
			decrypt(encrypt(JSON.stringify(obj), key), key)
		);
		expect(roundtripped).toEqual(obj);
	});

	test("round-trips a JSON-stringified array", () => {
		const arr = [1, "two", true, null];
		const key = "secret";
		const roundtripped = JSON.parse(
			decrypt(encrypt(JSON.stringify(arr), key), key)
		);
		expect(roundtripped).toEqual(arr);
	});

	test("round-trips special characters and unicode", () => {
		const unicode = "héllo wörld 🎉 日本語";
		const key = "secret";
		expect(decrypt(encrypt(unicode, key), key)).toBe(unicode);
	});

	test("round-trips a large payload without truncation", () => {
		const large = JSON.stringify({ data: "x".repeat(10_000) });
		const key = "key";
		expect(decrypt(encrypt(large, key), key)).toBe(large);
	});

	test("wrong key does not produce the original plaintext", () => {
		const original = "sensitive data";
		const encrypted = encrypt(original, "correct-key");
		const result = decrypt(encrypted, "wrong-key");
		expect(result).not.toBe(original);
	});

	test("completely malformed input (no IV separator) does not return the input as-is", () => {
		// CryptoJS may throw or return "" — either is acceptable; it must not echo the input
		try {
			const result = decrypt("not-valid-encrypted-data", "key");
			expect(result).not.toBe("not-valid-encrypted-data");
		} catch {
			// Throwing is also acceptable
		}
	});
});
