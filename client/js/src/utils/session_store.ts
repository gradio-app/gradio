/**
 * What a session holds in the browser: the `gr.State` values the server
 * sealed, and the values its components were last given.
 *
 * `gr.State`: after an event changes a `gr.State`, the server sends an
 * encrypted token for the new value and a short reference to it. The client
 * sends the reference (or the token itself, when it is small) with every event
 * that reads or writes that state. If the server answering the event does not
 * have the value cached, it responds with 409 and the ids it is missing, and
 * the client retries with the tokens for those ids.
 *
 * Component values: the inputs an event was sent with and the outputs (values
 * or updates) it returned, so that a reloaded page that resumes the session
 * can show what it showed before, without asking the server.
 *
 * Both are saved in one IndexedDB record per session (see `browser_storage.ts`).
 */

import {
	SESSION_MAX_AGE_MS,
	app_scope_key,
	apply_component_value,
	delete_record,
	is_update,
	prune_records,
	read_record,
	write_record,
	type StoredRecord
} from "./browser_storage";

export interface StateEntry {
	ref: string;
	token: string;
}

/** What the server sends: a new entry, or null to drop the entry. */
export type StateUpdates = Record<string, StateEntry | null>;

export type StatePayload = Record<string, { ref: string } | { token: string }>;

/** Tokens up to this length are always sent in full, saving a round trip. */
export const INLINE_STATE_LIMIT = 16 * 1024;

interface SavedSession extends StoredRecord {
	app_key: string;
	/** `gr.State` tokens, by component id */
	state: Record<string, StateEntry>;
	/** The props to restore, by component id */
	values: Record<string, Record<string, unknown>>;
}

interface ComponentLike {
	id: number;
	type: string;
	props: Record<string, any>;
}

// Kept in the browser elsewhere: `gr.State` as tokens, and `gr.BrowserState`
// in local storage by the component itself.
const NOT_SAVED = new Set(["state", "browserstate"]);

export class SessionStore {
	private state = new Map<string, StateEntry>();
	private values = new Map<string, Record<string, unknown>>();
	private key: string | null = null;
	private app_key = "";
	private save_timer: ReturnType<typeof setTimeout> | null = null;
	/** The save in progress, and whether there are changes it does not include. */
	private saving: Promise<void> | null = null;
	private changed_while_saving = false;
	/** Whether a saved session was found when this store was attached. */
	found = false;

	/**
	 * The state to send with an event, for the given component ids. Ids in
	 * `force_tokens` are sent in full, whatever their size.
	 */
	payload(
		ids: Iterable<number>,
		force_tokens: Iterable<number> = []
	): StatePayload {
		const force = new Set(Array.from(force_tokens, String));
		const payload: StatePayload = {};
		for (const id of ids) {
			const key = String(id);
			const entry = this.state.get(key);
			if (!entry) continue;
			payload[key] =
				force.has(key) || entry.token.length <= INLINE_STATE_LIMIT
					? { token: entry.token }
					: { ref: entry.ref };
		}
		return payload;
	}

	/** Applies the `gr.State` changes the server sent with an event. */
	apply(updates: StateUpdates | null | undefined): void {
		if (!updates) return;
		let changed = false;
		for (const [id, entry] of Object.entries(updates)) {
			if (entry === null) {
				changed = this.state.delete(id) || changed;
			} else if (entry && typeof entry.token === "string") {
				this.state.set(id, { ref: entry.ref, token: entry.token });
				changed = true;
			}
		}
		if (changed) this.schedule_save();
	}

	get(id: number | string): StateEntry | undefined {
		return this.state.get(String(id));
	}

	get size(): number {
		return this.state.size;
	}

	/**
	 * Deletes everything saved for this session, in memory and in the browser,
	 * and stops saving it.
	 */
	async forget(): Promise<void> {
		const key = this.key;
		this.key = null;
		if (this.save_timer) {
			clearTimeout(this.save_timer);
			this.save_timer = null;
		}
		while (this.saving) await this.saving;
		this.state.clear();
		this.values.clear();
		this.found = false;
		if (key !== null) await delete_record("sessions", key);
	}

