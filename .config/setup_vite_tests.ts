import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom/vitest";

// Suppress benign ResizeObserver loop errors in tests.
// These occur when ResizeObserver callbacks can't be delivered in a single
// animation frame (common with virtualizers) and are harmless.
if (typeof window !== "undefined") {
	window.addEventListener("error", (e) => {
		if (e.message?.includes("ResizeObserver loop")) {
			e.stopImmediatePropagation();
		}
	});
}

declare module "vitest" {
	interface Assertion<T = any>
		extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
}
