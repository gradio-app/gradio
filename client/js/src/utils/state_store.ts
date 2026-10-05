/**
 * Holds the `gr.State` values that the server keeps in the browser.
 *
 * After an event changes a `gr.State`, the server sends an encrypted token for
 * the new value and a short reference to it. The client sends the reference
 * (or the token itself, when it is small) with every event that reads or
 * writes that state. If the server answering the event does not have the
 * value cached, it responds with 409 and the ids it is missing, and the
 * client retries with the tokens for those ids.
 *
 * In a browser, tokens are also saved to IndexedDB under the app and session,
 * so that a page that resumes its session gets its state back.
 */

export interface StateEntry {
	ref: string;
	token: string;
}

/** What the server sends: a new entry, or null to drop the entry. */
export type StateUpdates = Record<string, StateEntry | null>;

export type StatePayload = Record<string, { ref: string } | { token: string }>;

/** Tokens up to this length are always sent in full, saving a round trip. */
export const INLINE_STATE_LIMIT = 16 * 1024;

const DB_NAME = "gradio-state";
const DB_STORE = "sessions";
/** Saved sessions not updated for this long are deleted. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface SavedSession {
	key: string;
	updated: number;
	entries: Record<string, StateEntry>;
}

export class StateStore {
	private entries = new Map<string, StateEntry>();
	private key: string | null = null;
	private save_scheduled = false;

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
			const entry = this.entries.get(key);
			if (!entry) continue;
			payload[key] =
				force.has(key) || entry.token.length <= INLINE_STATE_LIMIT
					? { token: entry.token }
					: { ref: entry.ref };
		}
		return payload;
	}

	apply(updates: StateUpdates | null | undefined): void {
		if (!updates) return;
		let changed = false;
		for (const [id, entry] of Object.entries(updates)) {
			if (entry === null) {
				changed = this.entries.delete(id) || changed;
			} else if (entry && typeof entry.token === "string") {
				this.entries.set(id, { ref: entry.ref, token: entry.token });
				changed = true;
			}
		}
		if (changed) this.schedule_save();
	}

	get(id: number | string): StateEntry | undefined {
		return this.entries.get(String(id));
	}

	get size(): number {
		return this.entries.size;
	}

	clear(): void {
		this.entries.clear();
		this.schedule_save();
	}

	/**
	 * Loads the entries saved for `key` (an app and session) and saves any
	 * later changes under it. Entries already in memory take precedence.
	 */
	async attach(key: string): Promise<void> {
		this.key = key;
		const db = await open_db();
		if (!db) return;
		try {
			const saved = await request<SavedSession | undefined>(
				db.transaction(DB_STORE, "readonly").objectStore(DB_STORE).get(key)
			);
			if (saved && this.key === key) {
				for (const [id, entry] of Object.entries(saved.entries)) {
					if (!this.entries.has(id)) this.entries.set(id, entry);
				}
			}
			await prune(db);
		} catch (e) {
			// Storage is best effort: the state still works for this page.
		} finally {
			db.close();
		}
	}

	private schedule_save(): void {
		if (this.key === null || this.save_scheduled) return;
		this.save_scheduled = true;
		setTimeout(() => {
			this.save_scheduled = false;
			void this.save();
		}, 0);
	}

	private async save(): Promise<void> {
		const key = this.key;
		if (key === null) return;
		const db = await open_db();
		if (!db) return;
		try {
			const store = db.transaction(DB_STORE, "readwrite").objectStore(DB_STORE);
			if (this.entries.size === 0) {
				await request(store.delete(key));
			} else {
				const session: SavedSession = {
					key,
					updated: Date.now(),
					entries: Object.fromEntries(this.entries)
				};
				await request(store.put(session));
			}
		} catch (e) {
			// e.g. the quota is exceeded; the state is still held in memory.
		} finally {
			db.close();
		}
	}
}

function request<T>(req: IDBRequest): Promise<T> {
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result as T);
		req.onerror = () => reject(req.error);
	});
}

async function open_db(): Promise<IDBDatabase | null> {
	if (typeof indexedDB === "undefined") return null;
	try {
		return await new Promise<IDBDatabase>((resolve, reject) => {
			const req = indexedDB.open(DB_NAME, 1);
			req.onupgradeneeded = () => {
				const store = req.result.createObjectStore(DB_STORE, {
					keyPath: "key"
				});
				store.createIndex("updated", "updated");
			};
			req.onsuccess = () => resolve(req.result);
			req.onerror = () => reject(req.error);
			req.onblocked = () => reject(new Error("IndexedDB is blocked"));
		});
	} catch (e) {
		return null;
	}
}

async function prune(db: IDBDatabase): Promise<void> {
	const index = db
		.transaction(DB_STORE, "readwrite")
		.objectStore(DB_STORE)
		.index("updated");
	const range = IDBKeyRange.upperBound(Date.now() - MAX_AGE_MS);
	await new Promise<void>((resolve, reject) => {
		const req = index.openCursor(range);
		req.onsuccess = () => {
			const cursor = req.result;
			if (!cursor) return resolve();
			cursor.delete();
			cursor.continue();
		};
		req.onerror = () => reject(req.error);
	});
}
