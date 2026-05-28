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
		removeNode
	} from "./workflow-store";
	import { PORT_COLOR } from "./workflow-types";
	import type { PortType, WFNode, WFEdge, NodeStatus } from "./workflow-types";
	import { executeWorkflow } from "./workflow-executor";
	import WorkflowEmptyState from "./WorkflowEmptyState.svelte";
	import { TEMPLATES } from "./workflow-templates";
	import { LIBRARY, categorizeSpace } from "./node-library";
	import { createHFAuth } from "./hf-auth.svelte";

	let {
		server = {},
		initialValue = null
	}: { server?: Record<string, any>; initialValue?: string | null } = $props();

	const auth = createHFAuth(() => server);

	interface TrendingSpace {
		id: string;
		title: string;
		description: string;
		likes: number;
		running: boolean;
		category: string | null;
	}

	let trendingSpaces: TrendingSpace[] = $state([]);
	let trendingLoading = $state(true);

	async function fetchTrending() {
		if (!server?.search_spaces) {
			trendingLoading = false;
			return;
		}
		try {
			const raw = await server.search_spaces(["trending", "", ""]);
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			if (!Array.isArray(data)) {
				trendingSpaces = [];
				return;
			}
			trendingSpaces = data
				.map((s: any) => {
					const desc = s.cardData?.short_description || "";
					return {
						id: s.id,
						title: s.cardData?.title || s.id.split("/").pop() || s.id,
						description: desc,
						likes: s.likes ?? 0,
						running: s.runtime?.stage === "RUNNING",
						category: categorizeSpace(
							s.cardData?.pipeline_tag,
							s.cardData?.tags,
							desc,
							s.id
						)
					};
				})
				.filter((s: TrendingSpace) => s.category !== null && s.running);
		} catch {
			trendingSpaces = [];
		} finally {
			trendingLoading = false;
		}
	}

	if (typeof window !== "undefined") {
		fetchTrending();
	}

	$effect(() => {
		if (server?.get_token) {
			void auth.checkLoginStatus();
		}
	});

	$effect(() => {
		if (!initialValue) return;
		try {
			const wf = JSON.parse(initialValue);
			if (wf.nodes && wf.edges) {
				wf.nodes = wf.nodes.map((n: any) => ({ ...n, data: n.data ?? {} }));
				workflow.set(wf);
			}
		} catch {}
	});

	$effect(() => {
		const wf = $workflow;
		if (!server?.save_workflow) return;
		const payload = JSON.stringify(wf);
		const timer = setTimeout(() => {
			server.save_workflow([payload]).catch(() => {});
		}, 500);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		window.addEventListener("keydown", handleKeydown);
		return () => window.removeEventListener("keydown", handleKeydown);
	});

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
	let showShortcuts = $state(false);

	interface WfToast {
		id: number;
		message: string;
		type: "info" | "warning" | "error" | "success";
	}
	let toasts: WfToast[] = $state([]);
	let toastCounter = 0;

	function showToast(
		msg: string,
		ms = 3000,
		type: "info" | "warning" | "error" | "success" = "info"
	): void {
		const id = ++toastCounter;
		toasts = [...toasts, { id, message: msg, type }].slice(-3);
		if (ms > 0)
			setTimeout(() => {
				toasts = toasts.filter((t) => t.id !== id);
			}, ms);
	}

	let panX = $state(0);
	let panY = $state(0);
	let zoom = $state(1);
	let isPanning = $state(false);
	let panStart = { x: 0, y: 0, panX: 0, panY: 0 };
	let nameInput: HTMLInputElement;
	let nodeCount = $derived($workflow.nodes.length);
	let hasTransforms = $derived(
		$workflow.nodes.some((n) => n.kind === "transform")
	);
	let edgeCount = $derived($workflow.edges.length);

	function toCanvas(e: MouseEvent): { x: number; y: number } {
		const r = canvasEl.getBoundingClientRect();
		return {
			x: (e.clientX - r.left - panX) / zoom,
			y: (e.clientY - r.top - panY) / zoom
		};
	}

	function startConnection(
		from_node_id: string,
		from_port_id: string,
		type: PortType,
		e: MouseEvent
	): void {
		pending = { from_node_id, from_port_id, type, ...toCanvas(e) };
	}

	function completeConnection(
		to_node_id: string,
		to_port_id: string,
		to_type: PortType
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
			type: pending.type
		});
		pending = null;
		const dot = document.querySelector(
			`[data-port-id="${to_node_id}:${to_port_id}:input"]`
		);
		if (dot) {
			dot.classList.add("port-snap");
			setTimeout(() => dot.classList.remove("port-snap"), 400);
		}
	}

	function compatible(a: PortType, b: PortType): boolean {
		return a === "any" || b === "any" || a === b;
	}

	async function addTemplateToCanvas(
		template: any,
		x?: number,
		y?: number
	): Promise<void> {
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
				return;
			}
		}
		if (x === undefined || y === undefined) {
			const nodes = $workflow.nodes;
			x =
				nodes.length > 0
					? Math.max(...nodes.map((n) => n.x + n.width)) + 80
					: 200;
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
		workflow.set({ version: "1", name: $workflow.name, nodes: [], edges: [] });
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

	function autoLayout(): void {
		const sorted = topoSort($workflow.nodes, $workflow.edges);
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

	async function runWorkflow(): Promise<void> {
		if (running) return;
		running = true;
		nodeStatus = {};
		nodeErrors = {};
		abortController = new AbortController();

		const oauthToken = await auth.getOAuthToken();
		if (
			$workflow.nodes.some((n) => n.source === "space" && n.space_id) &&
			!oauthToken
		) {
			showToast(
				"Running as guest — GPU Spaces may hit quota limits. Sign in with HuggingFace for your own compute.",
				5000,
				"warning"
			);
		}

		const callSpaceWithToken = server?.call_space
			? async (spaceId: string, endpoint: string, argsJson: string) =>
					server.call_space([spaceId, endpoint, argsJson, auth.hfToken || ""])
			: undefined;

		const callModelWithToken = server?.call_model
			? async (modelId: string, pipelineTag: string, argsJson: string) =>
					server.call_model([
						modelId,
						pipelineTag,
						argsJson,
						auth.hfToken || ""
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
						auth.hfToken || ""
					])
			: undefined;

		const callFnWithToken = server?.call_fn
			? async (fnName: string, argsJson: string) =>
					server.call_fn([fnName, argsJson])
			: undefined;

		await executeWorkflow(
			$workflow,
			(nodeId, status, error, errorType) => {
				nodeStatus = { ...nodeStatus, [nodeId]: status };
				if (error) {
					nodeErrors = { ...nodeErrors, [nodeId]: error };
					const node = $workflow.nodes.find((n) => n.id === nodeId);
					const label =
						node?.label ?? node?.space_id ?? node?.model_id ?? "Node";
					showToast(
						`${label}: ${error}`,
						errorType === "quota" || errorType === "gpu" ? 0 : 5000,
						"error"
					);
				}
			},
			(nodeId, portId, value) => {
				updateNodeData(nodeId, portId, value);
			},
			abortController.signal,
			callSpaceWithToken,
			callModelWithToken,
			fetchDatasetWithToken,
			callFnWithToken
		);

		running = false;
		abortController = null;

		const hasErrors = Object.values(nodeStatus).some((s) => s === "error");
		showToast(
			hasErrors ? "Workflow finished with errors" : "Workflow complete",
			hasErrors ? 5000 : 3000,
			hasErrors ? "error" : "success"
		);

		// clear done status after 3s so nodes return to neutral
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
		if (
			showShortcuts &&
			!target?.closest(".shortcuts-panel") &&
			!target?.closest(".zoom-controls")
		) {
			showShortcuts = false;
		}
	}

	function handleWheel(e: WheelEvent): void {
		if ((e.target as HTMLElement)?.closest(".empty-state")) return;
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

	function handleCanvasMouseUp(): void {
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
		zoom = Math.min(
			Math.max(Math.min(r.width / contentW, r.height / contentH), 0.15),
			2
		);
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
		selectedNodeId = addNode(template, node.x + 40, node.y + 40);
	}

	function handleKeydown(e: KeyboardEvent): void {
		if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
			e.preventDefault();
			exportWorkflow();
			return;
		}
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
		if (e.key === "f" && !e.metaKey && !e.ctrlKey) {
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
		side: "input" | "output"
	): void {
		const node = $workflow.nodes.find((n) => n.id === nodeId);
		if (!node) return;
		const pt = portType === "any" ? "text" : portType;
		const template =
			LIBRARY.components.find((t) => t.outputs[0]?.type === pt) ??
			LIBRARY.components[0];
		if (side === "input") {
			const newId = addNode(template, node.x - template.width - 80, node.y);
			addEdge({
				from_node_id: newId,
				from_port_id: template.outputs[0].id,
				to_node_id: nodeId,
				to_port_id: portId,
				type: pt
			});
		} else {
			const newId = addNode(template, node.x + node.width + 80, node.y);
			addEdge({
				from_node_id: nodeId,
				from_port_id: portId,
				to_node_id: newId,
				to_port_id: template.inputs[0].id,
				type: pt
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
			} catch {}
		};
		input.click();
	}

	function setName(value: string): void {
		workflow.update((wf) => ({ ...wf, name: value }));
		editingName = false;
	}

	async function loadTemplate(t: (typeof TEMPLATES)[number]): Promise<void> {
		revokeAllBlobUrls($workflow.nodes);
		const wf = t.build();
		workflow.set(wf);
		resetView();
		showToast(`Loading "${t.name}"...`);

		const spaceNodes = wf.nodes.filter(
			(n: any) => n.source === "space" && n.space_id
		);
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
					return {
						...n,
						inputs: apiInfo.inputs,
						outputs: apiInfo.outputs,
						endpoint: apiInfo.endpoint,
						width: apiInfo.width
					};
				}
				return n;
			}),
			edges: current.edges.map((e) => {
				const srcUpdate = updates.find(
					(u) => u.status === "fulfilled" && u.value.nodeId === e.from_node_id
				);
				const dstUpdate = updates.find(
					(u) => u.status === "fulfilled" && u.value.nodeId === e.to_node_id
				);
				let edge = { ...e };
				if (srcUpdate && srcUpdate.status === "fulfilled") {
					const firstOut = srcUpdate.value.apiInfo.outputs[0];
					if (firstOut && edge.from_port_id === "out")
						edge = { ...edge, from_port_id: firstOut.id };
				}
				if (dstUpdate && dstUpdate.status === "fulfilled") {
					const firstIn = dstUpdate.value.apiInfo.inputs[0];
					if (firstIn && edge.to_port_id === "in")
						edge = { ...edge, to_port_id: firstIn.id };
				}
				return edge;
			})
		}));

		if (updates.some((u) => u.status === "rejected")) {
			showToast("Some Spaces could not be reached", 5000, "warning");
		} else {
			showToast(`Loaded "${t.name}"`, 3000, "success");
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="workflow-root" onclick={handleGlobalClick}>
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
			{#if !auth.isCheckingLogin}
				{#if auth.isHFSpace}
					{#if auth.loggedInUser}
						<span class="toolbar-user-info"
							>Logged in as <strong>{auth.loggedInUser}</strong></span
						>
						<button
							class="toolbar-login-btn logged-in"
							onclick={auth.handleLogout}>Log out</button
						>
					{:else}
						<button class="toolbar-login-btn" onclick={auth.handleLogin}
							>Sign in with 🤗</button
						>
					{/if}
				{:else}
					<form onsubmit={(e) => e.preventDefault()}>
						<input
							class="toolbar-token-input"
							type="password"
							placeholder="Paste HF token (hf_...)"
							value={auth.hfToken}
							onchange={(e) => auth.saveToken(e.currentTarget.value)}
							title="HuggingFace token for GPU access"
						/>
					</form>
				{/if}
			{/if}
			<button
				class="tool-btn"
				onclick={exportWorkflow}
				title="Export workflow.json (Cmd+S)">Export</button
			>
			<button
				class="tool-btn"
				onclick={importWorkflow}
				title="Import workflow.json">Import</button
			>
			<div class="toolbar-divider"></div>
			<button class="tool-btn" onclick={autoLayout} title="Auto-arrange nodes"
				>Layout</button
			>
			<button class="tool-btn" onclick={clearWorkflow}>Clear</button>
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

	<div class="editor">
		<WorkflowSidebar
			onadd={(t) => addTemplateToCanvas(t)}
			{server}
			hfToken={auth.hfToken}
			{trendingSpaces}
			{trendingLoading}
		/>
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
				<WorkflowEmptyState
					templates={TEMPLATES}
					{trendingSpaces}
					{trendingLoading}
					onloadtemplate={loadTemplate}
					onadd={(t) => addTemplateToCanvas(t)}
				/>
			{/if}
			<div class="zoom-controls">
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
						zoom = Math.max(0.15, zoom / 1.2);
					}}>−</button
				>
				<button class="zoom-btn" onclick={resetView}
					>{Math.round(zoom * 100)}%</button
				>
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
					<div class="shortcut-row"><kbd>F</kbd> <span>Zoom to fit</span></div>
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
</div>

<style>
	@import "./WorkflowCanvas.css";
</style>
