import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Config } from "../types";
import {
	clear_resumable_event,
	get_resumable_events,
	get_resumable_session_hash,
	has_session,
	has_shown_page,
	set_session_in_use,
	track_resumable_event,
	track_session
} from "../utils/session";

class MemoryStorage implements Storage {
	values = new Map<string, string>();

	get length(): number {
		return this.values.size;
	}

	clear(): void {
		this.values.clear();
	}

	getItem(key: string): string | null {
		return this.values.get(key) ?? null;
	}

	key(index: number): string | null {
		return [...this.values.keys()][index] ?? null;
	}

	removeItem(key: string): void {
		this.values.delete(key);
	}

	setItem(key: string, value: string): void {
		this.values.set(key, value);
	}
}

const config = {
	app_id: "app-1",
	root:
		typeof location === "undefined" ? "https://example.com/" : location.origin
} as Config;

describe("resumable sessions", () => {
	beforeEach(() => {
		if (typeof sessionStorage === "undefined") {
			vi.stubGlobal("sessionStorage", new MemoryStorage());
		}
		sessionStorage.clear();
	});

	it("stores only active events for the current app session", () => {
		track_resumable_event(config, "session-1", {
			event_id: "event-1",
			fn_index: 3
		});

		expect(get_resumable_session_hash()).toBe("session-1");
		expect(get_resumable_events(config, "session-1")).toEqual([
			{ event_id: "event-1", fn_index: 3 }
		]);

		clear_resumable_event("event-1");
		expect(get_resumable_events(config, "session-1")).toEqual([]);
	});

	it("drops events when the app has changed", () => {
		track_resumable_event(config, "session-1", {
			event_id: "event-1",
			fn_index: 3
		});

		expect(
			get_resumable_events({ ...config, app_id: "app-2" }, "session-1")
		).toEqual([]);
		expect(get_resumable_session_hash()).toBeNull();
	});

	it("keeps active events until the server resolves them", () => {
		vi.useFakeTimers();
		try {
			track_resumable_event(config, "session-1", {
				event_id: "event-1",
				fn_index: 3
			});

			vi.advanceTimersByTime(2 * 60 * 60 * 1000);

			expect(get_resumable_events(config, "session-1")).toEqual([
				{ event_id: "event-1", fn_index: 3 }
			]);
		} finally {
			vi.useRealTimers();
		}
	});

	it("keeps the session after its events finish", () => {
		track_session(config, "session-1");
		track_resumable_event(config, "session-1", {
			event_id: "event-1",
			fn_index: 3
		});
		clear_resumable_event("event-1");
		set_session_in_use(false);

		expect(get_resumable_session_hash()).toBe("session-1");
		expect(has_session(config, "session-1")).toBe(true);
		expect(get_resumable_events(config, "session-1")).toEqual([]);
	});

	it("hands the session over only once its page has released it", () => {
		track_session(config, "session-1");
		// e.g. a duplicated tab, which copies the storage of a page in use
		expect(get_resumable_session_hash()).toBeNull();

		// e.g. the page was hidden or unloaded before a reload
		set_session_in_use(false);
		expect(get_resumable_session_hash()).toBe("session-1");
	});

	it("remembers the pages shown in the session", () => {
		const other_page = { ...config, current_page: "other" };
		track_session(config, "session-1");
		track_resumable_event(config, "session-1", {
			event_id: "event-1",
			fn_index: 3
		});

		expect(has_shown_page(config, "session-1")).toBe(true);
		expect(has_shown_page(other_page, "session-1")).toBe(false);

		track_session(other_page, "session-1");
		expect(has_shown_page(config, "session-1")).toBe(true);
		expect(has_shown_page(other_page, "session-1")).toBe(true);
	});

	it("keeps the events of the session it tracks", () => {
		track_resumable_event(config, "session-1", {
			event_id: "event-1",
			fn_index: 3
		});
		track_session(config, "session-1");
		expect(get_resumable_events(config, "session-1")).toEqual([
			{ event_id: "event-1", fn_index: 3 }
		]);

		track_session(config, "session-2");
		expect(get_resumable_events(config, "session-2")).toEqual([]);
		expect(has_session(config, "session-1")).toBe(false);
	});
});
