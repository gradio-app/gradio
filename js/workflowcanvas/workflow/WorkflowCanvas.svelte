<script lang="ts">
	import { setContext } from "svelte";
	import { fade } from "svelte/transition";

	import WorkflowNodeSF from "./WorkflowNodeSF.svelte";
	import WorkflowBottomBar from "./WorkflowBottomBar.svelte";
	import type { BoundFnTemplate } from "./WorkflowBottomBar.svelte";
	import NodeModelPicker from "./NodeModelPicker.svelte";
	import WorkflowEmptyState from "./WorkflowEmptyState.svelte";
	import WorkflowApiPanel from "./WorkflowApiPanel.svelte";
	import CheckIcon from "./icons/CheckIcon.svelte";
	import LayoutIcon from "./icons/LayoutIcon.svelte";
	import InfoIcon from "./icons/InfoIcon.svelte";
	import CodeIcon from "./icons/CodeIcon.svelte";

	import {
		MODALITIES,
		DATASET_MODALITY,
		ALL_MODALITY,
		portMeta,
		modalityForPort
	} from "./workflow-modalities";
	import type { ModalityConfig } from "./workflow-modalities";
	import { fetchSpaceApi } from "./space-api";
	import { fetchModelEndpoints, PIPELINE_TAG_TO_ENDPOINT } from "./model-api";
	import {
		workflow,
		addNode,
		moveNode,
		addEdge,
		removeEdge,
		updateNodeData,
		removeNode,
		replaceNodeSource,
		switch_endpoint,
		hydrate_endpoints,
		init_model_node_ports,
		sanitize_for_save,
		revoke_blob_urls
	} from "./workflow-store";
	import {
		hasMissingNodeGeometry,
		migrateToV2,
		toLegacyShape
	} from "./workflow-migration";
	import { PORT_COLOR, ports_compatible } from "./workflow-types";
	import type {
		PortType,
		Port,
		WFNode,
		WFEdge,
		NodeStatus,
		NodeRole,
		NodeDataValue,
		Workflow
	} from "./workflow-types";
	import { executeWorkflow } from "./workflow-executor";
	import { stream_text_generation } from "./inference-stream";
	import {
		findFreeSpot as findFreeSpotImpl,
		countSubgraphs,
		topoSort,
		resolveCurrentInputs as resolveCurrentInputsImpl,
		computeStaleNodes,
		buildUpstreamSubgraph as buildUpstreamSubgraphImpl
	} from "./workflow-graph";
	import { LIBRARY, getComponentForPortType } from "./node-library";
	import { createHFAuth } from "./hf-auth.svelte";
	import { load_viewport, save_viewport } from "./viewport-persistence";

	/**
	 * A node template's role for the v2 store. v1-style templates from LIBRARY/
	 * picker use `kind: "component" | "transform"` — map them to v2 roles here.
	 * Subjects aren't auto-created by templates today; they're created when an
	 * edge wires into a reference (future enhancement). For now, components default
	 * to reference.
	 */
	function templateRole(template: any): NodeRole {
		if (template?.role) return template.role;
		if (template?.kind === "transform") return "operator";
		return "reference";
	}

	let {
		server = {},
		initialValue = null,
		gradio_shared = undefined
	}: {
		server?: Record<string, any>;
		initialValue?: string | null;
		gradio_shared?: Record<string, any> | undefined;
	} = $props();

	const gradio_client = $derived(gradio_shared?.client);

	const auth = createHFAuth(() => server);

	// Sessions without the write token (share-link visitors, tunnelled
	// requests) get a view-only canvas: they can run the workflow and fill in
	// input values, but not change its structure or persist anything. The
	// server independently rejects unauthorized saves — this is UX, not the
	// security boundary. Stays editable until the server answers so the owner
	// doesn't see controls flash out and back in.
	const readOnly = $derived(auth.writeAccessKnown && !auth.canWrite);

	// Why this session can't edit — surfaced on the "Run only" badge (hover and
	// click). Differs by deployment: locally the fix is opening the write-token
	// edit link; on a Space it's signing in as an account that owns the Space —
	// unless the Space has no OAuth enabled, in which case no one can sign in to
	// edit and the developer must enable it.
	const readOnlyReason = $derived(
		auth.isHFSpace
			? auth.oauthAvailable
				? "Run-only: you can run this workflow but not edit it. Sign in with a Hugging Face account that owns this Space (or has write access to it) to make changes. Alternatively, duplicate this Space under your own account to edit your own copy."
				: "Run-only: editing is disabled because this Space doesn't have OAuth enabled, so the owner can't sign in to authenticate. To allow editing, add `hf_oauth: true` to the Space's README metadata and redeploy. Alternatively, duplicate this Space under your own account to edit your own copy."
			: "Run-only: you can run this workflow but not edit it. This session is missing the write token — open the edit link printed in the terminal to make changes. That link also signs this session in with your locally saved Hugging Face token; without it, paste an access token to run nodes."
	);

	// Flash a brief "Saved" confirmation after each successful autosave. The
	// timer is cleared on each new save so rapid edits coalesce into a single
	// lingering checkmark rather than flickering.
	let saveIndicator = $state(false);
	let saveIndicatorTimer: ReturnType<typeof setTimeout> | null = null;
	// Serialized form of what's currently persisted on the server. Autosave
	// compares against this so loading the workflow into the store on page load
	// (and any no-op change) doesn't trigger a redundant save + "Saved" flash.
	let lastSavedSerialized: string | null = null;
	function flashSaved(): void {
		saveIndicator = true;
		if (saveIndicatorTimer) clearTimeout(saveIndicatorTimer);
		saveIndicatorTimer = setTimeout(() => {
			saveIndicator = false;
		}, 1400);
	}

	$effect(() => {
		void auth.init();
	});

	$effect(() => {
		if (!initialValue) return;
		try {
			const parsed = JSON.parse(initialValue);
			const shouldAutoLayout = hasMissingNodeGeometry(parsed);
			// Migration handles both v1 (legacy workflow.json files) and v2.
			const v2 = migrateToV2(parsed);
			workflow.set(v2);
			// Baseline the persisted state so the load itself isn't autosaved.
			lastSavedSerialized = JSON.stringify(sanitize_for_save(v2));
			if (shouldAutoLayout) requestAnimationFrame(autoLayout);
		} catch {}
	});

	$effect(() => {
		const wf = $workflow;
		// Wait for the write-access answer before autosaving — the optimistic
		// editable window would otherwise fire saves the backend rejects.
		if (!server?.save_workflow || !auth.writeAccessKnown || !auth.canWrite)
			return;
		const serialized = JSON.stringify(sanitize_for_save(wf));
		if (lastSavedSerialized === null) {
			// No persisted baseline yet (e.g. a brand-new workflow with no saved
			// file): adopt the current state instead of saving it on load.
			lastSavedSerialized = serialized;
			return;
		}
		// Nothing changed since the last save/load — don't re-save or flash.
		if (serialized === lastSavedSerialized) return;
		const timer = setTimeout(() => {
			server
				.save_workflow([serialized])
				.then(() => {
					lastSavedSerialized = serialized;
					flashSaved();
				})
				.catch(() => {});
		}, 500);
		return () => clearTimeout(timer);
	});

	// Pull the bind=[…] list from the server once on mount so the
	// Functions button in the bottom bar can offer them as add-able
	// nodes. Silently no-op if the server doesn't expose it (older
	// gradio backends).
	$effect(() => {
		if (!server?.list_bound_fns) return;
		void server
			.list_bound_fns()
			.then((raw: string) => {
				try {
					const parsed = JSON.parse(raw);
					if (Array.isArray(parsed)) boundFns = parsed as BoundFnTemplate[];
				} catch {
					/* ignore malformed */
				}
			})
			.catch(() => {});
	});

	$effect(() => {
		if (!server?.get_model_endpoints) return;
		void fetchModelEndpoints(server).then((schemas) => {
			if (schemas.length)
				init_model_node_ports(schemas, PIPELINE_TAG_TO_ENDPOINT);
		});
	});

	$effect(() => {
		window.addEventListener("keydown", handleKeydown);
		window.addEventListener("keyup", handle_keyup);
		return () => {
			window.removeEventListener("keydown", handleKeydown);
			window.removeEventListener("keyup", handle_keyup);
		};
	});

	function handle_keyup(e: KeyboardEvent): void {
		if (e.code === "Space") spaceHeld = false;
	}

	// ─── Canvas state ───────────────────────────────────────────────────────────
	let viewport = $state(load_viewport($workflow.name));

	let lastViewportName = $state($workflow.name);
	$effect(() => {
		if ($workflow.name !== lastViewportName) {
			lastViewportName = $workflow.name;
			viewport = load_viewport($workflow.name);
		}
	});

	$effect(() => {
		const name = $workflow.name;
		const v = viewport;
		const timer = setTimeout(() => save_viewport(name, v), 250);
		return () => clearTimeout(timer);
	});

	// Pointer interaction state: track which kind of drag is happening so
	// pointermove/up know what to do. Mutually exclusive — at most one mode.
	type DragMode =
		| { kind: "pan"; startX: number; startY: number; vx: number; vy: number }
		| {
				kind: "node";
				nodeId: string;
				startClientX: number;
				startClientY: number;
				startNodeX: number;
				startNodeY: number;
				moved: boolean;
				groupStart: Map<string, { x: number; y: number }>;
		  }
		| {
				kind: "connection";
				fromNodeId: string;
				fromPortId: string;
				type: PortType;
				reversed: boolean;
				cursorCanvasX: number;
				cursorCanvasY: number;
				startCanvasX: number;
				startCanvasY: number;
		  }
		| {
				kind: "marquee";
				startCanvasX: number;
				startCanvasY: number;
				endCanvasX: number;
				endCanvasY: number;
				additive: boolean;
				moved: boolean;
		  };
	let dragMode = $state<DragMode | null>(null);
	let spaceHeld = $state(false);
	let last_node_drag_moved = false;

	// ─── App state ──────────────────────────────────────────────────────────────
	let canvasEl: HTMLDivElement;
	let rootEl: HTMLDivElement;
	let running = $state(false);
	let abortController: AbortController | null = null;
	let nodeStatus: Record<string, NodeStatus> = $state({});
	let nodeErrors: Record<string, string> = $state({});
	/**
	 * Wall-clock seconds of each node's last successful run, keyed by node id.
	 * Kept across runs (and on failure) so the previous time doubles as an ETA
	 * while the node re-runs; overwritten only when a run completes.
	 */
	let nodeDurations: Record<string, number> = $state({});
	const nodeRunStarts: Record<string, number> = {};
	/**
	 * Bound Python functions advertised by the server (`list_bound_fns`).
	 * Populates the bottom-bar Functions button so users can re-add an
	 * fn node after deleting it without re-launching the app.
	 */
	let boundFns = $state<BoundFnTemplate[]>([]);
	/**
	 * Snapshot of resolved inputs at the moment a node last completed. Used
	 * to flag nodes as stale when their current inputs differ from the
	 * snapshot — i.e. an upstream value changed but this node hasn't been
	 * re-run yet. Pattern lifted from gradio-app/daggr.
	 */
	let nodeInputSnapshots: Record<string, string> = $state({});
	let editingName = $state(false);
	let selectedNodeIds = $state<Set<string>>(new Set());
	let selectedEdgeIds = $state<Set<string>>(new Set());
	const selectedNodeId = $derived(
		selectedNodeIds.size === 1
			? (selectedNodeIds.values().next().value ?? null)
			: null
	);
	let showShortcuts = $state(false);
	let showUserMenu = $state(false);
	let showApiPanel = $state(false);
	// Popover shown when the "Run only" badge is clicked, explaining why editing
	// is disabled and how to enable it.
	let showAccessInfo = $state(false);
	let nameInput: HTMLInputElement = $state()!;

	// Human-readable explanation of how the current user is authenticated,
	// shown in the popover when they click their avatar. The "local" case also
	// tells them logout happens from the CLI, since the UI can't clear a token
	// it never stored (it's the host's `huggingface-cli login` token).
	const authExplanation = $derived.by(() => {
		if (auth.source === "local")
			return "Signed in with the Hugging Face token saved on this machine (via `huggingface-cli login`). To sign out, run `huggingface-cli logout` in your terminal.";
		if (auth.source === "oauth")
			return "Signed in with your Hugging Face account.";
		if (auth.source === "pat")
			return "Signed in with a Hugging Face token you provided.";
		return "";
	});

	type Pending = {
		from_node_id: string;
		from_port_id: string;
		type: PortType;
		reversed?: boolean;
	};
	let activeConnection: Pending | null = $state(null);

	interface WfToast {
		id: number;
		message: string;
		type: "info" | "warning" | "error" | "success" | "pro";
		action?: { label: string; href?: string; onClick?: () => void };
	}
	let toasts: WfToast[] = $state([]);
	let toastCounter = 0;

	function showToast(
		msg: string,
		ms = 3000,
		type: "info" | "warning" | "error" | "success" | "pro" = "info",
		action?: WfToast["action"]
	): void {
		const id = ++toastCounter;
		toasts = [...toasts, { id, message: msg, type, action }].slice(-3);
		if (ms > 0) setTimeout(() => dismissToast(id), ms);
	}

	function dismissToast(id: number): void {
		toasts = toasts.filter((t) => t.id !== id);
	}

	// v1 shape for read paths; writes go through v2 store actions.
	const legacyView = $derived(toLegacyShape($workflow));

	const gridTile = $derived.by(() => {
		let tile = 22 * viewport.zoom;
		while (tile < 16) tile *= 2;
		return tile;
	});

	const nodeCount = $derived(legacyView.nodes.length);
	const hasTransforms = $derived($workflow.operators.length > 0);
	const edgeCount = $derived($workflow.edges.length);
	const subgraphCount = $derived(
		countSubgraphs(legacyView.nodes, $workflow.edges)
	);

	const connectedPortsSet = $derived(() => {
		const set = new Set<string>();
		for (const e of $workflow.edges) {
			set.add(`${e.from_node_id}:${e.from_port_id}:output`);
			set.add(`${e.to_node_id}:${e.to_port_id}:input`);
		}
		return set;
	});

	interface ActivePicker {
		mode: "create" | "update";
		modality: ModalityConfig;
		nodeId?: string;
		anchorX?: number;
		anchorY?: number;
		initialSubtab?: string;
	}
	let activePicker: ActivePicker | null = $state(null);

	interface PendingDrop {
		from_node_id: string;
		from_port_id: string;
		type: PortType;
		x: number;
		y: number;
		reversed?: boolean;
		positionOnly?: boolean;
	}
	let pendingDrop: PendingDrop | null = $state(null);

	interface DropOption {
		kind: "model" | "component";
		label: string;
		subtab?: string;
	}
	interface DropChoice {
		clientX: number;
		clientY: number;
		modelOptions: DropOption[];
		componentOptions: DropOption[];
		/** true → user dragged from an input port (needs a Source);
		 *  false → user dragged from an output port (needs an Output sink). */
		reversed: boolean;
	}
	let dropChoice: DropChoice | null = $state(null);

	interface DoubleClickMenu {
		clientX: number;
		clientY: number;
		canvasX: number;
		canvasY: number;
	}
	let doubleClickMenu: DoubleClickMenu | null = $state(null);

	function inputOutputLabel(type: PortType, reversed: boolean): string {
		const base = portMeta(type)?.label ?? "File";
		// When dragging from an input (reversed), media types want an "Upload"
		// affordance; scalar types reuse their own label as the source widget.
		if (reversed) {
			const scalar =
				type === "text" ||
				type === "number" ||
				type === "json" ||
				type === "boolean";
			return scalar ? base : "Upload";
		}
		return base;
	}

	// ─── Context for node components ────────────────────────────────────────────
	const wfCtx = $state({
		pending: null as Pending | null,
		nodeStatus: {} as Record<string, NodeStatus>,
		nodeErrors: {} as Record<string, string>,
		nodeDurations: {} as Record<string, number>,
		staleNodes: new Set<string>(),
		connectedPorts: new Set<string>(),
		readOnly: false,
		ondatachange: updateNodeData,
		onremove: (id: string) => {
			if (!readOnly) removeNode(id);
		},
		onopenpicker: (id: string) => {
			if (!readOnly) openPickerForNode(id);
		},
		onswitchendpoint: (id: string, endpointName: string) => {
			if (!readOnly) switch_endpoint(id, endpointName);
		},
		onhydratendpoints: async (id: string, spaceId: string) => {
			try {
				const info = await fetchSpaceApi(spaceId);
				if (!info.endpoints || info.endpoints.length === 0) {
					showToast(`${spaceId} has no usable endpoints`, 4000, "warning");
					return;
				}
				hydrate_endpoints(id, info.endpoints);
				if (info.endpoints.length === 1) {
					showToast(`${spaceId} only exposes one endpoint`, 3000);
				}
			} catch (err) {
				showToast(
					err instanceof Error ? err.message : "Failed to load endpoints",
					4000,
					"error"
				);
			}
		},
		onrunnode: (id: string) => void runNode(id),
		onselect: (id: string, additive = false) => selectNode(id, additive),
		onnodepointerdown: (e: PointerEvent, id: string) => startNodeDrag(e, id),
		onportpointerdown: (
			e: PointerEvent,
			nodeId: string,
			portId: string,
			type: PortType,
			isInput: boolean
		) => startConnection(e, nodeId, portId, type, isInput),
		onpopout: (
			nodeId: string,
			portId: string,
			type: PortType,
			isInput: boolean
		) => {
			if (readOnly) return;
			const node = legacyView.nodes.find((n) => n.id === nodeId);
			if (!node) return;
			const template = getComponentForPortType(type);
			if (!template) return;
			if (isInput) {
				const { x, y } = clampToViewport(
					node.x - 260,
					node.y,
					template.width,
					template.height
				);
				const newId = addNode("reference", template, x, y);
				const port = node.inputs.find((p) => p.id === portId);
				if (port?.default_value !== undefined) {
					const outId = template.outputs[0]?.id ?? "out";
					updateNodeData(newId, outId, port.default_value as NodeDataValue);
				}
				addEdge({
					from_node_id: newId,
					from_port_id: "out",
					to_node_id: nodeId,
					to_port_id: portId,
					type
				});
				updateNodeData(nodeId, portId, "");
			} else {
				const { x, y } = clampToViewport(
					node.x + node.width + 40,
					node.y,
					template.width,
					template.height
				);
				const newId = addNode("reference", template, x, y);
				addEdge({
					from_node_id: nodeId,
					from_port_id: portId,
					to_node_id: newId,
					to_port_id: "in",
					type
				});
			}
		}
	});
	setContext("wf", wfCtx);

	$effect(() => {
		wfCtx.pending = activeConnection;
	});
	$effect(() => {
		wfCtx.nodeStatus = nodeStatus;
	});
	$effect(() => {
		wfCtx.nodeErrors = nodeErrors;
	});
	$effect(() => {
		wfCtx.nodeDurations = nodeDurations;
	});
	$effect(() => {
		wfCtx.staleNodes = staleNodes;
	});
	$effect(() => {
		wfCtx.connectedPorts = connectedPortsSet();
	});
	$effect(() => {
		wfCtx.readOnly = readOnly;
	});

	// ─── Custom canvas event handlers ───────────────────────────────────────────

	function clientToCanvas(
		clientX: number,
		clientY: number
	): { x: number; y: number } {
		const r = canvasEl?.getBoundingClientRect();
		if (!r) return { x: 0, y: 0 };
		return {
			x: (clientX - r.left - viewport.x) / viewport.zoom,
			y: (clientY - r.top - viewport.y) / viewport.zoom
		};
	}

	function clampToViewport(
		x: number,
		y: number,
		w: number,
		h: number
	): { x: number; y: number } {
		if (!canvasEl) return { x, y };
		const r = canvasEl.getBoundingClientRect();
		const pad = 20;
		const minX = -viewport.x / viewport.zoom + pad;
		const maxX = (r.width - viewport.x) / viewport.zoom - w - pad;
		const minY = -viewport.y / viewport.zoom + pad;
		const maxY = (r.height - viewport.y) / viewport.zoom - h - pad;
		return {
			x: Math.max(minX, Math.min(maxX, x)),
			y: Math.max(minY, Math.min(maxY, y))
		};
	}

	function onCanvasPointerDown(e: PointerEvent): void {
		if (e.button !== 0 && e.button !== 1) return;
		const target = e.target as HTMLElement;
		if (
			target.closest(
				".node-pos-wrap, .edge-path, .picker-panel, .drop-menu, .add-node-menu, .bottom-bar, .zoom-controls, .toolbar"
			)
		) {
			return;
		}
		const pan_requested = e.button === 1 || spaceHeld;
		if (pan_requested) {
			dragMode = {
				kind: "pan",
				startX: e.clientX,
				startY: e.clientY,
				vx: viewport.x,
				vy: viewport.y
			};
			canvasEl.setPointerCapture(e.pointerId);
			return;
		}
		const { x, y } = clientToCanvas(e.clientX, e.clientY);
		dragMode = {
			kind: "marquee",
			startCanvasX: x,
			startCanvasY: y,
			endCanvasX: x,
			endCanvasY: y,
			additive: e.shiftKey,
			moved: false
		};
		canvasEl.setPointerCapture(e.pointerId);
	}

	function onWheel(e: WheelEvent): void {
		if (!canvasEl) return;
		if (e.target instanceof Element && e.target.closest(".nowheel")) return;
		e.preventDefault();
		if (e.ctrlKey || e.metaKey) {
			const r = canvasEl.getBoundingClientRect();
			const cx = e.clientX - r.left;
			const cy = e.clientY - r.top;
			const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
			const oldZoom = viewport.zoom;
			const newZoom = Math.max(0.15, Math.min(4, oldZoom * factor));
			viewport = {
				x: cx - (cx - viewport.x) * (newZoom / oldZoom),
				y: cy - (cy - viewport.y) * (newZoom / oldZoom),
				zoom: newZoom
			};
			return;
		}
		viewport = {
			...viewport,
			x: viewport.x - e.deltaX,
			y: viewport.y - e.deltaY
		};
	}

	function startNodeDrag(e: PointerEvent, nodeId: string): void {
		if (e.button !== 0 || readOnly) return;
		const node = legacyView.nodes.find((n) => n.id === nodeId);
		if (!node) return;
		e.stopPropagation();
		const drag_whole_group =
			selectedNodeIds.has(nodeId) && selectedNodeIds.size > 1;
		const groupStart = new Map<string, { x: number; y: number }>();
		if (drag_whole_group) {
			for (const n of legacyView.nodes) {
				if (selectedNodeIds.has(n.id)) {
					groupStart.set(n.id, { x: n.x, y: n.y });
				}
			}
		} else {
			groupStart.set(nodeId, { x: node.x, y: node.y });
		}
		dragMode = {
			kind: "node",
			nodeId,
			startClientX: e.clientX,
			startClientY: e.clientY,
			startNodeX: node.x,
			startNodeY: node.y,
			moved: false,
			groupStart
		};
		canvasEl?.setPointerCapture(e.pointerId);
	}

	function startConnection(
		e: PointerEvent,
		nodeId: string,
		portId: string,
		type: PortType,
		isInput: boolean
	): void {
		if (e.button !== 0 || readOnly) return;
		e.stopPropagation();
		const { x, y } = clientToCanvas(e.clientX, e.clientY);
		dragMode = {
			kind: "connection",
			fromNodeId: nodeId,
			fromPortId: portId,
			type,
			reversed: isInput,
			cursorCanvasX: x,
			cursorCanvasY: y,
			startCanvasX: x,
			startCanvasY: y
		};
		activeConnection = {
			from_node_id: nodeId,
			from_port_id: portId,
			type,
			reversed: isInput
		};
		canvasEl?.setPointerCapture(e.pointerId);
	}

	function onCanvasPointerMove(e: PointerEvent): void {
		if (!dragMode) return;
		if (dragMode.kind === "pan") {
			viewport = {
				...viewport,
				x: dragMode.vx + (e.clientX - dragMode.startX),
				y: dragMode.vy + (e.clientY - dragMode.startY)
			};
		} else if (dragMode.kind === "node") {
			const dx = (e.clientX - dragMode.startClientX) / viewport.zoom;
			const dy = (e.clientY - dragMode.startClientY) / viewport.zoom;
			if (Math.abs(dx) > 0 || Math.abs(dy) > 0) dragMode.moved = true;
			if (dragMode.groupStart.size > 1) {
				for (const [id, start] of dragMode.groupStart) {
					moveNode(id, start.x + dx, start.y + dy);
				}
			} else {
				moveNode(
					dragMode.nodeId,
					dragMode.startNodeX + dx,
					dragMode.startNodeY + dy
				);
			}
		} else if (dragMode.kind === "connection") {
			const { x, y } = clientToCanvas(e.clientX, e.clientY);
			dragMode = { ...dragMode, cursorCanvasX: x, cursorCanvasY: y };
		} else if (dragMode.kind === "marquee") {
			const { x, y } = clientToCanvas(e.clientX, e.clientY);
			const moved =
				dragMode.moved ||
				Math.abs(x - dragMode.startCanvasX) > 2 ||
				Math.abs(y - dragMode.startCanvasY) > 2;
			dragMode = { ...dragMode, endCanvasX: x, endCanvasY: y, moved };
		}
	}

	function onCanvasPointerUp(e: PointerEvent): void {
		if (!dragMode) return;
		const mode = dragMode;
		if (mode.kind === "marquee") {
			if (mode.moved) {
				const hit_nodes = nodes_in_rect(
					mode.startCanvasX,
					mode.startCanvasY,
					mode.endCanvasX,
					mode.endCanvasY
				);
				const hit_edges = edges_in_rect(
					mode.startCanvasX,
					mode.startCanvasY,
					mode.endCanvasX,
					mode.endCanvasY
				);
				if (mode.additive) {
					const next_nodes = new Set(selectedNodeIds);
					for (const id of hit_nodes) next_nodes.add(id);
					const next_edges = new Set(selectedEdgeIds);
					for (const id of hit_edges) next_edges.add(id);
					selectedNodeIds = next_nodes;
					selectedEdgeIds = next_edges;
				} else {
					selectedNodeIds = hit_nodes;
					selectedEdgeIds = hit_edges;
				}
			} else if (!mode.additive) {
				clear_selection();
			}
			dragMode = null;
			try {
				canvasEl?.releasePointerCapture(e.pointerId);
			} catch {}
			return;
		}
		if (mode.kind === "connection") {
			activeConnection = null;
			const dx =
				Math.abs(mode.cursorCanvasX - mode.startCanvasX) * viewport.zoom;
			const dy =
				Math.abs(mode.cursorCanvasY - mode.startCanvasY) * viewport.zoom;
			if (dx < 4 && dy < 4) {
				const direction = mode.reversed ? "input" : "output";
				const isConnected = connectedPortsSet().has(
					`${mode.fromNodeId}:${mode.fromPortId}:${direction}`
				);
				if (!isConnected) {
					const srcNode = legacyView.nodes.find(
						(n) => n.id === mode.fromNodeId
					);
					const template = getComponentForPortType(mode.type);
					if (srcNode && template) {
						if (mode.reversed) {
							const { x, y } = clampToViewport(
								srcNode.x - 260,
								srcNode.y,
								template.width,
								template.height
							);
							const newId = addNode("reference", template, x, y);
							addEdge({
								from_node_id: newId,
								from_port_id: "out",
								to_node_id: mode.fromNodeId,
								to_port_id: mode.fromPortId,
								type: mode.type
							});
							updateNodeData(mode.fromNodeId, mode.fromPortId, "");
						} else {
							const { x, y } = clampToViewport(
								srcNode.x + srcNode.width + 40,
								srcNode.y,
								template.width,
								template.height
							);
							const newId = addNode("reference", template, x, y);
							addEdge({
								from_node_id: mode.fromNodeId,
								from_port_id: mode.fromPortId,
								to_node_id: newId,
								to_port_id: "in",
								type: mode.type
							});
						}
					}
					dragMode = null;
					try {
						canvasEl?.releasePointerCapture(e.pointerId);
					} catch {}
					return;
				}
			}
			const targetEl = document.elementFromPoint(
				e.clientX,
				e.clientY
			) as HTMLElement | null;

			// 1. Precise hit on a port handle — use it directly.
			const portEl = targetEl?.closest("[data-port-id]") as HTMLElement | null;
			if (portEl) {
				const toNodeId = portEl.getAttribute("data-node-id");
				const toPortId = portEl.getAttribute("data-port-id");
				const toIsInput =
					portEl.getAttribute("data-port-direction") === "input";
				if (toNodeId && toPortId && toNodeId !== mode.fromNodeId) {
					tryCreateEdge(
						mode.fromNodeId,
						mode.fromPortId,
						mode.reversed,
						toNodeId,
						toPortId,
						toIsInput
					);
				}
				dragMode = null;
				try {
					canvasEl?.releasePointerCapture(e.pointerId);
				} catch {}
				return;
			}

			// 2. Fuzzy hit — dropped on a node body, not its port. Find the first
			// compatible free port on that node and use it. This is what users
			// usually mean: "connect to that node", not "to that 12px circle."
			const nodeWrap = targetEl?.closest(
				"[data-node-id]"
			) as HTMLElement | null;
			const droppedNodeId = nodeWrap?.getAttribute("data-node-id");
			if (droppedNodeId && droppedNodeId !== mode.fromNodeId) {
				const autoPort = pickCompatiblePort(
					droppedNodeId,
					mode.type,
					mode.reversed
				);
				if (autoPort) {
					tryCreateEdge(
						mode.fromNodeId,
						mode.fromPortId,
						mode.reversed,
						droppedNodeId,
						autoPort.id,
						autoPort.direction === "input"
					);
					dragMode = null;
					try {
						canvasEl?.releasePointerCapture(e.pointerId);
					} catch {}
					return;
				}
			}

			// 3. Empty drop — open the drop-choice menu so the user can spawn a new node.
			const r = canvasEl?.getBoundingClientRect();
			if (r) {
				const drop: PendingDrop = {
					from_node_id: mode.fromNodeId,
					from_port_id: mode.fromPortId,
					type: mode.type,
					x: mode.cursorCanvasX,
					y: mode.cursorCanvasY,
					reversed: mode.reversed
				};
				const srcPort = findSourcePort(
					mode.fromNodeId,
					mode.fromPortId,
					mode.reversed
				);
				const hasChoices = !!(srcPort?.choices && srcPort.choices.length > 0);
				const rootRect = rootEl?.getBoundingClientRect();
				const menuW = 220,
					menuH = 360;
				const rawX = rootRect ? e.clientX - rootRect.left : e.clientX - r.left;
				const rawY = rootRect ? e.clientY - rootRect.top : e.clientY - r.top;
				const containerW = rootRect ? rootRect.width : r.width;
				const containerH = rootRect ? rootRect.height : r.height;
				const choice: DropChoice = {
					clientX: Math.min(rawX, containerW - menuW - 8),
					clientY: Math.min(rawY, containerH - menuH - 8),
					modelOptions: hasChoices ? [] : buildModelOptions(mode.type),
					componentOptions: hasChoices
						? [{ kind: "component", label: srcPort!.label }]
						: buildComponentOptions(mode.type, mode.reversed),
					reversed: mode.reversed
				};
				setTimeout(() => {
					pendingDrop = drop;
					dropChoice = choice;
				}, 0);
			}
		}
		if (mode.kind === "node" && mode.moved) {
			last_node_drag_moved = true;
			setTimeout(() => (last_node_drag_moved = false), 0);
		}
		dragMode = null;
		try {
			canvasEl?.releasePointerCapture(e.pointerId);
		} catch {}
	}

	/**
	 * Choose the best port on `nodeId` for a connection of `type` whose source
	 * is reversed/forward. Forward = we're dragging an output, so we want an
	 * unconnected input on the target; reversed = we're dragging an input, so
	 * we want any output on the target. Returns null if nothing fits.
	 */
	function pickCompatiblePort(
		nodeId: string,
		type: PortType,
		reversed: boolean
	): { id: string; direction: "input" | "output" } | null {
		const target = legacyView.nodes.find((n) => n.id === nodeId);
		if (!target) return null;
		if (reversed) {
			const out = target.outputs.find((p) => ports_compatible(p.type, type));
			return out ? { id: out.id, direction: "output" } : null;
		}
		const inPort = target.inputs.find(
			(p) =>
				ports_compatible(type, p.type) &&
				!$workflow.edges.some(
					(e) => e.to_node_id === nodeId && e.to_port_id === p.id
				)
		);
		return inPort ? { id: inPort.id, direction: "input" } : null;
	}

	/**
	 * Cache of measured port-handle centers in canvas-space. Re-populated after
	 * any node change via the effect below; canvas coords are invariant to
	 * pan/zoom so we don't need to re-measure on viewport changes.
	 */
	let portPositions = $state(new Map<string, { x: number; y: number }>());

	function portKey(
		nodeId: string,
		portId: string,
		direction: "input" | "output"
	): string {
		return `${nodeId}:${portId}:${direction}`;
	}

	$effect(() => {
		legacyView.nodes;
		// Defer until after Svelte commits this render so the handle elements
		// have their final positions in the DOM.
		const raf = requestAnimationFrame(() => {
			if (!canvasEl) return;
			const cr = canvasEl.getBoundingClientRect();
			const next = new Map<string, { x: number; y: number }>();
			canvasEl.querySelectorAll<HTMLElement>("[data-port-id]").forEach((el) => {
				const nodeId = el.getAttribute("data-node-id");
				const portId = el.getAttribute("data-port-id");
				const dir = el.getAttribute("data-port-direction") as
					| "input"
					| "output"
					| null;
				if (!nodeId || !portId || !dir) return;
				const r = el.getBoundingClientRect();
				const cx = r.left + r.width / 2 - cr.left;
				const cy = r.top + r.height / 2 - cr.top;
				next.set(portKey(nodeId, portId, dir), {
					x: (cx - viewport.x) / viewport.zoom,
					y: (cy - viewport.y) / viewport.zoom
				});
			});
			portPositions = next;
		});
		return () => cancelAnimationFrame(raf);
	});

	/**
	 * Canvas-space position of a port handle. Uses the measured DOM position
	 * when available; falls back to a coarse estimate for the first paint
	 * before the measurement effect has run (handles are ~24px outside the
	 * node edge, so the heuristic offsets X by ±18 to hit the handle center).
	 */
	function portPos(
		nodeId: string,
		portId: string,
		direction: "input" | "output"
	): { x: number; y: number } | null {
		const measured = portPositions.get(portKey(nodeId, portId, direction));
		if (measured) return measured;
		const node = legacyView.nodes.find((n) => n.id === nodeId);
		if (!node) return null;
		const ports = direction === "input" ? node.inputs : node.outputs;
		const i = ports.findIndex((p) => p.id === portId);
		if (i < 0) return null;
		const headerHeight = 36;
		const rowHeight = 30;
		const y = node.y + headerHeight + i * rowHeight + rowHeight / 2;
		const x = direction === "input" ? node.x - 18 : node.x + node.width + 18;
		return { x, y };
	}

	function bezier(
		a: { x: number; y: number },
		b: { x: number; y: number }
	): string {
		const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
		return `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;
	}

	function edgePath(edge: WFEdge): string | null {
		const a = portPos(edge.from_node_id, edge.from_port_id, "output");
		const b = portPos(edge.to_node_id, edge.to_port_id, "input");
		if (!a || !b) return null;
		return bezier(a, b);
	}

	function connectionPreviewPath(
		mode: Extract<DragMode, { kind: "connection" }>
	): string | null {
		const port = portPos(
			mode.fromNodeId,
			mode.fromPortId,
			mode.reversed ? "input" : "output"
		);
		if (!port) return null;
		const cursor = { x: mode.cursorCanvasX, y: mode.cursorCanvasY };
		return mode.reversed ? bezier(cursor, port) : bezier(port, cursor);
	}

	function tryCreateEdge(
		fromId: string,
		fromPort: string,
		fromIsInput: boolean,
		toId: string,
		toPort: string,
		toIsInput: boolean
	): void {
		if (fromIsInput === toIsInput) return; // both ends same direction → invalid
		// Normalize: edges always flow output → input
		const [sourceId, sourcePort, targetId, targetPort] = fromIsInput
			? [toId, toPort, fromId, fromPort]
			: [fromId, fromPort, toId, toPort];
		const sourceNode = legacyView.nodes.find((n) => n.id === sourceId);
		const targetNode = legacyView.nodes.find((n) => n.id === targetId);
		if (!sourceNode || !targetNode) return;
		const outPort = sourceNode.outputs.find((p) => p.id === sourcePort);
		const inPort = targetNode.inputs.find((p) => p.id === targetPort);
		if (!outPort || !inPort || !ports_compatible(outPort.type, inPort.type))
			return;
		addEdge({
			from_node_id: sourceId,
			from_port_id: sourcePort,
			to_node_id: targetId,
			to_port_id: targetPort,
			type: outPort.type
		});
	}

	function findSourcePort(
		nodeId: string,
		portId: string,
		reversed: boolean
	): Port | undefined {
		const node = legacyView.nodes.find((n) => n.id === nodeId);
		return reversed
			? node?.inputs.find((p) => p.id === portId)
			: node?.outputs.find((p) => p.id === portId);
	}

	function buildModelOptions(type: PortType): DropOption[] {
		const modality = modalityForPort(type);
		if (!modality) return [];
		return modality.subtabs
			.filter((st) => st.key !== "all")
			.map((st) => ({
				kind: "model" as const,
				label: st.label,
				subtab: st.key
			}));
	}

	function buildComponentOptions(
		type: PortType,
		reversed: boolean
	): DropOption[] {
		return [
			{ kind: "component" as const, label: inputOutputLabel(type, reversed) }
		];
	}

	function handleDropChoiceModel(subtab?: string): void {
		dropChoice = null;
		if (!pendingDrop) return;
		const modality = modalityForPort(pendingDrop.type);
		if (!modality) return;
		activePicker = { mode: "create", modality, initialSubtab: subtab };
	}

	function handleDropChoiceUpload(): void {
		dropChoice = null;
		const drop = pendingDrop;
		pendingDrop = null;
		if (!drop) return;
		const typedComponents: Record<string, any> = {};
		for (const c of LIBRARY.components) {
			typedComponents[c.outputs[0]?.type ?? "any"] = c;
		}
		const base = typedComponents[drop.type] ?? LIBRARY.components[0];
		const sourcePort = findSourcePort(
			drop.from_node_id,
			drop.from_port_id,
			drop.reversed ?? false
		);
		const choiceInfo =
			sourcePort?.choices && sourcePort.choices.length > 0
				? {
						choices: sourcePort.choices,
						multiselect: !!sourcePort.multiselect
					}
				: null;
		const template = choiceInfo
			? {
					...base,
					label: sourcePort?.label || base.label,
					inputs: base.inputs.map((p: Port) => ({ ...p, ...choiceInfo })),
					outputs: base.outputs.map((p: Port) => ({ ...p, ...choiceInfo }))
				}
			: base;
		const rawX = drop.reversed
			? drop.x - (template.width ?? 200) - 80
			: drop.x - (template.width ?? 200) / 2;
		const { x, y } = findFreeSpot(rawX, drop.y - 45);
		// reversed=true → user dragged from an input port; they need a Source
		// (reference) supplying that value. reversed=false → user dragged from
		// an output port; they need a Sink (subject) displaying that value.
		const role: "reference" | "subject" = drop.reversed
			? "reference"
			: "subject";
		const newId = addNode(role, template, x, y);
		const newNode = legacyView.nodes.find((n) => n.id === newId);
		if (drop.reversed) {
			const outputPort = newNode?.outputs.find((p: any) =>
				ports_compatible(p.type, drop.type)
			);
			if (outputPort) {
				addEdge({
					from_node_id: newId,
					from_port_id: outputPort.id,
					to_node_id: drop.from_node_id,
					to_port_id: drop.from_port_id,
					type: drop.type
				});
			}
		} else {
			const inputPort = newNode?.inputs.find((p: any) =>
				ports_compatible(drop.type, p.type)
			);
			if (inputPort) {
				addEdge({
					from_node_id: drop.from_node_id,
					from_port_id: drop.from_port_id,
					to_node_id: newId,
					to_port_id: inputPort.id,
					type: drop.type
				});
			}
		}
	}

	function handleCanvasDoubleClick(e: MouseEvent): void {
		if (readOnly) return;
		const target = e.target as HTMLElement;
		if (
			target.closest(".node-pos-wrap") ||
			target.closest(".drop-menu") ||
			target.closest(".picker-panel")
		)
			return;
		const r = canvasEl?.getBoundingClientRect();
		if (!r) return;
		setTimeout(() => {
			doubleClickMenu = {
				clientX: e.clientX - r.left,
				clientY: e.clientY - r.top,
				canvasX: (e.clientX - r.left - viewport.x) / viewport.zoom,
				canvasY: (e.clientY - r.top - viewport.y) / viewport.zoom
			};
		}, 0);
	}

	function handleDoubleClickInputNode(portType: PortType): void {
		if (!doubleClickMenu) return;
		const { canvasX, canvasY } = doubleClickMenu;
		doubleClickMenu = null;
		const typedComponents: Record<string, any> = {};
		for (const c of LIBRARY.components) {
			typedComponents[c.outputs[0]?.type ?? "any"] = c;
		}
		const template = typedComponents[portType] ?? LIBRARY.components[0];
		addNode(
			"reference",
			template,
			canvasX - (template.width ?? 200) / 2,
			canvasY - 45
		);
	}

	function handleDoubleClickUpload(): void {
		if (!doubleClickMenu) return;
		const { canvasX, canvasY } = doubleClickMenu;
		doubleClickMenu = null;

		// Attach the input to body briefly. Safari (and some popup
		// blockers) refuse to open the OS file-picker dialog when
		// `input.click()` is called on a detached element, even from
		// a real user gesture.
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "image/*,audio/*,video/*";
		input.style.display = "none";
		document.body.appendChild(input);
		const cleanup = (): void => {
			try {
				document.body.removeChild(input);
			} catch {
				/* noop */
			}
		};
		input.onchange = () => {
			const file = input.files?.[0];
			if (!file) {
				cleanup();
				return;
			}
			let portType: PortType = "file";
			if (file.type.startsWith("image/")) portType = "image";
			else if (file.type.startsWith("audio/")) portType = "audio";
			else if (file.type.startsWith("video/")) portType = "video";
			const typedComponents: Record<string, any> = {};
			for (const c of LIBRARY.components) {
				typedComponents[c.outputs[0]?.type ?? "any"] = c;
			}
			const template = typedComponents[portType] ?? LIBRARY.components[0];
			const { x: fx, y: fy } = findFreeSpot(
				canvasX - (template.width ?? 200) / 2,
				canvasY - 45
			);
			const newId = addNode("reference", template, fx, fy);
			const url = URL.createObjectURL(file);
			const portId = template.outputs[0]?.id;
			if (portId && newId) {
				updateNodeData(newId, portId, {
					url,
					path: file.name,
					name: file.name
				} as any);
			}
			cleanup();
		};
		// `cancel` fires when the user dismisses the dialog without picking.
		input.oncancel = cleanup;
		input.click();
	}

	function handleDoubleClickSpaceModel(modality: ModalityConfig): void {
		if (!doubleClickMenu) return;
		const { canvasX, canvasY } = doubleClickMenu;
		doubleClickMenu = null;
		pendingDrop = {
			from_node_id: "",
			from_port_id: "",
			type: "any" as PortType,
			x: canvasX,
			y: canvasY,
			positionOnly: true
		};
		activePicker = { mode: "create", modality };
	}

	// ─── Helpers ─────────────────────────────────────────────────────────────────

	function resolveCurrentInputs(node: WFNode): Record<string, unknown> {
		return resolveCurrentInputsImpl(node, legacyView.nodes, $workflow.edges);
	}

	const staleNodes = $derived(
		computeStaleNodes(
			legacyView.nodes,
			$workflow.edges,
			nodeStatus,
			nodeInputSnapshots
		)
	);

	function canvasCenter(): { x: number; y: number } {
		if (!canvasEl) return { x: 200, y: 200 };
		const r = canvasEl.getBoundingClientRect();
		return {
			x: (r.width / 2 - viewport.x) / viewport.zoom - 150,
			y: (r.height / 2 - viewport.y) / viewport.zoom - 60
		};
	}

	/**
	 * Walk diagonally from (x, y) in 28px steps until an open spot is found
	 * that doesn't visually overlap an existing node. Used by any code path
	 * that drops a fresh node at a fixed fallback position (canvas center,
	 * picker create, etc.) — without this, successive adds stack identically.
	 */
	function findFreeSpot(x: number, y: number): { x: number; y: number } {
		return findFreeSpotImpl(legacyView.nodes, x, y);
	}

	async function addTemplateToCanvas(
		template: any,
		x?: number,
		y?: number
	): Promise<string | null> {
		if (readOnly) return null;
		if (
			template.source === "space" &&
			template.space_id &&
			template.inputs.length === 0
		) {
			showToast(`Connecting to ${template.space_id}...`);
			try {
				const apiInfo = await fetchSpaceApi(template.space_id);
				template.inputs = apiInfo.inputs;
				template.outputs = apiInfo.outputs;
				template.endpoint = apiInfo.endpoint;
				template.width = apiInfo.width;
			} catch (err) {
				showToast(
					err instanceof Error ? err.message : "Failed to connect to Space",
					5000,
					"error"
				);
				return null;
			}
		}
		if (x === undefined || y === undefined) {
			const nodes = legacyView.nodes;
			x =
				nodes.length > 0
					? Math.max(...nodes.map((n) => n.x + n.width)) + 80
					: 200;
			y = nodes.length > 0 ? nodes[nodes.length - 1].y : 150;
		}
		return addNode(templateRole(template), template, x, y);
	}

	async function handleDrop(e: DragEvent): Promise<void> {
		e.preventDefault();
		if (readOnly) return;
		const raw = e.dataTransfer?.getData("node-template");
		if (!raw) return;
		const template = JSON.parse(raw);
		const r = canvasEl.getBoundingClientRect();
		const x = (e.clientX - r.left - viewport.x) / viewport.zoom - 100;
		const y = (e.clientY - r.top - viewport.y) / viewport.zoom - 45;
		await addTemplateToCanvas(template, x, y);
	}

	function revokeAllBlobUrls(nodes: WFNode[]): void {
		for (const node of nodes) revoke_blob_urls(node.data);
	}

	let clearConfirm = $state(false);

	function clearWorkflow(): void {
		if (legacyView.nodes.length === 0 || readOnly) return;
		clearConfirm = true;
	}

	function confirmClearWorkflow(): void {
		clearConfirm = false;
		if (readOnly) return;
		revokeAllBlobUrls(legacyView.nodes);
		workflow.set({
			schema_version: "2",
			name: $workflow.name,
			runtime: { default: "client" },
			references: [],
			operators: [],
			subjects: [],
			edges: [],
			view: { default: "canvas" }
		});
	}

	function autoLayout(): void {
		const sorted = topoSort(legacyView.nodes, $workflow.edges);
		const edges = $workflow.edges;
		const depth = new Map<string, number>();
		for (const node of sorted) {
			const maxParent = edges
				.filter((e) => e.to_node_id === node.id)
				.map((e) => depth.get(e.from_node_id) ?? 0)
				.reduce((max, d) => Math.max(max, d + 1), 0);
			depth.set(node.id, maxParent);
		}
		const columns = new Map<number, WFNode[]>();
		for (const node of sorted) {
			const d = depth.get(node.id) ?? 0;
			if (!columns.has(d)) columns.set(d, []);
			columns.get(d)!.push(node);
		}
		const gap = 30;
		const colGap = 80;
		// Auto-layout produces { id -> {x, y} }; apply to v2 arrays without
		// changing role membership.
		const positions = new Map<string, { x: number; y: number }>();
		let xOffset = 80;
		for (const [_, col] of [...columns.entries()].sort((a, b) => a[0] - b[0])) {
			let yOffset = 80;
			let maxWidth = 0;
			for (const node of col) {
				positions.set(node.id, { x: xOffset, y: yOffset });
				yOffset += node.height + gap;
				maxWidth = Math.max(maxWidth, node.width);
			}
			xOffset += maxWidth + colGap;
		}
		workflow.update((wf) => {
			const reposition = <T extends { id: string; x: number; y: number }>(
				n: T
			): T => {
				const p = positions.get(n.id);
				return p ? { ...n, x: p.x, y: p.y } : n;
			};
			return {
				...wf,
				references: wf.references.map(reposition),
				operators: wf.operators.map(reposition),
				subjects: wf.subjects.map(reposition)
			};
		});
	}

	async function runNode(targetId: string): Promise<void> {
		if (running) return;
		await runWorkflow(buildUpstreamSubgraphImpl($workflow, targetId));
	}

	async function runWorkflow(target?: Workflow): Promise<void> {
		if (running) return;
		running = true;
		const wfToRun = target ?? $workflow;
		// Clear status only for nodes we're about to run, so already-finished
		// nodes outside the target subgraph keep their snapshots + state.
		const runningIds = new Set([
			...wfToRun.references.map((n) => n.id),
			...wfToRun.operators.map((n) => n.id),
			...wfToRun.subjects.map((n) => n.id)
		]);
		nodeStatus = Object.fromEntries(
			Object.entries(nodeStatus).filter(([id]) => !runningIds.has(id))
		);
		nodeErrors = Object.fromEntries(
			Object.entries(nodeErrors).filter(([id]) => !runningIds.has(id))
		);
		abortController = new AbortController();

		if (
			legacyView.nodes.some((n) => n.source === "space" && n.space_id) &&
			!auth.token
		) {
			showToast(
				"Running as guest — GPU Spaces may hit quota limits. Sign in with HuggingFace for your own compute.",
				5000,
				"warning"
			);
		}

		const callSpaceWithToken = server?.call_space
			? async (spaceId: string, endpoint: string, argsJson: string) =>
					server.call_space([spaceId, endpoint, argsJson, auth.token])
			: undefined;

		const callModelWithToken = server?.call_model
			? async (
					modelId: string,
					pipelineTag: string,
					argsJson: string,
					provider?: string
				) =>
					server.call_model([
						modelId,
						pipelineTag,
						argsJson,
						auth.token,
						provider ?? ""
					])
			: undefined;

		const fetchDatasetWithToken = server?.fetch_dataset
			? async (
					datasetId: string,
					config: string,
					split: string,
					offset: string,
					length: string
				) =>
					server.fetch_dataset([
						datasetId,
						config,
						split,
						offset,
						length,
						auth.token
					])
			: undefined;

		const callFnWithToken = gradio_client
			? async (fnName: string, argsJson: string) => {
					const safeN = fnName.replace(/[^a-zA-Z0-9_-]/gu, "_");
					const job = gradio_client.submit(`/predict_fn_${safeN}`, [argsJson]);
					abortController?.signal.addEventListener(
						"abort",
						() => job.cancel(),
						{
							once: true
						}
					);
					for await (const msg of job) {
						if (msg.type === "data") {
							return (msg.data as unknown[])[0] as string;
						}
						if (msg.type === "status" && msg.stage === "error") {
							return JSON.stringify({
								error: msg.message ?? "Function call failed",
								error_type: "unknown",
								suggestion: ""
							});
						}
					}
					return JSON.stringify({
						error: "No data received from fn endpoint",
						error_type: "unknown",
						suggestion: ""
					});
				}
			: undefined;

		await executeWorkflow(
			wfToRun,
			(nodeId, status, error, errorType) => {
				nodeStatus = { ...nodeStatus, [nodeId]: status };
				if (status === "running") {
					nodeRunStarts[nodeId] = performance.now();
				} else if (nodeId in nodeRunStarts) {
					if (status === "done") {
						nodeDurations = {
							...nodeDurations,
							[nodeId]: (performance.now() - nodeRunStarts[nodeId]) / 1000
						};
					}
					delete nodeRunStarts[nodeId];
				}
				if (status === "done") {
					const node = legacyView.nodes.find((n) => n.id === nodeId);
					if (node) {
						nodeInputSnapshots = {
							...nodeInputSnapshots,
							[nodeId]: JSON.stringify(resolveCurrentInputs(node))
						};
					}
				}
				if (error) {
					const node = legacyView.nodes.find((n) => n.id === nodeId);
					const label =
						node?.label ?? node?.space_id ?? node?.model_id ?? "Node";
					if (errorType === "quota" || errorType === "gpu") {
						const headline =
							errorType === "quota"
								? "GPU quota exceeded"
								: "GPU unavailable — try again in a minute";
						nodeErrors = { ...nodeErrors, [nodeId]: headline };
						const cta = auth.getQuotaCTA();
						showToast(
							`${label}: ${headline}. ${cta.suffix}`,
							0,
							"pro",
							cta.action
						);
					} else {
						nodeErrors = { ...nodeErrors, [nodeId]: error };
						const brief = error.split("\n")[0];
						showToast(
							`${label}: ${brief.length > 120 ? brief.slice(0, 120) + "…" : brief}`,
							5000,
							"error"
						);
					}
				}
			},
			(nodeId, portId, value) => {
				updateNodeData(nodeId, portId, value);
			},
			abortController.signal,
			callSpaceWithToken,
			callModelWithToken,
			fetchDatasetWithToken,
			callFnWithToken,
			auth.token
				? (modelId, prompt, provider, signal, onChunk) =>
						stream_text_generation({
							modelId,
							prompt,
							provider,
							hfToken: auth.token,
							signal: signal ?? undefined,
							onChunk
						})
				: undefined
		);

		running = false;
		abortController = null;

		const hasErrors = Object.values(nodeStatus).some((s) => s === "error");
		showToast(
			hasErrors ? "Workflow finished with errors" : "Workflow complete",
			hasErrors ? 5000 : 3000,
			hasErrors ? "error" : "success"
		);

		setTimeout(() => {
			nodeStatus = Object.fromEntries(
				Object.entries(nodeStatus).filter(([_, s]) => s === "error")
			);
		}, 3000);
	}

	function stopWorkflow(): void {
		abortController?.abort();
		running = false;
		abortController = null;
		nodeStatus = Object.fromEntries(
			Object.entries(nodeStatus).map(([id, s]) => [
				id,
				s === "running" ? "idle" : s
			])
		);
		showToast("Stopped", 3000, "warning");
	}

	function handleGlobalClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		if (dropChoice && !target?.closest(".drop-menu")) {
			dropChoice = null;
			pendingDrop = null;
		}
		if (doubleClickMenu && !target?.closest(".add-node-menu")) {
			doubleClickMenu = null;
		}
		if (
			showShortcuts &&
			!target?.closest(".shortcuts-panel") &&
			!target?.closest(".zoom-controls")
		) {
			showShortcuts = false;
		}
		if (activePicker && !target?.closest(".picker-panel")) {
			activePicker = null;
		}
		if (showUserMenu && !target?.closest(".toolbar-user-wrap")) {
			showUserMenu = false;
		}
		if (showAccessInfo && !target?.closest(".access-info-wrap")) {
			showAccessInfo = false;
		}
	}

	function zoomToFit(): void {
		const nodes = legacyView.nodes;
		if (nodes.length === 0) {
			viewport = { x: 0, y: 0, zoom: 1 };
			return;
		}
		const padding = 60;
		const minX = Math.min(...nodes.map((n) => n.x));
		const minY = Math.min(...nodes.map((n) => n.y));
		const maxX = Math.max(...nodes.map((n) => n.x + n.width));
		const maxY = Math.max(...nodes.map((n) => n.y + n.height));
		const contentW = maxX - minX + padding * 2;
		const contentH = maxY - minY + padding * 2;
		if (!canvasEl) {
			viewport = { x: 0, y: 0, zoom: 1 };
			return;
		}
		const r = canvasEl.getBoundingClientRect();
		const newZoom = Math.min(
			Math.max(Math.min(r.width / contentW, r.height / contentH), 0.15),
			2
		);
		viewport = {
			x: (r.width - contentW * newZoom) / 2 - (minX - padding) * newZoom,
			y: (r.height - contentH * newZoom) / 2 - (minY - padding) * newZoom,
			zoom: newZoom
		};
	}

	function selectNode(id: string, additive = false): void {
		if (last_node_drag_moved) return;
		selectedNodeIds = additive
			? toggle_set(selectedNodeIds, id)
			: new Set([id]);
		selectedEdgeIds = new Set();
	}

	function clear_selection(): void {
		selectedNodeIds = new Set();
		selectedEdgeIds = new Set();
	}

	function toggle_set<T>(set: Set<T>, value: T): Set<T> {
		const next = new Set(set);
		if (next.has(value)) next.delete(value);
		else next.add(value);
		return next;
	}

	function rects_intersect(
		ax: number,
		ay: number,
		aw: number,
		ah: number,
		bx: number,
		by: number,
		bw: number,
		bh: number
	): boolean {
		return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
	}

	function nodes_in_rect(
		x1: number,
		y1: number,
		x2: number,
		y2: number
	): Set<string> {
		const rx = Math.min(x1, x2);
		const ry = Math.min(y1, y2);
		const rw = Math.abs(x2 - x1);
		const rh = Math.abs(y2 - y1);
		const out = new Set<string>();
		for (const n of legacyView.nodes) {
			if (rects_intersect(n.x, n.y, n.width, n.height, rx, ry, rw, rh)) {
				out.add(n.id);
			}
		}
		return out;
	}

	function edges_in_rect(
		x1: number,
		y1: number,
		x2: number,
		y2: number
	): Set<string> {
		const rx = Math.min(x1, x2);
		const ry = Math.min(y1, y2);
		const rw = Math.abs(x2 - x1);
		const rh = Math.abs(y2 - y1);
		const out = new Set<string>();
		const point_in = (px: number, py: number): boolean =>
			px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
		for (const e of $workflow.edges) {
			const a = portPos(e.from_node_id, e.from_port_id, "output");
			const b = portPos(e.to_node_id, e.to_port_id, "input");
			if (!a || !b) continue;
			const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5);
			const c1x = a.x + dx;
			const c1y = a.y;
			const c2x = b.x - dx;
			const c2y = b.y;
			let hit = false;
			for (let i = 0; i <= 12; i++) {
				const t = i / 12;
				const mt = 1 - t;
				const px =
					mt * mt * mt * a.x +
					3 * mt * mt * t * c1x +
					3 * mt * t * t * c2x +
					t * t * t * b.x;
				const py =
					mt * mt * mt * a.y +
					3 * mt * mt * t * c1y +
					3 * mt * t * t * c2y +
					t * t * t * b.y;
				if (point_in(px, py)) {
					hit = true;
					break;
				}
			}
			if (hit) out.add(e.id);
		}
		return out;
	}

	function duplicateNode(id: string): void {
		const node = legacyView.nodes.find((n) => n.id === id);
		if (!node) return;
		const { id: _, data: __, ...template } = node;
		const new_id = addNode(
			templateRole(template),
			template,
			node.x + 40,
			node.y + 40
		);
		selectedNodeIds = new Set([new_id]);
		selectedEdgeIds = new Set();
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (
			e.key === "Enter" &&
			(e.metaKey || e.ctrlKey) &&
			!running &&
			hasTransforms
		) {
			e.preventDefault();
			runWorkflow();
			return;
		}
		const tag = (e.target as HTMLElement)?.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
		if (e.code === "Space") {
			spaceHeld = true;
			e.preventDefault();
		}
		if (
			(e.key === "Delete" || e.key === "Backspace") &&
			!readOnly &&
			(selectedNodeIds.size > 0 || selectedEdgeIds.size > 0)
		) {
			e.preventDefault();
			const node_ids = [...selectedNodeIds];
			const edge_ids = [...selectedEdgeIds];
			selectedNodeIds = new Set();
			selectedEdgeIds = new Set();
			requestAnimationFrame(() => {
				for (const id of node_ids) removeNode(id);
				for (const id of edge_ids) removeEdge(id);
			});
		}
		if (e.key === "d" && (e.metaKey || e.ctrlKey) && selectedNodeId) {
			e.preventDefault();
			if (!readOnly) duplicateNode(selectedNodeId);
		}
		if (e.key === "f" && !e.metaKey && !e.ctrlKey) {
			e.preventDefault();
			zoomToFit();
		}
		if (
			e.key === "a" &&
			(e.metaKey || e.ctrlKey) &&
			legacyView.nodes.length > 0
		) {
			e.preventDefault();
			selectedNodeIds = new Set(legacyView.nodes.map((n) => n.id));
			selectedEdgeIds = new Set($workflow.edges.map((edge) => edge.id));
		}
		if (e.key === "0" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			viewport = { x: 0, y: 0, zoom: 1 };
		}
		if (e.key === "Escape") {
			clear_selection();
			activeConnection = null;
			activePicker = null;
			pendingDrop = null;
			dropChoice = null;
			doubleClickMenu = null;
			clearConfirm = false;
		}
		if (e.key === "Enter" && clearConfirm && !readOnly) {
			e.preventDefault();
			confirmClearWorkflow();
		}
	}

	function openPicker(modality: ModalityConfig): void {
		activePicker = { mode: "create", modality };
	}

	function openPickerForNode(nodeId: string): void {
		const node = legacyView.nodes.find((n) => n.id === nodeId);
		if (!node) return;

		// Components no longer open the picker — only transform nodes can have
		// their model/space swapped. Guard so any stale callers no-op cleanly.
		if (node.kind !== "transform") return;

		let modality: ModalityConfig;
		if (node.dataset_id) {
			modality = DATASET_MODALITY;
		} else {
			const cat = node.pipeline_tag
				? getModalityForPipelineTag(node.pipeline_tag)
				: "image";
			modality = MODALITIES.find((m) => m.category === cat) ?? MODALITIES[0];
		}

		let anchorX: number | undefined;
		let anchorY: number | undefined;
		if (canvasEl && rootEl) {
			const rootRect = rootEl.getBoundingClientRect();
			const canvasRect = canvasEl.getBoundingClientRect();
			const canvasOffsetX = canvasRect.left - rootRect.left;
			const canvasOffsetY = canvasRect.top - rootRect.top;
			const panelWidth = Math.min(940, rootRect.width - 8);
			const panelHeight = Math.min(720, rootRect.height - 160);
			const nodeRight =
				canvasOffsetX +
				node.x * viewport.zoom +
				viewport.x +
				node.width * viewport.zoom;
			const nodeLeft = canvasOffsetX + node.x * viewport.zoom + viewport.x;
			const nodeTop = canvasOffsetY + node.y * viewport.zoom + viewport.y;
			anchorX = nodeRight + 12;
			if (anchorX + panelWidth > rootRect.width - 4) {
				anchorX = nodeLeft - panelWidth - 12;
			}
			anchorX = Math.max(4, Math.min(anchorX, rootRect.width - panelWidth - 4));
			anchorY = Math.max(
				4,
				Math.min(nodeTop, rootRect.height - panelHeight - 8)
			);
		}

		activePicker = {
			mode: "update",
			modality,
			nodeId,
			anchorX,
			anchorY
		};
	}

	function getModalityForPipelineTag(tag: string): string {
		const map: Record<string, string> = {
			"text-to-image": "image",
			"image-to-image": "image",
			"text-to-audio": "audio",
			"text-to-speech": "audio",
			"automatic-speech-recognition": "audio",
			"text-to-video": "video",
			"image-to-video": "video",
			"text-to-3d": "3d",
			"image-to-3d": "3d",
			"text-generation": "text",
			summarization: "text",
			translation: "text"
		};
		return map[tag] ?? "image";
	}

	const SUBGRAPH_PORT_TYPES = new Set([
		"image",
		"audio",
		"video",
		"text",
		"file",
		"gallery",
		"boolean",
		"number"
	]);

	async function handlePickerCreate(template: any): Promise<void> {
		activePicker = null;
		const drop = pendingDrop;
		pendingDrop = null;
		let x: number, y: number;
		if (drop) {
			x = drop.reversed
				? drop.x - (template.width ?? 200) - 80
				: drop.x - (template.width ?? 200) / 2;
			y = drop.y - 60;
		} else {
			({ x, y } = findFreeSpot(canvasCenter().x, canvasCenter().y));
		}
		const newId = await addTemplateToCanvas({ ...template }, x, y);
		if (!newId) return;

		// For spaces added fresh to the canvas (not wired from an existing port),
		// auto-create input + output components to form a ready-to-run subgraph
		const isSpaceFresh =
			template.source === "space" && (!drop || drop.positionOnly);
		if (isSpaceFresh) {
			const spaceNode = legacyView.nodes.find((n) => n.id === newId);
			if (spaceNode) {
				const compGap = 24;
				const compH = 180;
				// Skip ports with `choices` — they render an inline dropdown in
				// the node body, so an auto-wired reference would be redundant
				// (and worse, the reference is a plain textbox).
				const typedInputs = spaceNode.inputs.filter(
					(p) =>
						SUBGRAPH_PORT_TYPES.has(p.type) &&
						!(p.choices && p.choices.length > 0)
				);
				const requiredInputs = typedInputs.filter((p) => p.required !== false);
				const inputPorts =
					requiredInputs.length > 0 ? requiredInputs : typedInputs;
				const outputPorts = spaceNode.outputs.filter((p) =>
					SUBGRAPH_PORT_TYPES.has(p.type)
				);

				const inTotal = inputPorts.length * (compH + compGap) - compGap;
				const inStartY = y + (spaceNode.height ?? 90) / 2 - inTotal / 2;
				inputPorts.forEach((port, i) => {
					const comp = getComponentForPortType(port.type);
					if (!comp) return;
					const { x: cx, y: cy } = findFreeSpot(
						x - 220 - 80,
						inStartY + i * (compH + compGap)
					);
					const cId = addNode("reference", comp, cx, cy);
					if (port.default_value !== undefined) {
						updateNodeData(
							cId,
							comp.outputs[0]?.id ?? "out",
							port.default_value as NodeDataValue
						);
					}
					addEdge({
						from_node_id: cId,
						from_port_id: "out",
						to_node_id: newId,
						to_port_id: port.id,
						type: port.type
					});
				});

				const outTotal = outputPorts.length * (compH + compGap) - compGap;
				const outStartY = y + (spaceNode.height ?? 90) / 2 - outTotal / 2;
				outputPorts.forEach((port, i) => {
					const comp = getComponentForPortType(port.type);
					if (!comp) return;
					const { x: cx, y: cy } = findFreeSpot(
						x + (spaceNode.width ?? 280) + 80,
						outStartY + i * (compH + compGap)
					);
					const cId = addNode("subject", comp, cx, cy);
					addEdge({
						from_node_id: newId,
						from_port_id: port.id,
						to_node_id: cId,
						to_port_id: "in",
						type: port.type
					});
				});
			}
			return;
		}

		// Wiring from an existing port drag
		if (drop && !drop.positionOnly) {
			const newNode = legacyView.nodes.find((n) => n.id === newId);
			if (drop.reversed) {
				const outputPort = newNode?.outputs.find((p: any) =>
					ports_compatible(p.type, drop.type)
				);
				if (outputPort) {
					addEdge({
						from_node_id: newId,
						from_port_id: outputPort.id,
						to_node_id: drop.from_node_id,
						to_port_id: drop.from_port_id,
						type: drop.type
					});
				}
			} else {
				const inputPort = newNode?.inputs.find((p: any) =>
					ports_compatible(drop.type, p.type)
				);
				if (inputPort) {
					addEdge({
						from_node_id: drop.from_node_id,
						from_port_id: drop.from_port_id,
						to_node_id: newId,
						to_port_id: inputPort.id,
						type: drop.type
					});
				}
			}
		}
	}

	function handlePickerUpdate(nodeId: string, template: any): void {
		if (!readOnly) replaceNodeSource(nodeId, template);
		activePicker = null;
	}

	function addInputNode(portType: string, cx?: number, cy?: number): void {
		if (readOnly) return;
		let pos: { x: number; y: number };
		if (cx !== undefined && cy !== undefined) {
			const r = canvasEl?.getBoundingClientRect();
			pos = r
				? {
						x: (cx - r.left - viewport.x) / viewport.zoom,
						y: (cy - r.top - viewport.y) / viewport.zoom
					}
				: canvasCenter();
		} else {
			pos = canvasCenter();
		}
		const typedComponents: Record<string, any> = {};
		for (const c of LIBRARY.components) {
			typedComponents[c.outputs[0]?.type ?? "any"] = c;
		}
		const template = typedComponents[portType] ?? LIBRARY.components[0];
		const half = (template.width ?? 200) / 2;
		const { x, y } = findFreeSpot(pos.x - half, pos.y - 45);
		addNode("reference", template, x, y);
	}

	/**
	 * Spawn a Python fn node from a server-advertised bound function.
	 * Wire-compatible with `_workflow_from_bind`: same id prefix, same
	 * port shape, so it merges cleanly with any auto-generated fn nodes
	 * already on the canvas.
	 */
	function addFnNode(tmpl: BoundFnTemplate): void {
		if (readOnly) return;
		const half = 110;
		const { x, y } = findFreeSpot(
			canvasCenter().x - half,
			canvasCenter().y - 45
		);
		const height =
			80 + Math.max(tmpl.inputs.length, tmpl.outputs.length, 1) * 36;
		addNode(
			"operator",
			{
				label: tmpl.label,
				kind: "fn",
				source: "fn",
				fn: tmpl.fn,
				inputs: tmpl.inputs,
				outputs: tmpl.outputs,
				width: 220,
				height
			},
			x,
			y
		);
	}

	function setName(value: string): void {
		if (!readOnly) workflow.update((wf) => ({ ...wf, name: value }));
		editingName = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="workflow-root" bind:this={rootEl} onclick={handleGlobalClick}>
	<div class="toolbar">
		<div class="toolbar-left">
			{#if readOnly}
				<span class="name-text name-readonly">{$workflow.name}</span>
			{:else if editingName}
				<input
					bind:this={nameInput}
					class="name-input"
					value={$workflow.name}
					onblur={(e) => setName(e.currentTarget.value)}
					onkeydown={(e) => {
						if (e.key === "Enter") setName(e.currentTarget.value);
						if (e.key === "Escape") editingName = false;
					}}
				/>
			{:else}
				<button
					class="name-btn"
					onclick={() => {
						editingName = true;
						requestAnimationFrame(() => nameInput?.focus());
					}}
				>
					<span class="name-text">{$workflow.name}</span>
					<span class="name-edit-icon">&#x270E;</span>
				</button>
			{/if}
			<span class="toolbar-stat"
				>{subgraphCount}
				{subgraphCount === 1 ? "subgraph" : "subgraphs"}</span
			>
			<button
				class="tool-btn api-btn"
				onclick={() => (showApiPanel = true)}
				title="View the API for this workflow"
			>
				<CodeIcon />
				View API
			</button>
			{#if saveIndicator}
				<span
					class="save-indicator"
					in:fade={{ duration: 120 }}
					out:fade={{ duration: 400 }}
				>
					<CheckIcon />
					Saved
				</span>
			{/if}
		</div>
		<div class="toolbar-right">
			{#if auth.status !== "checking"}
				{#if auth.user}
					<div class="toolbar-user-wrap">
						<button
							class="toolbar-user-chip"
							class:open={showUserMenu}
							onclick={(e) => {
								e.stopPropagation();
								showUserMenu = !showUserMenu;
							}}
							title="Account"
						>
							{#if auth.avatarUrl}
								<img
									class="toolbar-user-avatar"
									src={auth.avatarUrl}
									alt=""
									referrerpolicy="no-referrer"
								/>
							{:else}
								<span class="toolbar-user-avatar toolbar-user-avatar-fallback"
									>{auth.user.charAt(0).toUpperCase()}</span
								>
							{/if}
							<span class="toolbar-user-name">{auth.user}</span>
						</button>
						{#if showUserMenu}
							<div class="toolbar-user-menu">
								<div class="toolbar-user-menu-msg">{authExplanation}</div>
								{#if auth.source !== "local"}
									<button
										class="toolbar-user-menu-btn"
										onclick={() => {
											showUserMenu = false;
											auth.signOut();
										}}>Log out</button
									>
								{/if}
							</div>
						{/if}
					</div>
				{:else if auth.isHFSpace && auth.oauthAvailable}
					<button class="toolbar-login-btn" onclick={auth.signIn}
						>Sign in with 🤗</button
					>
				{:else}
					<form class="toolbar-token-form" onsubmit={(e) => e.preventDefault()}>
						<input
							class="toolbar-token-input"
							class:invalid={auth.status === "invalid"}
							type="password"
							placeholder="Paste HF token (hf_...)"
							value={auth.token}
							onchange={(e) => auth.setPAT(e.currentTarget.value)}
							title="HuggingFace token for GPU access"
						/>
						{#if auth.status === "validating"}
							<span class="toolbar-token-status validating">checking…</span>
						{:else if auth.status === "invalid"}
							<span class="toolbar-token-status invalid">invalid</span>
						{/if}
					</form>
				{/if}
			{/if}
			{#if !readOnly}
				<button class="tool-btn" onclick={clearWorkflow}>Clear</button>
				{#if auth.writeAccessKnown}
					<span
						class="access-badge access-write"
						title="You have write access — changes you make are saved automatically."
						>Write access</span
					>
				{/if}
			{:else}
				<div class="access-info-wrap">
					<button
						class="access-badge access-readonly"
						class:open={showAccessInfo}
						title={readOnlyReason}
						aria-label="Why is this read-only?"
						onclick={(e) => {
							e.stopPropagation();
							showAccessInfo = !showAccessInfo;
						}}
						>Run only<span class="access-info-icon"><InfoIcon /></span></button
					>
					{#if showAccessInfo}
						<div class="access-info-popover">
							{#if auth.isHFSpace}
								{readOnlyReason}
							{:else}
								<!-- Mirrors the local-session readOnlyReason string (used for the
								     hover title), with "access token" rendered as a link. -->
								Run-only: you can run this workflow but not edit it. This session
								is missing the write token — open the edit link printed in the terminal
								to make changes. That link also signs this session in with your locally
								saved Hugging Face token; without it, paste an
								<a
									href="https://huggingface.co/settings/tokens"
									target="_blank"
									rel="noopener noreferrer">access token</a
								> to run nodes.
							{/if}
						</div>
					{/if}
				</div>
			{/if}
		</div>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="editor"
		class:editor-panning={dragMode?.kind === "pan"}
		class:editor-pan-ready={spaceHeld && !dragMode}
		class:editor-marquee={dragMode?.kind === "marquee"}
		bind:this={canvasEl}
		ondragover={(e) => e.preventDefault()}
		ondrop={handleDrop}
		ondblclick={handleCanvasDoubleClick}
		onpointerdown={onCanvasPointerDown}
		onpointermove={onCanvasPointerMove}
		onpointerup={onCanvasPointerUp}
		onwheel={onWheel}
	>
		<!-- Dot grid background — fixed in screen space, parallax-free -->
		<div
			class="canvas-bg"
			style="background-position: {viewport.x}px {viewport.y}px; background-size: {gridTile}px {gridTile}px;"
		></div>

		<!-- Viewport: all nodes + edges live in here, sharing one transform -->
		<div
			class="canvas-viewport"
			style="transform: translate({viewport.x}px, {viewport.y}px) scale({viewport.zoom});"
		>
			<!-- Edges layer (SVG). overflow:visible so edges aren't clipped. -->
			<svg class="edges-layer" width="1" height="1" style="overflow: visible;">
				{#each legacyView.edges as edge (edge.id)}
					{@const path = edgePath(edge)}
					{#if path}
						<path
							class="edge-path"
							class:edge-selected={selectedEdgeIds.has(edge.id)}
							d={path}
							stroke={PORT_COLOR[edge.type] ?? "#6b6e78"}
							stroke-width={(selectedEdgeIds.has(edge.id) ? 3 : 2) /
								viewport.zoom}
							fill="none"
							onclick={(e) => {
								if (e.shiftKey)
									selectedEdgeIds = toggle_set(selectedEdgeIds, edge.id);
								else if (!readOnly) removeEdge(edge.id);
							}}
						/>
					{/if}
				{/each}
				{#if dragMode?.kind === "connection"}
					{@const preview = connectionPreviewPath(dragMode)}
					{#if preview}
						<path
							class="edge-preview"
							d={preview}
							stroke={PORT_COLOR[dragMode.type] ?? "#6b6e78"}
							stroke-width={2 / viewport.zoom}
							stroke-dasharray="6 4"
							fill="none"
						/>
					{/if}
				{/if}
			</svg>

			<!-- Nodes layer -->
			{#each legacyView.nodes as n (n.id)}
				<div
					class="node-pos-wrap"
					class:node-pos-selected={selectedNodeIds.has(n.id)}
					data-node-id={n.id}
					style="left: {n.x}px; top: {n.y}px; width: {n.width}px;"
					onpointerdown={(e) => startNodeDrag(e, n.id)}
				>
					<WorkflowNodeSF
						id={n.id}
						data={n}
						selected={selectedNodeIds.has(n.id)}
					/>
				</div>
			{/each}

			{#if dragMode?.kind === "marquee" && dragMode.moved}
				{@const mx = Math.min(dragMode.startCanvasX, dragMode.endCanvasX)}
				{@const my = Math.min(dragMode.startCanvasY, dragMode.endCanvasY)}
				{@const mw = Math.abs(dragMode.endCanvasX - dragMode.startCanvasX)}
				{@const mh = Math.abs(dragMode.endCanvasY - dragMode.startCanvasY)}
				<div
					class="marquee-rect"
					style="left: {mx}px; top: {my}px; width: {mw}px; height: {mh}px; border-width: {1 /
						viewport.zoom}px;"
				></div>
			{/if}
		</div>

		{#if nodeCount === 0}
			<WorkflowEmptyState />
		{/if}

		{#if running}
			<div class="run-overlay"></div>
		{/if}

		{#if dropChoice}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- Stop click + mousedown propagation: handleGlobalClick on
			     workflow-root closes activePicker when the click target is
			     outside .picker-panel. Without onclick stopPropagation, a
			     "Generate" click here would set activePicker and then have
			     the very same click bubble out and close it. -->
			<div
				class="drop-menu"
				style="left: {dropChoice.clientX}px; top: {dropChoice.clientY}px;"
				onmousedown={(e) => e.stopPropagation()}
				onclick={(e) => e.stopPropagation()}
				onwheel={(e) => e.stopPropagation()}
			>
				{#if dropChoice.componentOptions.length > 0}
					<div class="drop-section-label">
						{dropChoice.reversed ? "Sources" : "Outputs"}
					</div>
					{#each dropChoice.componentOptions as opt}
						<button class="drop-opt" onclick={handleDropChoiceUpload}
							>{opt.label}</button
						>
					{/each}
				{/if}
				{#if dropChoice.modelOptions.length > 0}
					<div class="drop-section-label">Models</div>
					{#each dropChoice.modelOptions as opt}
						<button
							class="drop-opt"
							onclick={() => handleDropChoiceModel(opt.subtab)}
							>{opt.label}</button
						>
					{/each}
				{/if}
			</div>
		{/if}

		{#if doubleClickMenu}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<!-- Stop click+mousedown so handleGlobalClick (on .workflow-root)
			     doesn't close the menu before the inner button fires.
			     Same bug we fixed on .drop-menu earlier. -->
			<div
				class="add-node-menu"
				style="left: {doubleClickMenu.clientX}px; top: {doubleClickMenu.clientY}px;"
				onmousedown={(e) => e.stopPropagation()}
				onclick={(e) => e.stopPropagation()}
			>
				<div class="add-node-section-label">Add</div>
				<div class="add-node-grid">
					<button class="add-node-type-btn" onclick={handleDoubleClickUpload}
						>Upload Media</button
					>
					<button
						class="add-node-type-btn"
						onclick={() => handleDoubleClickInputNode("text" as PortType)}
						>Text</button
					>
				</div>
				<div class="add-node-divider"></div>
				<div class="add-node-section-label">Space / Model</div>
				<div class="add-node-grid">
					{#each MODALITIES.filter( (m) => ["image", "audio", "video", "text", "3d"].includes(m.key) ) as m}
						<button
							class="add-node-type-btn"
							onclick={() => handleDoubleClickSpaceModel(m)}>{m.label}</button
						>
					{/each}
				</div>
			</div>
		{/if}

		<div class="zoom-controls">
			{#if !readOnly}
				<button
					class="zoom-ctrl-btn"
					onclick={autoLayout}
					title="Auto-arrange nodes"
					aria-label="Auto-arrange nodes"
				>
					<LayoutIcon />
				</button>
				<div class="zoom-ctrl-divider"></div>
			{/if}
			<button
				class="zoom-ctrl-btn"
				onclick={() => (showShortcuts = !showShortcuts)}
				title="Keyboard shortcuts">?</button
			>
			<button class="zoom-ctrl-btn" onclick={zoomToFit} title="Fit all (F)"
				>&#x2922;</button
			>
			<button
				class="zoom-ctrl-btn"
				onclick={() => {
					viewport = { ...viewport, zoom: Math.max(0.15, viewport.zoom / 1.2) };
				}}>−</button
			>
			<button
				class="zoom-btn"
				onclick={() => {
					viewport = { x: 0, y: 0, zoom: 1 };
				}}>{Math.round(viewport.zoom * 100)}%</button
			>
			<button
				class="zoom-ctrl-btn"
				onclick={() => {
					viewport = { ...viewport, zoom: Math.min(4, viewport.zoom * 1.2) };
				}}>+</button
			>
		</div>

		{#if showShortcuts}
			<div class="shortcuts-panel">
				<div class="shortcuts-title">Keyboard shortcuts</div>
				<div class="shortcut-row">
					<kbd>Cmd+Enter</kbd> <span>Run workflow</span>
				</div>
				<div class="shortcut-row">
					<kbd>Cmd+D</kbd> <span>Duplicate node</span>
				</div>
				<div class="shortcut-row"><kbd>F</kbd> <span>Zoom to fit</span></div>
				<div class="shortcut-row"><kbd>Cmd+0</kbd> <span>Reset zoom</span></div>
				<div class="shortcut-row">
					<kbd>Delete</kbd> <span>Remove selection</span>
				</div>
				<div class="shortcut-row">
					<kbd>Cmd+A</kbd> <span>Select all</span>
				</div>
				<div class="shortcut-row"><kbd>Escape</kbd> <span>Deselect</span></div>
				<div class="shortcut-row"><kbd>Scroll</kbd> <span>Pan</span></div>
				<div class="shortcut-row">
					<kbd>Cmd+Scroll</kbd> <span>Zoom</span>
				</div>
				<div class="shortcut-row">
					<kbd>Drag canvas</kbd> <span>Marquee select</span>
				</div>
				<div class="shortcut-row">
					<kbd>Shift+Drag</kbd> <span>Add to selection</span>
				</div>
				<div class="shortcut-row">
					<kbd>Space+Drag</kbd> <span>Pan</span>
				</div>
				<div class="shortcut-row">
					<kbd>Double-click</kbd> <span>Rename node</span>
				</div>
			</div>
		{/if}

		<WorkflowBottomBar
			{running}
			{hasTransforms}
			{boundFns}
			{server}
			{readOnly}
			activeModalityKey={activePicker?.modality.key ?? null}
			onopenpicker={openPicker}
			onaddinput={addInputNode}
			onaddfn={addFnNode}
			onrun={() => void runWorkflow()}
			onstop={stopWorkflow}
		/>

		{#if activePicker}
			<!-- Key on modality so swapping the bottom-bar modality button
			     while the picker is open re-mounts the component and
			     re-fetches Trending / New for the new modality. Without
			     this, NodeModelPicker just sees its `modality` prop change
			     and keeps stale activeSubtab + results. -->
			{#key activePicker.modality.key}
				<NodeModelPicker
					mode={activePicker.mode}
					modality={activePicker.modality}
					nodeId={activePicker.nodeId}
					initialSubtab={activePicker.initialSubtab}
					{server}
					anchorX={activePicker.anchorX}
					anchorY={activePicker.anchorY}
					oncreate={handlePickerCreate}
					onupdate={handlePickerUpdate}
					onclose={() => {
						activePicker = null;
					}}
					oncleared={() => {
						if (activePicker)
							activePicker = { ...activePicker, modality: ALL_MODALITY };
					}}
					onerror={(msg) => showToast(msg, 5000, "error")}
				/>
			{/key}
		{/if}
	</div>

	{#if toasts.length > 0}
		<div class="wf-toast-stack">
			{#each toasts as t (t.id)}
				<div class="wf-toast wf-toast-{t.type}">
					<span class="wf-toast-msg">{t.message}</span>
					{#if t.action?.href}
						<a
							class="wf-toast-action"
							href={t.action.href}
							target="_blank"
							rel="noopener noreferrer"
							onclick={() => dismissToast(t.id)}
						>
							{t.action.label}
						</a>
					{:else if t.action?.onClick}
						<button
							class="wf-toast-action"
							onclick={() => {
								t.action?.onClick?.();
								dismissToast(t.id);
							}}
						>
							{t.action.label}
						</button>
					{/if}
					<button
						class="wf-toast-close"
						aria-label="Dismiss"
						title="Dismiss"
						onclick={() => dismissToast(t.id)}
					>
						×
					</button>
				</div>
			{/each}
		</div>
	{/if}

	{#if clearConfirm}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="wf-modal-backdrop" onclick={() => (clearConfirm = false)}>
			<div
				class="wf-modal"
				role="dialog"
				aria-modal="true"
				aria-labelledby="wf-modal-title"
				onclick={(e) => e.stopPropagation()}
			>
				<div class="wf-modal-title" id="wf-modal-title">Clear workflow?</div>
				<div class="wf-modal-body">
					This will remove <strong>{nodeCount}</strong>
					{nodeCount === 1 ? "node" : "nodes"} and
					<strong>{edgeCount}</strong>
					{edgeCount === 1 ? "edge" : "edges"}. This can't be undone.
				</div>
				<div class="wf-modal-actions">
					<button class="wf-modal-btn" onclick={() => (clearConfirm = false)}
						>Cancel</button
					>
					<button
						class="wf-modal-btn wf-modal-btn-danger"
						onclick={confirmClearWorkflow}>Clear</button
					>
				</div>
			</div>
		</div>
	{/if}

	{#if showApiPanel}
		<WorkflowApiPanel
			{server}
			workflowName={$workflow.name}
			onClose={() => (showApiPanel = false)}
		/>
	{/if}
</div>

<style>
	@import "./WorkflowCanvas.css";

	/* ─── Custom canvas ─────────────────────────────────────────────────────── */
	.editor {
		cursor: default;
	}

	.editor.editor-pan-ready {
		cursor: grab;
	}

	.editor.editor-panning {
		cursor: grabbing;
	}

	.editor.editor-marquee {
		cursor: crosshair;
	}

	.canvas-bg {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(#2a2b36 1px, transparent 1px);
		background-repeat: repeat;
		pointer-events: none;
	}

	.canvas-viewport {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		width: 0;
		height: 0;
	}

	.edges-layer {
		position: absolute;
		top: 0;
		left: 0;
		overflow: visible;
		pointer-events: none;
	}

	.edges-layer .edge-path {
		cursor: pointer;
		pointer-events: stroke;
		transition: stroke-width 0.1s;
	}

	.edges-layer .edge-path:hover {
		stroke-width: 3 !important;
	}

	.edges-layer .edge-preview {
		pointer-events: none;
	}

	.node-pos-wrap {
		position: absolute;
		touch-action: none;
		z-index: 1;
	}

	.node-pos-wrap.node-pos-selected {
		z-index: 2;
	}

	.marquee-rect {
		position: absolute;
		border: 1px dashed #4f8cff;
		background: rgba(79, 140, 255, 0.08);
		pointer-events: none;
		z-index: 3;
	}

	.edges-layer .edge-path.edge-selected {
		filter: drop-shadow(0 0 4px #4f8cff);
	}

	:global(body:not(.dark)) .canvas-bg {
		background-image: radial-gradient(#d0d2dc 1px, transparent 1px);
	}

	/* ─── Light mode ─── */
	:global(body:not(.dark) .workflow-root) {
		background: #f8f9fb;
		border-color: #e2e4ea;
		color-scheme: light;
		box-shadow:
			0 0 0 1px rgba(0, 0, 0, 0.04),
			0 20px 60px rgba(0, 0, 0, 0.08);
	}

	:global(body:not(.dark) .toolbar) {
		background: #ffffff;
		border-bottom-color: #e2e4ea;
	}

	:global(body:not(.dark) .name-btn:hover) {
		background: #f0f1f5;
	}
	:global(body:not(.dark) .name-text) {
		color: #1a1b25;
	}
	:global(body:not(.dark) .name-edit-icon) {
		color: #b0b2bc;
	}
	:global(body:not(.dark) .name-input) {
		background: #ffffff;
		color: #1a1b25;
	}
	:global(body:not(.dark) .toolbar-stat) {
		color: #b0b2bc;
	}
	:global(body:not(.dark) .tool-btn) {
		border-color: #e2e4ea;
		color: #8b8d98;
	}
	:global(body:not(.dark) .tool-btn:hover) {
		background: #f0f1f5;
		color: #3e4050;
		border-color: #d0d2dc;
	}
	:global(body:not(.dark) .toolbar-login-btn) {
		border-color: #e2e4ea;
		color: #6b6e78;
	}
	:global(body:not(.dark) .toolbar-login-btn:hover) {
		background: #f0f1f5;
		color: #1a1b25;
		border-color: #d0d2dc;
	}
	:global(body:not(.dark) .toolbar-user-chip) {
		border-color: #e2e4ea;
		color: #3e4050;
	}
	:global(body:not(.dark) .toolbar-user-chip:hover),
	:global(body:not(.dark) .toolbar-user-chip.open) {
		background: #f0f1f5;
		color: #1a1b25;
		border-color: #d0d2dc;
	}
	:global(body:not(.dark) .toolbar-user-avatar) {
		background: #e2e4ea;
	}
	:global(body:not(.dark) .toolbar-user-avatar-fallback) {
		color: #6b6e78;
	}
	:global(body:not(.dark) .toolbar-user-menu) {
		background: #ffffff;
		border-color: #e2e4ea;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}
	:global(body:not(.dark) .toolbar-user-menu-msg) {
		color: #6b6e78;
	}
	:global(body:not(.dark) .toolbar-user-menu-btn) {
		border-color: #e2e4ea;
		color: #1a1b25;
	}
	:global(body:not(.dark) .toolbar-user-menu-btn:hover) {
		background: #f0f1f5;
		border-color: #d0d2dc;
	}
	:global(body:not(.dark) .toolbar-token-input) {
		background: #ffffff;
		color: #6b6e78;
		border-color: #e2e4ea;
	}
	:global(body:not(.dark) .toolbar-token-input::placeholder) {
		color: #c0c2cc;
	}
	:global(body:not(.dark) .toolbar-token-input:focus) {
		background: #ffffff;
		color: #3e4050;
	}
	:global(body:not(.dark) .toolbar-divider) {
		background: #e2e4ea;
	}
	:global(body:not(.dark) .access-badge.access-readonly) {
		color: #6b6e78;
		background: #f0f1f5;
		border-color: #e2e4ea;
	}
	:global(body:not(.dark) .access-badge.access-write) {
		color: #0f9d76;
		background: rgba(15, 157, 118, 0.08);
		border-color: rgba(15, 157, 118, 0.25);
	}
	:global(body:not(.dark) button.access-badge.access-readonly:hover),
	:global(body:not(.dark) button.access-badge.access-readonly.open) {
		color: #3e4050;
		border-color: #d0d2dc;
	}
	:global(body:not(.dark) .access-info-popover) {
		background: #ffffff;
		border-color: #e2e4ea;
		color: #6b6e78;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
	}
	:global(body:not(.dark) .save-indicator) {
		color: #0f9d76;
	}
	:global(body:not(.dark) .zoom-ctrl-divider) {
		background: #e2e4ea;
	}
	:global(body:not(.dark) .zoom-controls) {
		background: #ffffff;
		border-color: #e2e4ea;
	}
	:global(body:not(.dark) .zoom-ctrl-btn) {
		color: #9a9caa;
	}
	:global(body:not(.dark) .zoom-ctrl-btn:hover) {
		background: #f0f1f5;
		color: #3e4050;
	}
	:global(body:not(.dark) .zoom-btn) {
		background: #ffffff;
		border-color: #e2e4ea;
		color: #9a9caa;
	}
	:global(body:not(.dark) .zoom-btn:hover) {
		color: #3e4050;
		border-color: #d0d2dc;
	}
	:global(body:not(.dark) .shortcuts-panel) {
		background: #ffffff;
		border-color: #e2e4ea;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}
	:global(body:not(.dark) .shortcuts-title) {
		color: #6b6e78;
	}
	:global(body:not(.dark) .shortcut-row) {
		color: #9a9caa;
	}
	:global(body:not(.dark) .shortcut-row kbd) {
		background: #f0f1f5;
		color: #3e4050;
		border-color: #d0d2dc;
	}
	:global(body:not(.dark) .wf-toast) {
		background: #ffffff;
		color: #2a2b36;
		border-color: #e2e4ea;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
	}
</style>
