import { assert, describe, test } from "vitest";
import { get_path } from "./generate_theme.cjs";

describe("get_path", () => {
	test("shallow objects should be equal to the input", () => {
		assert.deepEqual(
			get_path({
				1: "hi",
				2: 123,
				3: true
			}),
			{ "--1": "hi", "--2": 123, "--3": true }
		);
	});

	test("deeper objects should generate dot paths", () => {
		assert.deepEqual(
			get_path({
				1: {
					1: "hi",
					2: 123,
					3: true
				}
			}),
			{ "--1-1": "hi", "--1-2": 123, "--1-3": true }
		);
	});

	test("very deep objects should generate dot paths", () => {
		assert.deepEqual(
			get_path({
				1: {
					1: "hi",
					2: 123,
					3: {
						1: "hi",
						2: 123,
						3: {
							1: "hi",
							2: 123,
							3: {
								1: "hi",
								2: 123,
								3: {
									1: "hi",
									2: 123,
									3: {
										1: "hi",
										2: 123,
										3: {
											1: "hi",
											2: 123,
											3: true
										}
									}
								}
							}
						}
					}
				}
			}),
			{
				"--1-1": "hi",
				"--1-2": 123,
				"--1-3-1": "hi",
				"--1-3-2": 123,
				"--1-3-3-1": "hi",
				"--1-3-3-2": 123,
				"--1-3-3-3-1": "hi",
				"--1-3-3-3-2": 123,
				"--1-3-3-3-3-1": "hi",
				"--1-3-3-3-3-2": 123,
				"--1-3-3-3-3-3-1": "hi",
				"--1-3-3-3-3-3-2": 123,
				"--1-3-3-3-3-3-3-1": "hi",
				"--1-3-3-3-3-3-3-2": 123,
				"--1-3-3-3-3-3-3-3": true
			}
		);
	});

	test("string referenecs should be converted to vars", () => {
		assert.deepEqual(
			get_path({
				1: "hi",
				2: 123,
				3: {
					1: "hi",
					2: 123,
					3: "1.2"
				}
			}),
			{
				"--1": "hi",
				"--2": 123,
				"--3-1": "hi",
				"--3-2": 123,
				"--3-3": "var(--1-2)"
			}
		);
	});
});
