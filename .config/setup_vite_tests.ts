import type { TestingLibraryMatchers } from "@testing-library/jest-dom/matchers";
import matchers from "@testing-library/jest-dom/matchers";
import { expect } from "vitest";

declare module "vitest" {
	interface Assertion<T = any>
		extends jest.Matchers<void, T>,
			TestingLibraryMatchers<T, void> {}
}

expect.extend(matchers);
