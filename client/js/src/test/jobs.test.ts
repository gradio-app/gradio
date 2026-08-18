import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Config } from "../types";
import {
	clear_pending_job,
	read_pending_jobs,
	track_pending_job
} from "../utils/jobs";

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

const config = { app_id: "app-1", root: "https://example.com" } as Config;

describe("pending jobs", () => {
	beforeEach(() => {
		if (typeof sessionStorage === "undefined") {
			vi.stubGlobal("sessionStorage", new MemoryStorage());
		}
		sessionStorage.clear();
	});

	it("remembers a job until it is cleared", () => {
		track_pending_job(config, { event_id: "event-1", fn_index: 3 });

		expect(read_pending_jobs(config)).toEqual([
			{ event_id: "event-1", fn_index: 3 }
		]);

		clear_pending_job("event-1");
		expect(read_pending_jobs(config)).toEqual([]);
	});

	it("keeps several jobs and clears them one at a time", () => {
		track_pending_job(config, { event_id: "event-1", fn_index: 1 });
		track_pending_job(config, { event_id: "event-2", fn_index: 2 });

		clear_pending_job("event-1");

		expect(read_pending_jobs(config)).toEqual([
			{ event_id: "event-2", fn_index: 2 }
		]);
	});

	it("does not record the same job twice", () => {
		track_pending_job(config, { event_id: "event-1", fn_index: 1 });
		track_pending_job(config, { event_id: "event-1", fn_index: 1 });

		expect(read_pending_jobs(config)).toHaveLength(1);
	});

	it("forgets jobs belonging to another app", () => {
		track_pending_job(config, { event_id: "event-1", fn_index: 1 });

		// Easily done on localhost, where a different app answers on the same origin.
		expect(read_pending_jobs({ ...config, app_id: "app-2" } as Config)).toEqual(
			[]
		);
		expect(read_pending_jobs(config)).toEqual([]);
	});

	it("keeps jobs for as long as the tab lives", () => {
		vi.useFakeTimers();
		try {
			track_pending_job(config, { event_id: "event-1", fn_index: 1 });
			vi.advanceTimersByTime(6 * 60 * 60 * 1000);

			// The server decides when a job is past saving, not the client.
			expect(read_pending_jobs(config)).toHaveLength(1);
		} finally {
			vi.useRealTimers();
		}
	});

	it("stores no session hash, so a reload starts a new session", () => {
		track_pending_job(config, { event_id: "event-1", fn_index: 1 });

		const stored = sessionStorage.getItem("gradio_pending_jobs") ?? "";
		expect(stored).not.toContain("session_hash");
	});
});
