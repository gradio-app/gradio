/**
 * Undo / redo for the canvas.
 *
 * Entries are whole-workflow snapshots, but *what counts as a change worth
 * undoing* is narrower than "the store was written to". Three things write to
 * the store without the user doing anything: the executor streams results into
 * node `data`, a `ResizeObserver` writes each card's measured `height`, and
 * endpoint catalogs hydrate from the backend after mount. If those pushed
 * entries, Cmd+Z would rewind a run instead of the thing the user just did — so
 * `history_signature` leaves them out and only structure, labels, endpoint
 * choice and layout decide whether a new entry is warranted.
 *
 * Restoring must not throw live values away either: undoing a drag should move
 * the card back and leave the outputs on screen. So `undo` / `redo` carry `data`
 * and `endpoints` over from the current workflow for every node that exists on
 * both sides in the same role, and take them from the snapshot only for nodes
 * the snapshot is bringing back — which is why entries keep the values a user
 * typed rather than dropping `data` wholesale (see `snapshot`).
 */

import { allNodes } from "./workflow-migration";
import { strip_session_media } from "./workflow-store";
import type {
	AnyNode,
	OperatorNode,
	ReferenceNode,
	SubjectNode,
	Workflow
} from "./workflow-types";

const DEFAULT_LIMIT = 100;

/**
 * The part of a workflow a user could have deliberately changed. Cast to
 * `OperatorNode` purely to destructure operator-only fields off nodes that may
 * not declare them — the result is only ever serialised, never used as a node.
 *
 * `inputs` / `outputs` are excluded for the same reason as `endpoints`: all
 * three are written by `init_model_node_ports` when the backend's endpoint
 * catalog arrives after mount, so counting them would make the user's first
 * Cmd+Z rewind that hydration instead of whatever they actually just did. The
 * chosen `endpoint` stays in, so *switching* endpoints is still one undo step —
 * and since snapshots carry whole nodes, undoing that switch still restores the
 * ports that went with it.
 */
export function history_signature(wf: Workflow): string {
	const node_signature = (node: AnyNode): unknown => {
		const {
			data: _data,
			height: _height,
			endpoints: _endpoints,
			inputs: _inputs,
			outputs: _outputs,
			...rest
		} = node as OperatorNode;
		return rest;
	};
	return JSON.stringify({
		name: wf.name,
		description: wf.description,
		runtime: wf.runtime,
		view: wf.view,
		references: wf.references.map(node_signature),
		operators: wf.operators.map(node_signature),
		subjects: wf.subjects.map(node_signature),
		edges: wf.edges
	});
}

export function carry_live_values(
	snapshot: Workflow,
	current: Workflow
): Workflow {
	const live = new Map(allNodes(current).map((node) => [node.id, node]));
	const restore = <T extends AnyNode>(node: T): T => {
		const now = live.get(node.id);
		// A node that changed role had its data cleared and reseeded for the new
		// role (see `reconcileComponentRoles`), so the live value doesn't belong
		// on the snapshot's version of it.
		if (!now || now.role !== node.role) return node;
		const carried: T = { ...node, data: now.data };
		if ((now as OperatorNode).endpoints !== undefined) {
			(carried as OperatorNode).endpoints = (now as OperatorNode).endpoints;
		}
		return carried;
	};
	return {
		...snapshot,
		references: snapshot.references.map((n) => restore<ReferenceNode>(n)),
		operators: snapshot.operators.map((n) => restore<OperatorNode>(n)),
		subjects: snapshot.subjects.map((n) => restore<SubjectNode>(n))
	};
}

export interface WorkflowHistory {
	/** Adopt `wf` as the baseline and drop both stacks (used on load). */
	reset(wf: Workflow): void;
	/** Note the workflow's current state, opening a new entry if it differs. */
	record(wf: Workflow): void;
	/**
	 * Take fresher values for the state already being tracked, without opening an
	 * entry. Call it on every store write: `record` is debounced so a burst of
	 * edits collapses into one step, but the entry that burst eventually files is
	 * built from the *last state seen*, and a node deleted mid-burst exists
	 * nowhere else. Without this, deleting a card within the debounce window
	 * would file the state from before the last keystroke and undo would bring
	 * the card back empty.
	 */
	refresh(wf: Workflow): void;
	/** The workflow to apply, or `null` when there is nothing to go back to. */
	undo(current: Workflow): Workflow | null;
	redo(current: Workflow): Workflow | null;
	can_undo(): boolean;
	can_redo(): boolean;
}

/**
 * A workflow as it goes onto the stacks, with session-bound media dropped from
 * node `data` and everything else kept.
 *
 * A snapshot's `data` is only ever read for nodes it is *bringing back* —
 * `carry_live_values` takes the live values for every node that still exists —
 * but that case is exactly a deleted node returning on Cmd+Z, or a node the
 * user added coming back on redo. Both have to arrive with the prompt that was
 * typed into them, so text, numbers and server-served file paths ride along.
 *
 * blob: and data: URLs do not: `removeNode` revokes the blob before the entry is
 * filed, so restoring one would show a broken image rather than the output, and
 * keeping base64 payloads would let a hundred entries pin a hundred copies of
 * every generated image in memory. That is the same test `sanitize_for_save`
 * applies, hence the shared helper.
 */
function snapshot(wf: Workflow): Workflow {
	const strip = <T extends AnyNode>(node: T): T => ({
		...node,
		data: strip_session_media(node.data)
	});
	return {
		...wf,
		references: wf.references.map((n) => strip<ReferenceNode>(n)),
		operators: wf.operators.map((n) => strip<OperatorNode>(n)),
		subjects: wf.subjects.map((n) => strip<SubjectNode>(n))
	};
}

export function create_history(limit: number = DEFAULT_LIMIT): WorkflowHistory {
	let past: Workflow[] = [];
	let future: Workflow[] = [];
	let present: Workflow | null = null;
	let present_signature = "";

	function adopt(wf: Workflow): void {
		present = wf;
		present_signature = history_signature(wf);
	}

	return {
		reset(wf) {
			past = [];
			future = [];
			adopt(wf);
		},
		record(wf) {
			if (present === null) {
				adopt(wf);
				return;
			}
			const signature = history_signature(wf);
			if (signature === present_signature) {
				// Same edit state, fresher values (a run finished, a card was
				// measured). Keep the newer object so a later undo carries it.
				present = wf;
				return;
			}
			past.push(snapshot(present));
			if (past.length > limit) past.shift();
			future = [];
			adopt(wf);
		},
		refresh(wf) {
			if (present === null) {
				adopt(wf);
				return;
			}
			if (history_signature(wf) === present_signature) present = wf;
		},
		undo(current) {
			const previous = past.pop();
			if (!previous) return null;
			future.push(snapshot(current));
			const restored = carry_live_values(previous, current);
			adopt(restored);
			return restored;
		},
		redo(current) {
			const next = future.pop();
			if (!next) return null;
			past.push(snapshot(current));
			const restored = carry_live_values(next, current);
			adopt(restored);
			return restored;
		},
		can_undo: () => past.length > 0,
		can_redo: () => future.length > 0
	};
}
