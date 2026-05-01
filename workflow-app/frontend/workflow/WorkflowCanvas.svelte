<script lang="ts">
	import WorkflowNode from "./WorkflowNode.svelte";
	import WorkflowEdges from "./WorkflowEdges.svelte";
	import WorkflowSidebar from "./WorkflowSidebar.svelte";
	import { fetchSpaceApi } from "./space-api";
	import {
		workflow,
		addNode,
		moveNode,
		addEdge,
		removeEdge,
		updateNodeData,
		removeNode,
	} from "./workflow-store";
	import { PORT_COLOR } from "./workflow-types";
	import type { PortType, WFNode, WFEdge, NodeStatus } from "./workflow-types";
	import { executeWorkflow } from "./workflow-executor";
	import { LIBRARY } from "./node-library";
	import { publishToHub } from "./workflow-to-space";
	import type { Workflow } from "./workflow-types";
	import { onMount } from "svelte";

	let { server = {} }: { server?: Record<string, any> } = $props();

	let isLoggedIn = $state(false);

	onMount(async () => {
		if (server?.get_token) {
			try {
				const token = await server.get_token();
				isLoggedIn = !!token;
			} catch { /* ignore */ }
		}
	});

	const TEMPLATES: { name: string; desc: string; build: () => Workflow }[] = [
		{
			name: "not-lain/background-removal",
			desc: "Image → background removal → clean image",
			build: () => ({
				version: "1",
				name: "not-lain/background-removal",
				nodes: [
					{
						id: "t1",
						kind: "input",
						label: "Image",
						source: "local",
						inputs: [],
						outputs: [{ id: "out", label: "Image", type: "image" }],
						x: 80,
						y: 120,
						width: 220,
						height: 160,
						data: {},
					},
					{
						id: "t2",
						kind: "transform",
						label: "Remove background",
						source: "space",
						space_id: "not-lain/background-removal",
						endpoint: "/image",
						inputs: [
							{ id: "in", label: "Image", type: "image", required: true },
						],
						outputs: [{ id: "out", label: "Image", type: "image" }],
						x: 420,
						y: 120,
						width: 200,
						height: 90,
						data: {},
					},
					{
						id: "t3",
						kind: "output",
						label: "Image",
						source: "local",
						inputs: [{ id: "in", label: "Image", type: "image" }],
						outputs: [{ id: "out", label: "Image", type: "image" }],
						x: 740,
						y: 120,
						width: 220,
						height: 160,
						data: {},
					},
				],
				edges: [
					{
						id: "e1",
						from_node_id: "t1",
						from_port_id: "out",
						to_node_id: "t2",
						to_port_id: "in",
						type: "image",
					},
					{
						id: "e2",
						from_node_id: "t2",
						from_port_id: "out",
						to_node_id: "t3",
						to_port_id: "in",
						type: "image",
					},
				],
			}),
		},
		{
			name: "black-forest-labs/FLUX.1-schnell",
			desc: "Prompt → FLUX → generated image",
			build: () => ({
				version: "1",
				name: "black-forest-labs/FLUX.1-schnell",
				nodes: [
					{
						id: "t1",
						kind: "input",
						label: "Textbox",
						source: "local",
						inputs: [],
						outputs: [{ id: "out", label: "Text", type: "text" }],
						x: 80,
						y: 120,
						width: 220,
						height: 160,
						data: {},
					},
					{
						id: "t2",
						kind: "transform",
						label: "Generate image",
						source: "space",
						space_id: "black-forest-labs/FLUX.1-schnell",
						inputs: [
							{ id: "in", label: "Prompt", type: "text", required: true },
						],
						outputs: [{ id: "out", label: "Image", type: "image" }],
						x: 420,
						y: 120,
						width: 200,
						height: 90,
						data: {},
					},
					{
						id: "t3",
						kind: "output",
						label: "Image",
						source: "local",
						inputs: [{ id: "in", label: "Image", type: "image" }],
						outputs: [{ id: "out", label: "Image", type: "image" }],
						x: 740,
						y: 120,
						width: 220,
						height: 160,
						data: {},
					},
				],
				edges: [
					{
						id: "e1",
						from_node_id: "t1",
						from_port_id: "out",
						to_node_id: "t2",
						to_port_id: "in",
						type: "text",
					},
					{
						id: "e2",
						from_node_id: "t2",
						from_port_id: "out",
						to_node_id: "t3",
						to_port_id: "in",
						type: "image",
					},
				],
			}),
		},
		{
			name: "hf-audio/whisper-large-v3-turbo",
			desc: "Audio → Whisper → transcript text",
			build: () => ({
				version: "1",
				name: "hf-audio/whisper-large-v3-turbo",
				nodes: [
					{
						id: "t1",
						kind: "input",
						label: "Audio",
						source: "local",
						inputs: [],
						outputs: [{ id: "out", label: "Audio", type: "audio" }],
						x: 80,
						y: 120,
						width: 220,
						height: 160,
						data: {},
					},
					{
						id: "t2",
						kind: "transform",
						label: "Transcribe",
						source: "space",
						space_id: "hf-audio/whisper-large-v3-turbo",
						inputs: [
							{ id: "in", label: "Audio", type: "audio", required: true },
						],
						outputs: [{ id: "out", label: "Text", type: "text" }],
						x: 420,
						y: 120,
						width: 200,
						height: 90,
						data: {},
					},
					{
						id: "t3",
						kind: "output",
						label: "Textbox",
						source: "local",
						inputs: [{ id: "in", label: "Text", type: "text" }],
						outputs: [{ id: "out", label: "Text", type: "text" }],
						x: 740,
						y: 120,
						width: 220,
						height: 160,
						data: {},
					},
				],
				edges: [
					{
						id: "e1",
						from_node_id: "t1",
						from_port_id: "out",
						to_node_id: "t2",
						to_port_id: "in",
						type: "audio",
					},
					{
						id: "e2",
						from_node_id: "t2",
						from_port_id: "out",
						to_node_id: "t3",
						to_port_id: "in",
						type: "text",
					},
				],
			}),
		},
		{
			name: "vikhyatk/moondream1",
			desc: "Image → caption → text description",
			build: () => ({
				version: "1",
				name: "vikhyatk/moondream1",
				nodes: [
					{
						id: "t1",
						kind: "input",
						label: "Image",
						source: "local",
						inputs: [],
						outputs: [{ id: "out", label: "Image", type: "image" }],
						x: 80,
						y: 120,
						width: 220,
						height: 160,
						data: {},
					},
					{
						id: "t2",
						kind: "transform",
						label: "Describe image",
						source: "space",
						space_id: "vikhyatk/moondream1",
						inputs: [
							{ id: "in", label: "Image", type: "image", required: true },
						],
						outputs: [{ id: "out", label: "Caption", type: "text" }],
						x: 420,
						y: 120,
						width: 200,
						height: 90,
						data: {},
					},
					{
						id: "t3",
						kind: "output",
						label: "Textbox",
						source: "local",
						inputs: [{ id: "in", label: "Text", type: "text" }],
						outputs: [{ id: "out", label: "Text", type: "text" }],
						x: 740,
						y: 120,
						width: 220,
						height: 160,
						data: {},
					},
				],
				edges: [
					{
						id: "e1",
						from_node_id: "t1",
						from_port_id: "out",
						to_node_id: "t2",
						to_port_id: "in",
						type: "image",
					},
					{
						id: "e2",
						from_node_id: "t2",
						from_port_id: "out",
						to_node_id: "t3",
						to_port_id: "in",
						type: "text",
					},
				],
			}),
		},
	];

	async function loadTemplate(t: (typeof TEMPLATES)[number]): Promise<void> {
		revokeAllBlobUrls($workflow.nodes);
		const wf = t.build();
		workflow.set(wf);
		resetView();
		showToast(`Loading "${t.name}"...`);

		// Fetch API info for any space nodes and update them in place
		const spaceNodes = wf.nodes.filter((n: any) => n.source === "space" && n.space_id);
		const updates = await Promise.allSettled(
			spaceNodes.map(async (node: any) => {
				const apiInfo = await fetchSpaceApi(node.space_id);
				return { nodeId: node.id, apiInfo };
			})
		);

		workflow.update((current) => ({
			...current,
			nodes: current.nodes.map((n) => {
				const update = updates.find(
					(u) => u.status === "fulfilled" && u.value.nodeId === n.id
				);
				if (update && update.status === "fulfilled") {
					const { apiInfo } = update.value;
					return { ...n, inputs: apiInfo.inputs, outputs: apiInfo.outputs, endpoint: apiInfo.endpoint, width: apiInfo.width };
				}
				return n;
			}),
			// Remap edges to use new port IDs
			edges: current.edges.map((e) => {
				const srcUpdate = updates.find(
					(u) => u.status === "fulfilled" && u.value.nodeId === e.from_node_id
				);
				const dstUpdate = updates.find(
					(u) => u.status === "fulfilled" && u.value.nodeId === e.to_node_id
				);
				let edge = { ...e };
				// Map old "out" port to first output, old "in" port to first input
				if (srcUpdate && srcUpdate.status === "fulfilled") {
					const firstOut = srcUpdate.value.apiInfo.outputs[0];
					if (firstOut && edge.from_port_id === "out") edge = { ...edge, from_port_id: firstOut.id };
				}
				if (dstUpdate && dstUpdate.status === "fulfilled") {
					const firstIn = dstUpdate.value.apiInfo.inputs[0];
					if (firstIn && edge.to_port_id === "in") edge = { ...edge, to_port_id: firstIn.id };
				}
				return edge;
			})
		}));

		const failures = updates.filter((u) => u.status === "rejected");
		if (failures.length > 0) {
			showToast("Some Spaces could not be reached", 5000, "warning");
		} else {
			showToast(`Loaded "${t.name}"`, 3000, "success");
		}
	}

	let canvasEl: HTMLDivElement;

	type Pending = {
		from_node_id: string;
		from_port_id: string;
		type: PortType;
		x: number;
		y: number;
	};
	let pending: Pending | null = $state(null);
	let mouseViewport = $state({ x: 0, y: 0 });
	let running = $state(false);
	let abortController: AbortController | null = null;
	let nodeStatus: Record<string, NodeStatus> = $state({});
	let nodeErrors: Record<string, string> = $state({});
	let editingName = $state(false);
	let selectedNodeId: string | null = $state(null);
	let showTemplates = $state(false);
	let showShortcuts = $state(false);
	let showDeploy = $state(false);
	let deployToken = $state("");
	let deployStatus = $state("");
	let deploying = $state(false);
	let deployUrl = $state("");
	interface WfToast {
		id: number;
		message: string;
		type: "info" | "warning" | "error" | "success";
	}

	let toasts: WfToast[] = $state([]);
	let toastCounter = 0;

	function showToast(msg: string, ms = 3000, type: "info" | "warning" | "error" | "success" = "info"): void {
		const id = ++toastCounter;
		toasts = [...toasts, { id, message: msg, type }].slice(-3);
		if (ms > 0) {
			setTimeout(() => {
				toasts = toasts.filter((t) => t.id !== id);
			}, ms);
		}
	}

	function dismissToast(id: number): void {
		toasts = toasts.filter((t) => t.id !== id);
	}

	// Pan & zoom
	let panX = $state(0);
	let panY = $state(0);
	let zoom = $state(1);
	let isPanning = $state(false);
	let panStart = { x: 0, y: 0, panX: 0, panY: 0 };
	let nameInput: HTMLInputElement;
	let nodeCount = $derived($workflow.nodes.length);
	let hasTransforms = $derived(
		$workflow.nodes.some((n) => n.kind === "transform"),
	);
	let edgeCount = $derived($workflow.edges.length);

	function toCanvas(e: MouseEvent): { x: number; y: number } {
		const r = canvasEl.getBoundingClientRect();
		return {
			x: (e.clientX - r.left - panX) / zoom,
			y: (e.clientY - r.top - panY) / zoom,
		};
	}

	function startConnection(
		from_node_id: string,
		from_port_id: string,
		type: PortType,
		e: MouseEvent,
	): void {
		pending = { from_node_id, from_port_id, type, ...toCanvas(e) };
	}

	function completeConnection(
		to_node_id: string,
		to_port_id: string,
		to_type: PortType,
	): void {
		if (!pending) return;
		if (!compatible(pending.type, to_type)) {
			pending = null;
			return;
		}
		addEdge({
			from_node_id: pending.from_node_id,
			from_port_id: pending.from_port_id,
			to_node_id,
			to_port_id,
			type: pending.type,
		});
		pending = null;

		// Flash the target port dot
		const dot = document.querySelector(
			`[data-port-id="${to_node_id}:${to_port_id}:input"]`,
		);
		if (dot) {
			dot.classList.add("port-snap");
			setTimeout(() => dot.classList.remove("port-snap"), 400);
		}
	}

	function compatible(a: PortType, b: PortType): boolean {
		return a === "any" || b === "any" || a === b;
	}

	async function addTemplateToCanvas(template: any, x?: number, y?: number): Promise<void> {
		// If this is a space node with no inputs/outputs, fetch API info first
		if (template.source === "space" && template.space_id && template.inputs.length === 0) {
			showToast(`Connecting to ${template.space_id}...`);
			try {
				const apiInfo = await fetchSpaceApi(template.space_id);
				template.inputs = apiInfo.inputs;
				template.outputs = apiInfo.outputs;
				template.endpoint = apiInfo.endpoint;
				template.width = apiInfo.width;
			} catch (err) {
				showToast(err instanceof Error ? err.message : "Failed to connect to Space", 5000, "error");
				return;
			}
		}

		// If no position given, place to the right of the rightmost node
		if (x === undefined || y === undefined) {
			const nodes = $workflow.nodes;
			x = nodes.length > 0 ? Math.max(...nodes.map((n) => n.x + n.width)) + 80 : 200;
			y = nodes.length > 0 ? nodes[nodes.length - 1].y : 150;
		}

		addNode(template, x, y);
	}

	async function handleDrop(e: DragEvent): Promise<void> {
		e.preventDefault();
		const raw = e.dataTransfer?.getData("node-template");
		if (!raw) return;
		const template = JSON.parse(raw);
		const r = canvasEl.getBoundingClientRect();
		const x = (e.clientX - r.left - panX) / zoom - 100;
		const y = (e.clientY - r.top - panY) / zoom - 45;
		await addTemplateToCanvas(template, x, y);
	}

	function revokeAllBlobUrls(nodes: WFNode[]): void {
		for (const node of nodes) {
			for (const v of Object.values(node.data ?? {})) {
				if (
					v &&
					typeof v === "object" &&
					"url" in v &&
					v.url?.startsWith("blob:")
				) {
					URL.revokeObjectURL(v.url);
				}
			}
		}
	}

	function clearWorkflow(): void {
		if ($workflow.nodes.length === 0) return;
		if (!confirm("Clear all nodes and edges?")) return;
		revokeAllBlobUrls($workflow.nodes);
		workflow.set({
			version: "1",
			name: $workflow.name,
			nodes: [],
			edges: [],
		});
	}

	function autoLayout(): void {
		const sorted = topoSort($workflow.nodes, $workflow.edges);
		const edges = $workflow.edges;

		// Group nodes into columns by dependency depth
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
		const updated: WFNode[] = [];
		let xOffset = 80;

		for (const [_, col] of [...columns.entries()].sort((a, b) => a[0] - b[0])) {
			let yOffset = 80;
			let maxWidth = 0;
			for (const node of col) {
				updated.push({ ...node, x: xOffset, y: yOffset });
				yOffset += node.height + gap;
				maxWidth = Math.max(maxWidth, node.width);
			}
			xOffset += maxWidth + colGap;
		}

		workflow.update((wf) => ({ ...wf, nodes: updated }));
	}

	function topoSort(nodes: WFNode[], edges: WFEdge[]): WFNode[] {
		const deg = new Map(nodes.map((n) => [n.id, 0]));
		for (const e of edges)
			deg.set(e.to_node_id, (deg.get(e.to_node_id) ?? 0) + 1);
		const q = nodes.filter((n) => deg.get(n.id) === 0);
		const out: WFNode[] = [];
		while (q.length) {
			const n = q.shift()!;
			out.push(n);
			for (const e of edges.filter((e) => e.from_node_id === n.id)) {
				const d = (deg.get(e.to_node_id) ?? 1) - 1;
				deg.set(e.to_node_id, d);
				if (d === 0) q.push(nodes.find((nd) => nd.id === e.to_node_id)!);
			}
		}
		return out;
	}

	async function runWorkflow(): Promise<void> {
		if (running) return;
		running = true;
		nodeStatus = {};
		nodeErrors = {};
		abortController = new AbortController();

		// Check login status — warn if running GPU spaces without a token
		const hasGpuSpaces = $workflow.nodes.some((n) => n.source === "space" && n.space_id);
		if (hasGpuSpaces && server?.get_token) {
			try {
				const token = await server.get_token();
				if (!token) {
					showToast("Running as guest — GPU Spaces may hit quota limits. Log in for your own compute.", 5000, "warning");
				}
			} catch { /* ignore */ }
		}

		await executeWorkflow(
			$workflow,
			(nodeId, status, error, errorType) => {
				nodeStatus = { ...nodeStatus, [nodeId]: status };
				if (error) {
					nodeErrors = { ...nodeErrors, [nodeId]: error };
					// Show contextual toast for errors
					const node = $workflow.nodes.find((n) => n.id === nodeId);
					const label = node?.label ?? node?.space_id ?? "Node";
					if (errorType === "quota" || errorType === "gpu") {
						showToast(`${label}: ${error}`, 0, "error"); // persistent
					} else {
						showToast(`${label}: ${error}`, 5000, "error");
					}
				}
			},
			(nodeId, portId, value) => {
				updateNodeData(nodeId, portId, value);
			},
			abortController.signal,
			server?.call_space
		);

		running = false;
		abortController = null;

		const hasErrors = Object.values(nodeStatus).some((s) => s === "error");
		if (hasErrors) {
			showToast("Workflow finished with errors", 5000, "error");
		} else {
			showToast("Workflow complete", 3000, "success");
		}

		// Clear done status after 3s so nodes go back to neutral
		setTimeout(() => {
			nodeStatus = Object.fromEntries(
				Object.entries(nodeStatus).filter(([_, s]) => s === "error"),
			);
		}, 3000);
	}

	function stopWorkflow(): void {
		abortController?.abort();
		running = false;
		abortController = null;
		// Mark any "running" nodes as idle
		nodeStatus = Object.fromEntries(
			Object.entries(nodeStatus).map(([id, s]) => [
				id,
				s === "running" ? "idle" : s,
			]),
		);
		showToast("Stopped", 3000, "warning");
	}

	function handleGlobalClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		if (showTemplates && !target?.closest(".toolbar-dropdown-wrap")) {
			showTemplates = false;
		}
		if (
			showShortcuts &&
			!target?.closest(".shortcuts-panel") &&
			!target?.closest(".zoom-controls")
		) {
			showShortcuts = false;
		}
	}

	function handleWheel(e: WheelEvent): void {
		e.preventDefault();
		const r = canvasEl.getBoundingClientRect();
		const mx = e.clientX - r.left;
		const my = e.clientY - r.top;

		const factor = 1 + Math.min(Math.abs(e.deltaY) * 0.001, 0.05);
		const delta = e.deltaY > 0 ? 1 / factor : factor;
		const newZoom = Math.min(Math.max(zoom * delta, 0.15), 4);
		const scale = newZoom / zoom;

		panX = mx - (mx - panX) * scale;
		panY = my - (my - panY) * scale;
		zoom = newZoom;
	}

	function handleCanvasMouseDown(e: MouseEvent): void {
		// Click on empty canvas — deselect and start panning
		if (e.button === 1 || (e.button === 0 && e.target === canvasEl)) {
			e.preventDefault();
			selectedNodeId = null;
			isPanning = true;
			panStart = { x: e.clientX, y: e.clientY, panX, panY };
		}
	}

	function handleCanvasMouseMove(e: MouseEvent): void {
		if (isPanning) {
			panX = panStart.panX + (e.clientX - panStart.x);
			panY = panStart.panY + (e.clientY - panStart.y);
		}
		if (pending) {
			pending = { ...pending, ...toCanvas(e) };
			const r = canvasEl.getBoundingClientRect();
			mouseViewport = { x: e.clientX - r.left, y: e.clientY - r.top };
		}
	}

	function handleCanvasMouseUp(e: MouseEvent): void {
		isPanning = false;
		pending = null;
	}

	function resetView(): void {
		panX = 0;
		panY = 0;
		zoom = 1;
	}

	function zoomToFit(): void {
		const nodes = $workflow.nodes;
		if (nodes.length === 0) {
			resetView();
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
			resetView();
			return;
		}
		const r = canvasEl.getBoundingClientRect();

		const scaleX = r.width / contentW;
		const scaleY = r.height / contentH;
		zoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.15), 2);

		panX = (r.width - contentW * zoom) / 2 - (minX - padding) * zoom;
		panY = (r.height - contentH * zoom) / 2 - (minY - padding) * zoom;
	}

	function selectNode(id: string): void {
		selectedNodeId = id;
	}

	function duplicateNode(id: string): void {
		const node = $workflow.nodes.find((n) => n.id === id);
		if (!node) return;
		const { id: _, data: __, ...template } = node;
		const newId = addNode(template, node.x + 40, node.y + 40);
		selectedNodeId = newId;
	}

	function handleKeydown(e: KeyboardEvent): void {
		// Cmd+S to export — always works, even in inputs
		if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			exportWorkflow();
			return;
		}
		// Cmd+Enter to run
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

		// Don't handle the rest when typing in inputs
		const tag = (e.target as HTMLElement)?.tagName;
		if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

		if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
			e.preventDefault();
			const id = selectedNodeId;
			selectedNodeId = null;
			requestAnimationFrame(() => removeNode(id));
		}
		if (e.key === "d" && (e.metaKey || e.ctrlKey) && selectedNodeId) {
			e.preventDefault();
			duplicateNode(selectedNodeId);
		}
		if (e.key === "1" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			zoomToFit();
		}
		if (e.key === "0" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			resetView();
		}
		if (e.key === "Escape") {
			selectedNodeId = null;
			pending = null;
		}
	}

	// Track which ports already have edges connected
	let connectedPorts = $derived(() => {
		const set = new Set<string>();
		for (const e of $workflow.edges) {
			set.add(`${e.from_node_id}:${e.from_port_id}:output`);
			set.add(`${e.to_node_id}:${e.to_port_id}:input`);
		}
		return set;
	});

	function autoConnect(
		nodeId: string,
		portId: string,
		portType: PortType,
		side: "input" | "output",
	): void {
		const node = $workflow.nodes.find((n) => n.id === nodeId);
		if (!node) return;

		const pt = portType === "any" ? "text" : portType;

		if (side === "input") {
			const template =
				LIBRARY.inputs.find((t) => t.outputs[0]?.type === pt) ??
				LIBRARY.inputs[0];
			const newId = addNode(template, node.x - template.width - 80, node.y);
			addEdge({
				from_node_id: newId,
				from_port_id: template.outputs[0].id,
				to_node_id: nodeId,
				to_port_id: portId,
				type: pt,
			});
		} else {
			const template =
				LIBRARY.outputs.find((t) => t.inputs[0]?.type === pt) ??
				LIBRARY.outputs[0];
			const newId = addNode(template, node.x + node.width + 80, node.y);
			addEdge({
				from_node_id: nodeId,
				from_port_id: portId,
				to_node_id: newId,
				to_port_id: template.inputs[0].id,
				type: pt,
			});
		}
	}

	function exportWorkflow(): void {
		const json = JSON.stringify($workflow, null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${$workflow.name.replace(/[^a-zA-Z0-9_-]/g, "_")}.workflow.json`;
		a.click();
		URL.revokeObjectURL(url);
		showToast("Exported workflow.json");
	}

	async function deployToHub(): Promise<void> {
		if (!deployToken.trim()) return;
		deploying = true;
		deployStatus = "";
		deployUrl = "";
		try {
			const url = await publishToHub(
				$workflow,
				deployToken.trim(),
				(msg) => { deployStatus = msg; }
			);
			deployUrl = url;
			deployStatus = "Deployed!";
		} catch (err) {
			deployStatus = `Error: ${err instanceof Error ? err.message : String(err)}`;
		} finally {
			deploying = false;
		}
	}

	function importWorkflow(): void {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".json";
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;
			try {
				const text = await file.text();
				const wf = JSON.parse(text);
				if (wf.nodes && wf.edges) {
					revokeAllBlobUrls($workflow.nodes);
					wf.nodes = wf.nodes.map((n: any) => ({ ...n, data: n.data ?? {} }));
					workflow.set(wf);
					showToast("Imported workflow");
				}
			} catch {
				// Invalid JSON
			}
		};
		input.click();
	}

	function setName(value: string): void {
		workflow.update((wf) => ({ ...wf, name: value }));
		editingName = false;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="workflow-root" onclick={handleGlobalClick}>
	<!-- Toolbar -->
	<div class="toolbar">
		<div class="toolbar-left">
			{#if editingName}
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
				>{nodeCount} nodes &middot; {edgeCount} edges</span
			>
		</div>
		<div class="toolbar-right">
			{#if !isLoggedIn}
				<a class="tool-btn login-btn" href="/login/huggingface">
					Sign in with HF
				</a>
			{/if}
			<div class="toolbar-dropdown-wrap">
				<button
					class="tool-btn"
					onclick={() => (showTemplates = !showTemplates)}
				>
					Templates
				</button>
				{#if showTemplates}
					<div class="toolbar-dropdown">
						{#each TEMPLATES as t}
							<button
								class="toolbar-dropdown-item"
								onclick={() => {
									loadTemplate(t);
									showTemplates = false;
								}}
							>
								<span class="toolbar-dropdown-name">{t.name}</span>
								<span class="toolbar-dropdown-desc">{t.desc}</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
			<button
				class="tool-btn"
				onclick={exportWorkflow}
				title="Export workflow.json (Cmd+S)"
			>
				Export
			</button>
			<button
				class="tool-btn"
				onclick={importWorkflow}
				title="Import workflow.json"
			>
				Import
			</button>
			<button
				class="tool-btn deploy-btn"
				onclick={() => { showDeploy = true; }}
				disabled={!hasTransforms}
				title="Deploy as HuggingFace Space"
			>
				Deploy to HF
			</button>
			<div class="toolbar-divider"></div>
			<button class="tool-btn" onclick={autoLayout} title="Auto-arrange nodes">
				Layout
			</button>
			<button class="tool-btn" onclick={clearWorkflow}>
				Clear
			</button>
			<div class="toolbar-divider"></div>
			{#if running}
				<button class="run-btn stop" onclick={stopWorkflow}>
					<span class="run-icon">&#x25A0;</span> Stop
				</button>
			{:else}
				<button class="run-btn" onclick={runWorkflow} disabled={!hasTransforms}>
					<span class="run-icon">&#x25B6;</span> Run
				</button>
			{/if}
		</div>
	</div>

	<!-- Editor — always visible -->
	<div class="editor">
		<WorkflowSidebar onadd={(t) => addTemplateToCanvas(t)} />
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="canvas"
			class:panning={isPanning}
			bind:this={canvasEl}
			style="--zoom: {zoom}; --pan-x: {panX}px; --pan-y: {panY}px"
			ondragover={(e) => e.preventDefault()}
			ondrop={handleDrop}
			onwheel={handleWheel}
			onmousedown={handleCanvasMouseDown}
			onmousemove={handleCanvasMouseMove}
			onmouseup={handleCanvasMouseUp}
			onkeydown={handleKeydown}
			role="application"
			tabindex="0"
		>
			<div
				class="canvas-transform"
				style="transform: translate({panX}px, {panY}px) scale({zoom})"
			>
				{#each $workflow.nodes as node (node.id)}
					<WorkflowNode
						{node}
						{pending}
						onstartconnection={startConnection}
						oncompleteconnection={completeConnection}
						onmove={moveNode}
						ondatachange={updateNodeData}
						onremove={removeNode}
						onautoconnect={autoConnect}
						connectedPorts={connectedPorts()}
						status={nodeStatus[node.id] ?? "idle"}
						error={nodeErrors[node.id] ?? ""}
						{zoom}
						selected={selectedNodeId === node.id}
						onselect={selectNode}
					/>
				{/each}
				<WorkflowEdges {pending} onremove={removeEdge} {zoom} {panX} {panY} />
			</div>
			{#if running}
				<div class="run-overlay"></div>
			{/if}
			{#if nodeCount === 0}
				<div class="empty-state">
					<div class="empty-title">Start building</div>
					<div class="empty-hint">
						Drag components from the sidebar, or try a template
					</div>
					<div class="template-grid">
						{#each TEMPLATES as t}
							<button class="template-card" onclick={() => loadTemplate(t)}>
								<span class="template-name">{t.name}</span>
								<span class="template-desc">{t.desc}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
			<div class="zoom-controls">
				<button
					class="zoom-ctrl-btn"
					onclick={() => (showShortcuts = !showShortcuts)}
					title="Keyboard shortcuts">?</button
				>
				<button
					class="zoom-ctrl-btn"
					onclick={zoomToFit}
					title="Fit all (Cmd+1)">&#x2922;</button
				>
				<button
					class="zoom-ctrl-btn"
					onclick={() => {
						zoom = Math.max(0.15, zoom / 1.2);
					}}>−</button
				>
				<button class="zoom-btn" onclick={resetView}>
					{Math.round(zoom * 100)}%
				</button>
				<button
					class="zoom-ctrl-btn"
					onclick={() => {
						zoom = Math.min(4, zoom * 1.2);
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
						<kbd>Cmd+S</kbd> <span>Export JSON</span>
					</div>
					<div class="shortcut-row">
						<kbd>Cmd+D</kbd> <span>Duplicate node</span>
					</div>
					<div class="shortcut-row">
						<kbd>Cmd+1</kbd> <span>Zoom to fit</span>
					</div>
					<div class="shortcut-row">
						<kbd>Cmd+0</kbd> <span>Reset zoom</span>
					</div>
					<div class="shortcut-row">
						<kbd>Delete</kbd> <span>Remove node</span>
					</div>
					<div class="shortcut-row">
						<kbd>Escape</kbd> <span>Deselect</span>
					</div>
					<div class="shortcut-row"><kbd>Scroll</kbd> <span>Zoom</span></div>
					<div class="shortcut-row">
						<kbd>Drag canvas</kbd> <span>Pan</span>
					</div>
					<div class="shortcut-row">
						<kbd>Double-click</kbd> <span>Rename node</span>
					</div>
				</div>
			{/if}
			{#if pending}
				<div
					class="connection-badge"
					style="left: {mouseViewport.x + 14}px; top: {mouseViewport.y -
						10}px; --badge-color: {PORT_COLOR[pending.type]}"
				>
					{pending.type}
				</div>
			{/if}
		</div>
	</div>

	{#if toasts.length > 0}
		<div class="wf-toast-stack">
			{#each toasts as t (t.id)}
				<div class="wf-toast wf-toast-{t.type}">{t.message}</div>
			{/each}
		</div>
	{/if}

	{#if showDeploy}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="deploy-overlay" onclick={() => { if (!deploying) showDeploy = false; }}>
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="deploy-modal" onclick={(e) => e.stopPropagation()}>
				<div class="deploy-header">
					<span class="deploy-title">Deploy to HuggingFace</span>
					{#if !deploying}
						<button class="deploy-close" onclick={() => showDeploy = false}>&times;</button>
					{/if}
				</div>
				<p class="deploy-desc">
					Publish this workflow as a Gradio Space on HuggingFace.
				</p>
				{#if deployUrl}
					<div class="deploy-success">
						<span>Deployed!</span>
						<a href={deployUrl} target="_blank" rel="noopener">{deployUrl}</a>
					</div>
				{:else}
					<label class="deploy-label">
						HF Token
						<input
							class="deploy-input"
							type="password"
							placeholder="hf_..."
							bind:value={deployToken}
							disabled={deploying}
						/>
					</label>
					<p class="deploy-hint">
						Get a write token from <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener">huggingface.co/settings/tokens</a>
					</p>
					{#if deployStatus}
						<div class="deploy-status">{deployStatus}</div>
					{/if}
					<button
						class="deploy-submit"
						onclick={deployToHub}
						disabled={deploying || !deployToken.trim()}
					>
						{deploying ? deployStatus || "Deploying..." : "Deploy as Space"}
					</button>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.workflow-root {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 600px;
		background: #0c0d10;
		border: 1px solid #1e1f2a;
		border-radius: 14px;
		overflow: hidden;
		font-family: "Manrope", sans-serif;
		color-scheme: dark;
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.03),
			0 20px 60px rgba(0, 0, 0, 0.5);
	}

	/* ─── Toolbar ─── */
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 48px;
		padding: 0 16px;
		background: #101118;
		border-bottom: 1px solid #1e1f2a;
		flex-shrink: 0;
	}

	.toolbar-left,
	.toolbar-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.name-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 4px 8px;
		border-radius: 6px;
		transition: background 0.15s;
	}

	.name-btn:hover {
		background: #1a1b25;
	}

	.name-text {
		font-size: 14px;
		font-weight: 700;
		color: #d5d6de;
		letter-spacing: -0.01em;
	}

	.name-edit-icon {
		font-size: 11px;
		color: #3e3f4d;
	}

	.name-input {
		font-family: "Manrope", sans-serif;
		font-size: 14px;
		font-weight: 700;
		border: 1px solid #f97316;
		border-radius: 6px;
		padding: 4px 8px;
		outline: none;
		background: #16171f;
		color: #d5d6de;
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.15);
	}

	.toolbar-stat {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #3e3f4d;
		letter-spacing: 0.02em;
	}

	.tool-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		font-weight: 500;
		padding: 5px 10px;
		border: 1px solid #1e1f2a;
		border-radius: 6px;
		background: transparent;
		color: #6b6e78;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.tool-btn:hover {
		background: #16171f;
		color: #a0a2ae;
		border-color: #2a2b36;
	}

	.login-btn {
		text-decoration: none;
		color: #f5a623 !important;
		border-color: rgba(245, 166, 35, 0.3) !important;
	}

	.login-btn:hover {
		background: rgba(245, 166, 35, 0.08) !important;
		border-color: rgba(245, 166, 35, 0.5) !important;
	}

	.tool-icon {
		font-size: 10px;
	}

	.toolbar-divider {
		width: 1px;
		height: 20px;
		background: #1e1f2a;
	}

	.toolbar-dropdown-wrap {
		position: relative;
	}

	.toolbar-dropdown {
		position: absolute;
		top: 100%;
		right: 0;
		margin-top: 4px;
		background: #16171f;
		border: 1px solid #2a2b36;
		border-radius: 8px;
		overflow: hidden;
		z-index: 20;
		min-width: 220px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.toolbar-dropdown-item {
		display: flex;
		flex-direction: column;
		gap: 2px;
		width: 100%;
		padding: 10px 14px;
		border: none;
		background: transparent;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
	}

	.toolbar-dropdown-item:hover {
		background: #1a1b25;
	}

	.toolbar-dropdown-name {
		font-size: 12px;
		font-weight: 600;
		color: #c8c9d2;
	}

	.toolbar-dropdown-desc {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #5c5e6a;
	}

	.run-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		font-family: "Manrope", sans-serif;
		font-size: 12.5px;
		font-weight: 700;
		padding: 6px 16px;
		border: none;
		border-radius: 7px;
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: #fff;
		cursor: pointer;
		transition:
			transform 0.1s,
			box-shadow 0.15s;
		box-shadow: 0 2px 8px rgba(249, 115, 22, 0.25);
	}

	.run-btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
	}

	.run-btn:active {
		transform: translateY(0);
	}

	.run-btn:disabled {
		opacity: 0.4;
		cursor: default;
		transform: none;
		box-shadow: none;
	}

	.run-btn.stop {
		background: linear-gradient(135deg, #ef4444, #dc2626);
		box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);
	}

	.run-btn.stop:hover {
		box-shadow: 0 4px 16px rgba(239, 68, 68, 0.35);
	}

	.run-icon {
		font-size: 9px;
	}

	/* ─── Editor ─── */
	.editor {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.canvas {
		flex: 1;
		position: relative;
		overflow: hidden;
		background-color: #0c0d10;
		background-image:
			linear-gradient(#151620 1px, transparent 1px),
			linear-gradient(90deg, #151620 1px, transparent 1px);
		background-size: calc(22px * var(--zoom, 1)) calc(22px * var(--zoom, 1));
		background-position: var(--pan-x, 0px) var(--pan-y, 0px);
		cursor: grab;
	}

	.canvas.panning {
		cursor: grabbing;
	}

	.canvas-transform {
		position: absolute;
		top: 0;
		left: 0;
		transform-origin: 0 0;
		width: 0;
		height: 0;
		overflow: visible;
	}

	.zoom-controls {
		position: absolute;
		bottom: 12px;
		right: 12px;
		display: flex;
		align-items: center;
		gap: 2px;
		background: #16171f;
		border: 1px solid #1e1f2a;
		border-radius: 6px;
		padding: 2px;
	}

	.zoom-ctrl-btn {
		width: 26px;
		height: 26px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #5c5e6a;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition:
			color 0.15s,
			background 0.15s;
	}

	.zoom-ctrl-btn:hover {
		background: #1e1f2a;
		color: #a0a2ae;
	}

	.zoom-btn {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		font-weight: 600;
		padding: 4px 8px;
		border: 1px solid #1e1f2a;
		border-radius: 5px;
		background: #16171f;
		color: #5c5e6a;
		cursor: pointer;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.zoom-btn:hover {
		color: #a0a2ae;
		border-color: #2a2b36;
	}

	.shortcuts-panel {
		position: absolute;
		bottom: 48px;
		right: 12px;
		background: #16171f;
		border: 1px solid #2a2b36;
		border-radius: 8px;
		padding: 12px 16px;
		z-index: 25;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
		min-width: 200px;
	}

	.shortcuts-title {
		font-size: 11px;
		font-weight: 700;
		color: #8b8d98;
		margin-bottom: 8px;
	}

	.shortcut-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 3px 0;
		font-size: 11px;
		color: #5c5e6a;
	}

	.shortcut-row kbd {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		padding: 1px 5px;
		border-radius: 3px;
		background: #1e1f2a;
		color: #a0a2ae;
		border: 1px solid #2a2b36;
	}

	.run-overlay {
		position: absolute;
		inset: 0;
		z-index: 15;
		cursor: wait;
	}

	.empty-state {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		text-align: center;
	}

	.empty-title {
		font-size: 16px;
		font-weight: 700;
		color: #3e3f4d;
		margin-bottom: 6px;
	}

	.empty-hint {
		font-size: 12px;
		color: #5c5e6a;
		margin-bottom: 20px;
	}

	.template-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		max-width: 380px;
	}

	.template-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		padding: 12px 14px;
		border: 1px solid #1e1f2a;
		border-radius: 8px;
		background: #101118;
		cursor: pointer;
		text-align: left;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.template-card:hover {
		border-color: #f97316;
		background: #16171f;
	}

	.template-name {
		font-size: 12px;
		font-weight: 700;
		color: #c8c9d2;
	}

	.template-desc {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #5c5e6a;
		line-height: 1.4;
	}

	.wf-toast-stack {
		position: absolute;
		bottom: 16px;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		gap: 6px;
		z-index: 30;
		pointer-events: none;
	}

	.wf-toast {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		font-weight: 600;
		padding: 8px 16px;
		border-radius: 8px;
		background: #1a1b25;
		color: #c8c9d2;
		border: 1px solid #2a2b36;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
		opacity: 1;
		white-space: nowrap;
		animation: wf-toast-in 0.2s ease-out;
	}

	.wf-toast.wf-toast-error {
		border-color: #f87171;
		color: #fca5a5;
	}

	.wf-toast.wf-toast-warning {
		border-color: #f59e0b;
		color: #fcd34d;
	}

	.wf-toast.wf-toast-success {
		border-color: #34d399;
		color: #6ee7b7;
	}

	@keyframes wf-toast-in {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.connection-badge {
		position: absolute;
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		background: var(--badge-color);
		color: #0c0d10;
		pointer-events: none;
		z-index: 20;
		white-space: nowrap;
	}
	/* ─── Deploy Modal ─── */
	.deploy-btn {
		color: #f5a623 !important;
	}

	.deploy-overlay {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 50;
	}

	.deploy-modal {
		background: #16171f;
		border: 1px solid #2a2b36;
		border-radius: 12px;
		padding: 24px;
		width: 400px;
		max-width: 90%;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.deploy-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 12px;
	}

	.deploy-title {
		font-size: 16px;
		font-weight: 700;
		color: #d5d6de;
	}

	.deploy-close {
		border: none;
		background: transparent;
		color: #5c5e6a;
		font-size: 18px;
		cursor: pointer;
		padding: 4px;
	}

	.deploy-close:hover {
		color: #a0a2ae;
	}

	.deploy-desc {
		font-size: 12px;
		color: #8b8d98;
		margin: 0 0 16px;
	}

	.deploy-label {
		display: block;
		font-size: 11px;
		font-weight: 600;
		color: #8b8d98;
		margin-bottom: 12px;
	}

	.deploy-input {
		display: block;
		width: 100%;
		margin-top: 6px;
		font-family: "JetBrains Mono", monospace;
		font-size: 12px;
		padding: 8px 12px;
		border: 1px solid #2a2b36;
		border-radius: 6px;
		background: #0c0d10;
		color: #c8c9d2;
		outline: none;
		box-sizing: border-box;
	}

	.deploy-input:focus {
		border-color: #f5a623;
	}

	.deploy-hint {
		font-size: 10px;
		color: #5c5e6a;
		margin: 0 0 16px;
	}

	.deploy-hint a {
		color: #8b83e8;
	}

	.deploy-status {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #8b8d98;
		margin-bottom: 12px;
	}

	.deploy-submit {
		width: 100%;
		padding: 10px;
		border: none;
		border-radius: 8px;
		background: linear-gradient(135deg, #f97316, #ea580c);
		color: #fff;
		font-family: "Manrope", sans-serif;
		font-size: 13px;
		font-weight: 700;
		cursor: pointer;
		transition: opacity 0.15s;
	}

	.deploy-submit:hover:not(:disabled) {
		opacity: 0.9;
	}

	.deploy-submit:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.deploy-success {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		border: 1px solid rgba(79, 209, 165, 0.3);
		border-radius: 8px;
		background: rgba(79, 209, 165, 0.06);
	}

	.deploy-success span {
		font-size: 14px;
		font-weight: 700;
		color: #4fd1a5;
	}

	.deploy-success a {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		color: #8b83e8;
		word-break: break-all;
	}
</style>
