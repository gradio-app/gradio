import { describe, it, expect, vi, afterEach } from "vitest";
import { shared_request, with_timeout } from "../helpers/zerogpu";

describe("shared_request", () => {
	it("gives calls made while a request is pending the same result", async () => {
		let resolve!: (value: string) => void;
		const request = vi.fn(() => new Promise<string>((res) => (resolve = res)));
		const get = shared_request(request);

		const calls = [get(), get(), get()];
		resolve("headers");

		expect(await Promise.all(calls)).toEqual(["headers", "headers", "headers"]);
		expect(request).toHaveBeenCalledTimes(1);
	});

	it("makes a new request once the pending one is done", async () => {
		const request = vi.fn(() => Promise.resolve("headers"));
		const get = shared_request(request);

		await get();
		await get();

		expect(request).toHaveBeenCalledTimes(2);
	});

	it("makes a new request after a failed one", async () => {
		const request = vi
			.fn<() => Promise<string>>()
			.mockRejectedValueOnce(new Error("no reply"))
			.mockResolvedValueOnce("headers");
		const get = shared_request(request);

		await expect(get()).rejects.toThrow("no reply");
		expect(await get()).toBe("headers");
	});
});

describe("with_timeout", () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it("gives the result when it comes in time", async () => {
		expect(await with_timeout(Promise.resolve("headers"), 100, null)).toBe(
			"headers"
		);
	});

	it("gives the fallback when no result comes in time", async () => {
		vi.useFakeTimers();
		const result = with_timeout(new Promise<string>(() => {}), 100, null);
		await vi.advanceTimersByTimeAsync(100);
		expect(await result).toBeNull();
	});
});
