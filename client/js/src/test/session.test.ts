import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Config } from "../types";
import {
	clear_resumable_event,
	get_resumable_events,
	get_resumable_session_hash,
	track_resumable_event
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
		if (typeof document !== "undefined") {
			document.cookie = "gradio_active_session=; Path=/; Max-Age=0";
		}
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

	it("reads the active session cookie during server rendering", () => {
		expect(
			get_resumable_session_hash("other=value; gradio_active_session=session-2")
		).toBe("session-2");
	});
});
