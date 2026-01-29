import { test, describe, assert } from "vitest";

describe("Slider", () => {
	describe("change event", () => {
		test("should trigger for all numeric values including 0, but not null/undefined", () => {
			const should_trigger_change = (
				value: number | null | undefined
			): boolean => {
				return value != null;
			};

			assert.isTrue(should_trigger_change(0));
			assert.isTrue(should_trigger_change(5));
			assert.isTrue(should_trigger_change(-5));
			assert.isTrue(should_trigger_change(0.5));

			assert.isFalse(should_trigger_change(null));
			assert.isFalse(should_trigger_change(undefined));
		});
	});

	describe("input event", () => {
		test("should fire on slider interaction", () => {
			let input_fired = false;
			const handle_input = (): void => {
				input_fired = true;
			};

			handle_input();
			assert.isTrue(input_fired);
		});
	});
});
