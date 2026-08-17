import { afterEach, describe, expect, it, vi } from "vitest";
import { is_deliberate_exit, on_deliberate_exit } from "../utils/lifecycle";

const in_browser =
	typeof window !== "undefined" && typeof document !== "undefined";

function set_visibility(state: DocumentVisibilityState): void {
	Object.defineProperty(document, "visibilityState", {
		value: state,
		configurable: true
	});
}

function fire_pagehide(persisted: boolean): void {
	const event = new Event("pagehide");
	Object.defineProperty(event, "persisted", { value: persisted });
	window.dispatchEvent(event);
}

describe.skipIf(!in_browser)("on_deliberate_exit", () => {
	afterEach(() => {
		// Hand `visibilityState` back to the real getter on Document.prototype.
		Reflect.deleteProperty(document, "visibilityState");
	});

	it("fires when a visible page is torn down", () => {
		const callback = vi.fn();
		const stop = on_deliberate_exit(callback);
		set_visibility("visible");

		fire_pagehide(false);

		expect(callback).toHaveBeenCalledTimes(1);
		stop();
	});

	it("does not fire when the page is put in the back/forward cache", () => {
		const callback = vi.fn();
		const stop = on_deliberate_exit(callback);
		set_visibility("visible");

		fire_pagehide(true);

		expect(callback).not.toHaveBeenCalled();
		stop();
	});

	it("does not fire when an already hidden page is torn down", () => {
		const callback = vi.fn();
		const stop = on_deliberate_exit(callback);
		// A backgrounded tab that the browser or OS is reclaiming: the person
		// switched away and expects to come back to their work.
		set_visibility("hidden");

		fire_pagehide(false);

		expect(callback).not.toHaveBeenCalled();
		stop();
	});

	it("stops listening once released", () => {
		const callback = vi.fn();
		const stop = on_deliberate_exit(callback);
		set_visibility("visible");

		stop();
		fire_pagehide(false);

		expect(callback).not.toHaveBeenCalled();
	});

	it("reports intent without needing a listener", () => {
		set_visibility("visible");
		expect(
			is_deliberate_exit({ persisted: false } as PageTransitionEvent)
		).toBe(true);
		expect(is_deliberate_exit({ persisted: true } as PageTransitionEvent)).toBe(
			false
		);

		set_visibility("hidden");
		expect(
			is_deliberate_exit({ persisted: false } as PageTransitionEvent)
		).toBe(false);
	});
});

describe.skipIf(in_browser)("on_deliberate_exit without a DOM", () => {
	it("does nothing when server rendered", () => {
		const callback = vi.fn();

		const stop = on_deliberate_exit(callback);
		stop();

		expect(callback).not.toHaveBeenCalled();
	});
});
