/**
 * Where the client keeps an app's data in the browser.
 *
 * Two kinds of records share one IndexedDB database:
 * - `sessions`: what a session needs to carry on after the page is reloaded,
 *   keyed by app and session: the `gr.State` tokens the server sealed, and the
 *   values the session's components were last given.
 * - `apps`: what outlives sessions, keyed by app and user: the run history and
 *   where it is stored.
 *
 * Records are scoped by the app's root URL and its `app_key`, which the server
 * derives from the app's structure, so it is the same for every replica and
 * across restarts but changes when the app's components or events do (when
 * saved component ids could mean something else).
 *
 * The small, tab-scoped pointer to the session a tab is using lives in
 * `sessionStorage` instead (see `session.ts`), so that it is not shared by tabs.
 *
 * Storage is best effort: every function resolves (to nothing) rather than
 * reject when IndexedDB is missing (e.g. in Node) or fails.
 */

const DB_NAME = "gradio";
const DB_VERSION = 1;

export type StoreName = "sessions" | "apps";

export interface StoredRecord {
	key: string;
	updated: number;
}

/** Saved sessions not updated for this long are deleted. */
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;

let db_promise: Promise<IDBDatabase | null> | null = null;

export function storage_available(): boolean {
	return typeof indexedDB !== "undefined";
}

function open_db(): Promise<IDBDatabase | null> {
	if (!storage_available()) return Promise.resolve(null);
	if (!db_promise) {
		db_promise = new Promise<IDBDatabase | null>((resolve) => {
			try {
				const req = indexedDB.open(DB_NAME, DB_VERSION);
				req.onupgradeneeded = () => {
					for (const name of ["sessions", "apps"]) {
						if (!req.result.objectStoreNames.contains(name)) {
							req.result
								.createObjectStore(name, { keyPath: "key" })
								.createIndex("updated", "updated");
						}
					}
				};
				req.onsuccess = () => {
					const db = req.result;
					// Let a newer version of this code upgrade the database.
					db.onversionchange = () => {
						db.close();
						db_promise = null;
					};
					resolve(db);
				};
				req.onerror = () => resolve(null);
				req.onblocked = () => resolve(null);
			} catch {
				resolve(null);
			}
		});
	}
	return db_promise;
}

function request<T>(req: IDBRequest): Promise<T> {
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result as T);
		req.onerror = () => reject(req.error);
	});
}

export async function read_record<T extends StoredRecord>(
	store: StoreName,
	key: string
): Promise<T | undefined> {
	const db = await open_db();
	if (!db) return undefined;
	try {
		return await request<T | undefined>(
			db.transaction(store, "readonly").objectStore(store).get(key)
		);
	} catch {
		return undefined;
	}
}

/** Saves a record, replacing any with the same key. Returns whether it was saved. */
export async function write_record<T extends StoredRecord>(
	store: StoreName,
	record: T
): Promise<boolean> {
	const db = await open_db();
	if (!db) return false;
	try {
		await request(
			db.transaction(store, "readwrite").objectStore(store).put(record)
		);
		return true;
	} catch {
		return false;
	}
}

export async function delete_record(
	store: StoreName,
	key: string
): Promise<void> {
	const db = await open_db();
	if (!db) return;
	try {
		await request(
			db.transaction(store, "readwrite").objectStore(store).delete(key)
		);
	} catch {
		// Nothing to do if the browser will not let us clean up.
	}
}

/**
 * Deletes the records not updated for `max_age_ms`, and beyond the `keep`
 * most recently updated ones, sparing `except`.
 */
export async function prune_records(
	store: StoreName,
	{
		max_age_ms = Infinity,
		keep = Infinity,
		except,
		prefix
	}: {
		max_age_ms?: number;
		keep?: number;
		except?: string;
		/** Only consider records whose key starts with this. */
		prefix?: string;
	}
): Promise<void> {
	const db = await open_db();
	if (!db) return;
	try {
		// Oldest first, as the index orders by `updated`.
		const entries: { key: string; updated: number }[] = [];
		await new Promise<void>((resolve, reject) => {
			const req = db
				.transaction(store, "readonly")
				.objectStore(store)
				.index("updated")
				.openKeyCursor();
			req.onsuccess = () => {
				const cursor = req.result;
				if (!cursor) return resolve();
				entries.push({
					key: cursor.primaryKey as string,
					updated: cursor.key as number
				});
				cursor.continue();
			};
			req.onerror = () => reject(req.error);
		});
		const cutoff = Date.now() - max_age_ms;
		const candidates = entries.filter(
			({ key }) => key !== except && (!prefix || key.startsWith(prefix))
		);
		const stale = candidates.filter(
			({ updated }, i) => updated < cutoff || candidates.length - i > keep
		);
		for (const { key } of stale) {
			await delete_record(store, key);
		}
	} catch {
		// Pruning is housekeeping; failing it changes nothing else.
	}
}

/** The key under which an app's records are stored. */
export function app_scope_key(
	root: string,
	app_key: string | undefined
): string {
	return `${root.replace(/\/+$/, "")}|${app_key ?? ""}`;
}

/**
 * Writes a value a component was given into its props, the way the frontend
 * applies it: an update (`{"__type__": "update", ...}`) sets the props it
 * carries, and anything else is the component's new value.
 */
export function apply_component_value(
	props: Record<string, any>,
	value: unknown
): void {
	if (is_update(value)) {
		for (const [key, prop] of Object.entries(value)) {
			if (key !== "__type__") props[key] = prop;
		}
	} else {
		props.value = value;
	}
}

export function is_update(value: unknown): value is Record<string, unknown> {
	return (
		typeof value === "object" &&
		value !== null &&
		!Array.isArray(value) &&
		(value as Record<string, unknown>).__type__ === "update"
	);
}
