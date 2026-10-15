import { describe, test, expect, vi } from "vitest";
import { on_page_info, type PageInfo } from "./page_info";

describe("on_page_info", () => {
	let send: ((info: PageInfo) => void) | false = false;
	const getPageInfo = vi.fn((cb: typeof send) => (send = cb));
	vi.stubGlobal("window", { parentIFrame: { getPageInfo } });
	const info = { scrollTop: 0, offsetTop: 0, clientHeight: 800 };

	test("every subscriber gets updates, and the parent is released after the last", () => {
		const a = vi.fn();
		const b = vi.fn();
		const stop_a = on_page_info(a);
		const stop_b = on_page_info(b);
		(send as (info: PageInfo) => void)(info);
		expect(a).toHaveBeenCalledWith(info);
		expect(b).toHaveBeenCalledWith(info);

		stop_a();
		expect(send).not.toBe(false);
		stop_b();
		expect(send).toBe(false);
	});
});
