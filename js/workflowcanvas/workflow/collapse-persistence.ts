/**
 * Per-viewer collapse state for node groups.
 *
 * Which groups are folded is the viewer's business, not the workflow's: a
 * read-only visitor looking at someone else's Space is exactly who most needs
 * to fold things away, and that must never demand a login or mark the file
 * dirty. So a toggle is stored here, sparsely — only groups this viewer has
 * actually clicked. A group with no entry keeps tracking the file's own
 * `collapsed` default, the same precedence `apply_layout` gives positions.
 *
 * This deliberately does *not* live in `layout-persistence.ts`. A sibling key
 * in that blob would be dropped on read (`load_layout` filters every entry
 * through `is_node_layout`), and folding it into `layout_signature` would make
 * the first toggle write every node's position — which flips `layout_is_unseen`
 * and pins the viewer to their stored coordinates forever, freezing them
 * against the author's later re-arrangements. `viewport-persistence.ts` keeps
 * pan/zoom out of the layout blob for the same reason; this follows it.
 */

export type CollapseState = Record<string, boolean>;

export function collapse_storage_key(name: string): string {
	return `gradio_workflow_collapsed:${name}`;
}

function default_storage(): Storage | undefined {
	return typeof localStorage !== "undefined" ? localStorage : undefined;
}

export function load_collapsed(
	name: string,
	storage: Storage | undefined = default_storage()
): CollapseState {
	if (!storage) return {};
	try {
		const raw = storage.getItem(collapse_storage_key(name));
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return {};
		const state: CollapseState = {};
		for (const [id, value] of Object.entries(parsed)) {
			if (typeof value === "boolean") state[id] = value;
		}
		return state;
	} catch {
		return {};
	}
}

export function save_collapsed(
	name: string,
	state: CollapseState,
	storage: Storage | undefined = default_storage()
): void {
	if (!storage) return;
	try {
		storage.setItem(collapse_storage_key(name), JSON.stringify(state));
	} catch {}
}
