import { assert, describe, test } from "vitest";
import { bool_to_tuple, tuple_to_class, get_styles } from "./styles";

describe("bool_to_tuple", () => {
	test("converts true to tuple of true", () => {
		assert.deepEqual(bool_to_tuple(true), [true, true, true, true]);
	});

	test("converts true to tuple of true", () => {
		assert.deepEqual(bool_to_tuple(false), [false, false, false, false]);
	});
});

describe("tuple_to_class", () => {
	test("adds correct classes when all are true", () => {
		const output = tuple_to_class(
			[true, true, true, true],
			"!rounded-",
			["tl", "tr", "br", "bl"],
			["lg", "none"]
		);

		assert.equal(
			output,
			"!rounded-tl-lg !rounded-tr-lg !rounded-br-lg !rounded-bl-lg"
		);
	});

	test("adds correct classes when all are false", () => {
		const output = tuple_to_class(
			[false, false, false, false],
			"!rounded-",
			["tl", "tr", "br", "bl"],
			["lg", "none"]
		);

		assert.equal(
			output,
			"!rounded-tl-none !rounded-tr-none !rounded-br-none !rounded-bl-none"
		);
	});

	test("adds correct classes with mix of booleans", () => {
		const output = tuple_to_class(
			[false, true, true, false],
			"!rounded-",
			["tl", "tr", "br", "bl"],
			["lg", "none"]
		);

		assert.equal(
			output,
			"!rounded-tl-none !rounded-tr-lg !rounded-br-lg !rounded-bl-none"
		);
	});

	test("does not add true class when no true suffix is given", () => {
		const output = tuple_to_class(
			[false, true, true, false],
			"!m",
			["t", "r", "b", "l"],
			[false, "0"]
		);

		assert.equal(output, "!mt-0 !ml-0");
	});

	test("does not add false class when no false suffix is given", () => {
		const output = tuple_to_class(
			[false, true, true, false],
			"!m",
			["t", "r", "b", "l"],
			["4", false]
		);

		assert.equal(output, "!mr-4 !mb-4");
	});
});

describe("get_styles", () => {
	test("only returns allowed styles", () => {
		const styles = {
			rounded: true,
			margin: true
		};

		assert.deepEqual(get_styles(styles, ["rounded"]), {
			rounded: " !rounded-tl-lg !rounded-tr-lg !rounded-br-lg !rounded-bl-lg ",
			classes: " !rounded-tl-lg !rounded-tr-lg !rounded-br-lg !rounded-bl-lg "
		});

		assert.deepEqual(get_styles(styles, ["rounded", "margin"]), {
			rounded: " !rounded-tl-lg !rounded-tr-lg !rounded-br-lg !rounded-bl-lg ",
			margin: "  ",
			classes: " !rounded-tl-lg !rounded-tr-lg !rounded-br-lg !rounded-bl-lg "
		});
	});

	test("generates correct grid style", () => {
		assert.deepEqual(get_styles({ grid: 3 }, ["grid"]), {
			grid: " grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 ",
			classes:
				" grid-cols-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 "
		});

		assert.deepEqual(get_styles({ grid: [3, 2, 1] }, ["grid"]), {
			grid: " grid-cols-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-1 ",
			classes:
				" grid-cols-3 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1 2xl:grid-cols-1 "
		});
	});
});
