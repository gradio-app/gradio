<script lang="ts">
	import WorkflowNode from "./WorkflowNode.svelte";
	import WorkflowEdges from "./WorkflowEdges.svelte";
	import WorkflowSidebar from "./WorkflowSidebar.svelte";
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
	import { LIBRARY } from "./node-library";

	let canvasEl: HTMLDivElement;

	type Pending = {
		from_node_id: string;
		from_port_id: string;
		type: PortType;
		x: number;
		y: number;
	};
	let pending: Pending | null = $state(null);
	let running = $state(false);
	let abortController: AbortController | null = null;
	let nodeStatus: Record<string, NodeStatus> = $state({});
	let nodeErrors: Record<string, string> = $state({});
	let editingName = $state(false);

	// Pan & zoom
	let panX = $state(0);
	let panY = $state(0);
	let zoom = $state(1);
	let isPanning = $state(false);
	let panStart = { x: 0, y: 0, panX: 0, panY: 0 };
	let nameInput: HTMLInputElement;
	let nodeCount = $derived($workflow.nodes.length);
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
	}

	function compatible(a: PortType, b: PortType): boolean {
		return a === "any" || b === "any" || a === b;
	}

	function handleDrop(e: DragEvent): void {
		e.preventDefault();
		const raw = e.dataTransfer?.getData("node-template");
		if (!raw) return;
		const r = canvasEl.getBoundingClientRect();
		addNode(
			JSON.parse(raw),
			(e.clientX - r.left - panX) / zoom - 100,
			(e.clientY - r.top - panY) / zoom - 45
		);
	}

	function clearWorkflow(): void {
		workflow.set({
			version: "1",
			name: $workflow.name,
			nodes: [],
			edges: []
		});
	}

	function autoLayout(): void {
		const sorted = topoSort($workflow.nodes, $workflow.edges);
		const updated = sorted.map((n, i) => ({
			...n,
			x: 80 + Math.floor(i / 4) * 280,
			y: 80 + (i % 4) * 150
		}));
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
				if (d === 0)
					q.push(nodes.find((nd) => nd.id === e.to_node_id)!);
			}
		}
		return out;
	}

	async function runWorkflow(): Promise<void> {
		running = true;
		nodeStatus = {};
		nodeErrors = {};
		abortController = new AbortController();

		await executeWorkflow(
			$workflow,
			(nodeId, status, error) => {
				nodeStatus = { ...nodeStatus, [nodeId]: status };
				if (error) {
					nodeErrors = { ...nodeErrors, [nodeId]: error };
				}
			},
			(nodeId, portId, value) => {
				updateNodeData(nodeId, portId, value);
			},
			abortController.signal
		);

		running = false;
		abortController = null;
	}

	function stopWorkflow(): void {
		abortController?.abort();
		running = false;
		abortController = null;
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
		// Middle mouse button or space key held
		if (e.button === 1 || (e.button === 0 && e.target === canvasEl)) {
			e.preventDefault();
			isPanning = true;
			panStart = { x: e.clientX, y: e.clientY, panX, panY };
		}
	}

	function handleCanvasMouseMove(e: MouseEvent): void {
		if (isPanning) {
			panX = panStart.panX + (e.clientX - panStart.x);
			panY = panStart.panY + (e.clientY - panStart.y);
		}
		if (pending) pending = { ...pending, ...toCanvas(e) };
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
		side: "input" | "output"
	): void {
		const node = $workflow.nodes.find((n) => n.id === nodeId);
		if (!node) return;

		const pt = portType === "any" ? "text" : portType;

		if (side === "input") {
			const template = LIBRARY.inputs.find((t) => t.outputs[0]?.type === pt)
				?? LIBRARY.inputs[0];
			const newId = addNode(template, node.x - template.width - 80, node.y);
			addEdge({
				from_node_id: newId,
				from_port_id: template.outputs[0].id,
				to_node_id: nodeId,
				to_port_id: portId,
				type: pt
			});
		} else {
			const template = LIBRARY.outputs.find((t) => t.inputs[0]?.type === pt)
				?? LIBRARY.outputs[0];
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
					wf.nodes = wf.nodes.map((n: any) => ({ ...n, data: n.data ?? {} }));
					workflow.set(wf);
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

<div class="workflow-root">
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
			<button class="tool-btn" onclick={exportWorkflow} title="Export workflow.json">
				<span class="tool-icon">&#x2B07;</span> Export
			</button>
			<button class="tool-btn" onclick={importWorkflow} title="Import workflow.json">
				<span class="tool-icon">&#x2B06;</span> Import
			</button>
			<div class="toolbar-divider"></div>
			<button class="tool-btn" onclick={autoLayout}>
				<span class="tool-icon">&#x2B29;</span> Layout
			</button>
			<button class="tool-btn" onclick={clearWorkflow}>
				<span class="tool-icon">&#x2715;</span> Clear
			</button>
			<div class="toolbar-divider"></div>
			{#if running}
				<button class="run-btn stop" onclick={stopWorkflow}>
					<span class="run-icon">&#x25A0;</span> Stop
				</button>
			{:else}
				<button class="run-btn" onclick={runWorkflow}>
					<span class="run-icon">&#x25B6;</span> Run
				</button>
			{/if}
		</div>
	</div>

	<!-- Editor — always visible -->
	<div class="editor">
		<WorkflowSidebar />
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
			role="application"
			tabindex="-1"
		>
			<div
				class="canvas-transform"
				style="transform: translate({panX}px, {panY}px) scale({zoom})"
			>
				<WorkflowEdges {pending} onremove={removeEdge} />
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
					/>
				{/each}
			</div>
			<div class="zoom-indicator">
				<button class="zoom-btn" onclick={resetView}>
					{Math.round(zoom * 100)}%
				</button>
			</div>
		</div>
	</div>
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

	.tool-icon {
		font-size: 10px;
	}

	.toolbar-divider {
		width: 1px;
		height: 20px;
		background: #1e1f2a;
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

	.zoom-indicator {
		position: absolute;
		bottom: 12px;
		right: 12px;
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
		transition: color 0.15s, border-color 0.15s;
	}

	.zoom-btn:hover {
		color: #a0a2ae;
		border-color: #2a2b36;
	}

</style>