	/**
	 * Remembers the values `ids` were given (an event's inputs, or the outputs
	 * it returned), index-aligned with `values`.
	 */
	record(
		ids: number[],
		values: unknown[],
		components: { id: number; type: string }[]
	): void {
		let changed = false;
		for (const [index, id] of ids.entries()) {
			if (index >= values.length) break;
			const value = values[index];
			if (value === undefined) continue;
			const type = components.find((c) => c.id === id)?.type;
			if (!type || NOT_SAVED.has(type)) continue;
			if (is_update(value) && Object.keys(value).length === 1) continue;
			const key = String(id);
			const props = this.values.get(key) ?? {};
			apply_component_value(props, value);
			this.values.set(key, props);
			changed = true;
		}
		if (changed) this.schedule_save();
	}

	/**
	 * Puts the saved values back into `components` (an app config's), before
	 * it is rendered. Returns whether there were any.
	 */
	restore_into(components: ComponentLike[]): boolean {
		let restored = false;
		for (const component of components) {
			const props = this.values.get(String(component.id));
			if (!props || NOT_SAVED.has(component.type)) continue;
			Object.assign(component.props, props);
			restored = true;
		}
		return restored;
	}

	/**
	 * Loads what was saved for this session of this app, and saves later
	 * changes there. What is already in memory takes precedence.
	 */
	async attach(
		root: string,
		app_key: string | undefined,
		session_hash: string
	): Promise<void> {
		const key = `${app_scope_key(root, app_key)}|${session_hash}`;
		this.key = key;
		this.app_key = app_key ?? "";
		const saved = await read_record<SavedSession>("sessions", key);
		if (saved && this.key === key && saved.app_key === this.app_key) {
			this.found = true;
			for (const [id, entry] of Object.entries(saved.state ?? {})) {
				if (!this.state.has(id)) this.state.set(id, entry);
			}
			for (const [id, props] of Object.entries(saved.values ?? {})) {
				if (!this.values.has(id)) this.values.set(id, props);
			}
		}
		void prune_records("sessions", {
			max_age_ms: SESSION_MAX_AGE_MS,
			except: key
		});
		// Changes made before the saved session was loaded have not been saved.
		if (this.state.size || this.values.size) this.schedule_save();
	}

	/** Saves now, e.g. when the page is hidden, and waits for it. */
	async flush(): Promise<void> {
		// A save can schedule another when it is done, so loop until neither is left.
		while (this.save_timer || this.saving) {
			if (this.save_timer) {
				clearTimeout(this.save_timer);
				this.save_timer = null;
				this.start_save();
			}
			await this.saving;
		}
	}

	/**
	 * Saves as soon as this task is done, so a burst of changes is saved once
	 * and a page reloaded right after a change still has it. A change made
	 * while a save is in progress is saved once that save is done, so there is
	 * at most one save in flight (e.g. while a generator streams outputs).
	 */
	private schedule_save(): void {
		if (this.key === null) return;
		if (this.saving) {
			this.changed_while_saving = true;
			return;
		}
		if (this.save_timer) return;
		this.save_timer = setTimeout(() => {
			this.save_timer = null;
			this.start_save();
		}, 0);
	}

	private start_save(): void {
		this.changed_while_saving = false;
		this.saving = this.save().finally(() => {
			this.saving = null;
			if (this.changed_while_saving) this.schedule_save();
		});
	}

	private async save(): Promise<void> {
		const key = this.key;
		if (key === null) return;
		if (this.state.size === 0 && this.values.size === 0) {
			await delete_record("sessions", key);
			return;
		}
		await write_record<SavedSession>("sessions", {
			key,
			updated: Date.now(),
			app_key: this.app_key,
			state: Object.fromEntries(this.state),
			values: Object.fromEntries(this.values)
		});
	}
}
