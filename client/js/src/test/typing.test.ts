import { describe, test, expect } from "vitest";
import type { PredictReturn, PredictFunction } from "../types";

describe("PredictReturn generic types", () => {
	test("PredictReturn with default unknown type", () => {
		const result: PredictReturn = {
			type: "data",
			time: new Date(),
			data: ["any", "data"],
			endpoint: "/predict",
			fn_index: 0
		};
		expect(result.data).toBeDefined();
	});

	test("PredictReturn with custom type", () => {
		type MyData = { text: string; confidence: number };
		const result: PredictReturn<MyData> = {
			type: "data",
			time: new Date(),
			data: { text: "hello", confidence: 0.95 },
			endpoint: "/predict",
			fn_index: 0
		};
		expect(result.data.text).toBe("hello");
		expect(result.data.confidence).toBe(0.95);
	});

	test("PredictReturn with array type", () => {
		type ArrayData = string[];
		const result: PredictReturn<ArrayData> = {
			type: "data",
			time: new Date(),
			data: ["hello", "world"],
			endpoint: "/predict",
			fn_index: 0
		};
		expect(result.data[0]).toBe("hello");
		expect(result.data.length).toBe(2);
	});

	test("PredictFunction type signature allows generic parameter", () => {
		// This test verifies that PredictFunction accepts a generic type parameter
		type MyResponse = { output: string };

		// Mock function that matches PredictFunction signature
		const mockPredict: PredictFunction = async <T = unknown>(
			endpoint: string | number,
			data?: unknown[] | Record<string, unknown>,
			event_data?: unknown
		): Promise<PredictReturn<T>> => {
			return {
				type: "data",
				time: new Date(),
				data: { output: "test" } as T,
				endpoint: String(endpoint),
				fn_index: 0
			};
		};

		// Type check: calling with generic parameter
		const typedResult = mockPredict<MyResponse>("/predict", ["input"]);
		expect(typedResult).toBeDefined();
	});
});
