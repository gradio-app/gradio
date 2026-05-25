import { describe, test, expect } from "vitest";
import {
	make_cell_id,
	make_header_id,
	guess_delimiter,
	data_uri_to_blob
} from "../shared/utils/table_utils";
import { cast_value_to_type } from "../shared/utils/utils";

describe("table_utils", () => {
	describe("id generation", () => {
		test("generates unique cell ids", () => {
			const id_set = new Set();
			for (let row = 0; row < 10; row++) {
				for (let col = 0; col < 10; col++) {
					id_set.add(make_cell_id(row, col));
				}
			}
			expect(id_set.size).toBe(100);
		});

		test("generates unique header ids", () => {
			const id_set = new Set();
			for (let i = 0; i < 10; i++) {
				id_set.add(make_header_id(i));
			}
			expect(id_set.size).toBe(10);
		});
	});
});

describe("cast_value_to_type", () => {
	test("casts to number", () => {
		expect(cast_value_to_type("42", "number")).toBe(42);
		expect(cast_value_to_type(3.14, "number")).toBe(3.14);
		expect(cast_value_to_type("not a number", "number")).toBe("not a number");
	});
	test("casts to bool", () => {
		expect(cast_value_to_type("True", "bool")).toBe(true);
		expect(cast_value_to_type("False", "bool")).toBe(false);
		expect(cast_value_to_type(1, "bool")).toBe(true);
		expect(cast_value_to_type(0, "bool")).toBe(false);
		expect(cast_value_to_type("1", "bool")).toBe(true);
		expect(cast_value_to_type("0", "bool")).toBe(false);
		expect(cast_value_to_type("yes", "bool")).toBe("yes");
		expect(cast_value_to_type("no", "bool")).toBe("no");
		expect(cast_value_to_type("on", "bool")).toBe("on");
		expect(cast_value_to_type("off", "bool")).toBe("off");
		expect(cast_value_to_type("random", "bool")).toBe("random");
	});
	test("casts to date", () => {
		const result = cast_value_to_type("2023-01-01", "date");
		expect(result).toBe("2023-01-01T00:00:00.000Z");
		expect(typeof cast_value_to_type("not a date", "date")).toBe("string");
	});
	test("returns value as-is for str", () => {
		expect(cast_value_to_type("hello", "str")).toBe("hello");
		expect(cast_value_to_type(123, "str")).toBe(123);
	});
	test("preserves null and undefined for all types", () => {
		expect(cast_value_to_type(null, "number")).toBe(null);
		expect(cast_value_to_type(undefined, "number")).toBe(undefined);
		expect(cast_value_to_type(null, "bool")).toBe(null);
		expect(cast_value_to_type(undefined, "bool")).toBe(undefined);
		expect(cast_value_to_type(null, "date")).toBe(null);
		expect(cast_value_to_type(undefined, "date")).toBe(undefined);
		expect(cast_value_to_type(null, "str")).toBe(null);
		expect(cast_value_to_type(undefined, "str")).toBe(undefined);
	});
});

describe("guess_delimiter", () => {
	test("detects comma delimiter", () => {
		const csv = "a,b,c\n1,2,3\n4,5,6";
		expect(guess_delimiter(csv, [",", "\t"])).toContain(",");
	});

	test("detects tab delimiter", () => {
		const tsv = "a\tb\tc\n1\t2\t3\n4\t5\t6";
		expect(guess_delimiter(tsv, [",", "\t"])).toContain("\t");
	});

	test("returns empty array when no consistent delimiter", () => {
		const text = "abc\ndef\nghi";
		expect(guess_delimiter(text, [",", "\t"])).toEqual([]);
	});

	test("handles single-line input", () => {
		// single line with commas — cache set once, always matches
		const text = "a,b,c";
		expect(guess_delimiter(text, [",", "\t"])).toContain(",");
	});
});

describe("data_uri_to_blob", () => {
	test("converts data URI to Blob with correct MIME type", () => {
		const data_uri = "data:text/plain;base64,SGVsbG8=";
		const blob = data_uri_to_blob(data_uri);
		expect(blob.type).toBe("text/plain");
	});

	test("converts data URI to Blob with correct content", async () => {
		// "Hello" in base64 is "SGVsbG8="
		const data_uri = "data:text/plain;base64,SGVsbG8=";
		const blob = data_uri_to_blob(data_uri);
		const text = await blob.text();
		expect(text).toBe("Hello");
	});
});
