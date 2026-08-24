/**
 * Per-viewer node layout.
 *
 * Where a card sits, how wide it is and how tall the viewer stretched it are
 * *view* state, not part of the workflow: two people opening the same
 * `workflow.json` should each be free to arrange it however they like, and
 * nudging a card should never mark the workflow dirty or demand a login. So
 * geometry is stripped from what gets written to disk (`sanitize_for_save`) and
 * mirrored here into localStorage instead, keyed by workflow name — the same
 * scheme `viewport-persistence.ts` uses for pan/zoom.
 *
 * A viewer with nothing stored is a first-time viewer. If the file carries a
 * complete arrangement, that is what they see — an author publishing a workflow
 * still gets to say how it reads on first open, and `sanitize_for_save` means
 * nothing the viewer then does can overwrite it. Only when the file has no
 * coordinates does the canvas auto-arrange and fit.
 *
 * A viewer with *some* nodes stored has arranged this workflow before and has
 * since been shown new ones — those get a free spot clear of the cards they
 * already placed, and the rest of their arrangement is left alone.
 */

import { allNodes } from "./workflow-migration";
import { findFreeSpot } from "./workflow-graph";
import type {
	AnyNode,
	OperatorNode,
	ReferenceNode,
	SubjectNode,
	Workflow
} from "./workflow-types";

export interface NodeLayout {
	x: number;
	y: number;
	width: number;
	height: number;
	manual_height?: number;
}

export type WorkflowLayout = Record<string, NodeLayout>;

/** Horizontal clearance given to a node the viewer has never placed. */
const UNPLACED_GAP = 280;
/** Vertical stride between several never-placed nodes, so they don't overlap. */
const UNPLACED_ROW = 180;

export function layout_storage_key(name: string): string {
	return `gradio_workflow_layout:${name}`;
}

function default_storage(): Storage | undefined {
	return typeof localStorage !== "undefined" ? localStorage : undefined;
}

function is_node_layout(v: unknown): v is NodeLayout {
	const l = v as NodeLayout | null;
	return (
		!!l &&
		typeof l === "object" &&
		Number.isFinite(l.x) &&
		Number.isFinite(l.y) &&
		Number.isFinite(l.width) &&
		Number.isFinite(l.height) &&
		(l.manual_height === undefined || Number.isFinite(l.manual_height))
	);
}

export function load_layout(
	name: string,
	storage: Storage | undefined = default_storage()
): WorkflowLayout {
	if (!storage) return {};
	try {
		const raw = storage.getItem(layout_storage_key(name));
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return {};
		const layout: WorkflowLayout = {};
		for (const [id, entry] of Object.entries(parsed)) {
			if (is_node_layout(entry)) layout[id] = entry;
		}
		return layout;
	} catch {
		return {};
	}
}

export function save_layout(
	name: string,
	layout: WorkflowLayout,
	storage: Storage | undefined = default_storage()
): void {
	if (!storage) return;
	try {
		storage.setItem(layout_storage_key(name), JSON.stringify(layout));
	} catch {}
}

export function extract_layout(wf: Workflow): WorkflowLayout {
	const layout: WorkflowLayout = {};
	for (const node of allNodes(wf)) {
		layout[node.id] = {
			x: node.x,
			y: node.y,
			width: node.width,
			height: node.height,
			...(node.manual_height === undefined
				? {}
				: { manual_height: node.manual_height })
		};
	}
	return layout;
}

/**
 * A layout reduced to what the viewer can deliberately change: position, width
 * and a pinned height. Measured `height` is left out because a `ResizeObserver`
 * writes it moments after mount, which would otherwise read as a rearrangement.
 *
 * The canvas compares this against the arrangement it started from, so a viewer
 * who never moves anything stores nothing — and keeps seeing the file's own
 * arrangement, including changes the author makes to it later.
 */
export function layout_signature(layout: WorkflowLayout): string {
	return JSON.stringify(
		Object.keys(layout)
			.sort()
			.map((id) => {
				const entry = layout[id];
				return [id, entry.x, entry.y, entry.width, entry.manual_height ?? null];
			})
	);
}

/** True when the viewer has never arranged any of this workflow's nodes. */
export function layout_is_unseen(
	wf: Workflow,
	layout: WorkflowLayout
): boolean {
	return allNodes(wf).every((node) => layout[node.id] === undefined);
}

function map_nodes(
	wf: Workflow,
	fn: <T extends AnyNode>(node: T) => T
): Workflow {
	return {
		...wf,
		references: wf.references.map((n) => fn<ReferenceNode>(n)),
		operators: wf.operators.map((n) => fn<OperatorNode>(n)),
		subjects: wf.subjects.map((n) => fn<SubjectNode>(n))
	};
}

export interface ApplyLayoutOptions {
	/**
	 * What to do with a node the viewer has no stored entry for. `true` (the
	 * default) parks it clear of the cards they *have* arranged — right for a
	 * node that appeared in the workflow since their last visit. `false` leaves
	 * the node where it already is, which is what a first-time viewer of a file
	 * that carries its author's arrangement should see.
	 */
	park_unplaced?: boolean;
}

export function apply_layout(
	wf: Workflow,
	layout: WorkflowLayout,
	{ park_unplaced = true }: ApplyLayoutOptions = {}
): Workflow {
	const placed = allNodes(wf)
		.map((node) => layout[node.id])
		.filter((entry): entry is NodeLayout => entry !== undefined)
		.map(({ x, y }) => ({ x, y }));

	// Nodes with no stored entry are ones this viewer has never seen. Park them
	// to the right of everything they *have* arranged, in a column so a handful
	// arriving at once don't land in a near-perfect stack.
	const unplaced_origin = {
		x: placed.length ? Math.max(...placed.map((p) => p.x)) + UNPLACED_GAP : 80,
		y: placed.length ? Math.min(...placed.map((p) => p.y)) : 80
	};
	let unplaced_seen = 0;

	return map_nodes(wf, <T extends AnyNode>(node: T): T => {
		const stored = layout[node.id];
		if (!stored) {
			if (!park_unplaced) return node;
			const spot = findFreeSpot(
				placed,
				unplaced_origin.x,
				unplaced_origin.y + unplaced_seen * UNPLACED_ROW
			);
			unplaced_seen += 1;
			placed.push(spot);
			return { ...node, x: spot.x, y: spot.y };
		}
		const applied = {
			...node,
			x: stored.x,
			y: stored.y,
			width: stored.width,
			height: stored.height
		};
		// A pin is per-viewer too, so the stored entry is the only authority on
		// it: no entry means this viewer never pinned the card, even if an older
		// `workflow.json` still carries someone else's `manual_height`.
		if (stored.manual_height === undefined) delete applied.manual_height;
		else applied.manual_height = stored.manual_height;
		return applied;
	});
}
