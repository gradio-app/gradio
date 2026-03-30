<script lang="ts">
	import type { DAGNode, PortInfo, Position } from "./types";
	import type { ProcessedComponentMeta } from "../types";
	import MountComponents from "../MountComponents.svelte";

	let {
		node,
		position,
		processed_node,
		ondragstart,
		onconnectstart,
		onportdrop,
		onplay
	}: {
		node: DAGNode;
		position: Position | undefined;
		processed_node: ProcessedComponentMeta | null;
		ondragstart: (node_id: string, e: MouseEvent) => void;
		onconnectstart: (port: PortInfo, e: MouseEvent) => void;
		onportdrop: (port: PortInfo) => void;
		onplay?: (dep_id: number) => void;
	} = $props();

	let node_id = $derived(
		node.kind === "component" ? `comp_${node.id}` : `dep_${node.id}`
	);

	function handle_mousedown(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		if (target.closest(".port")) return;
		// For component nodes, only drag from the handle — let component events through
		if (node.kind === "component" && !target.closest(".drag-handle")) return;
		e.preventDefault();
		ondragstart(node_id, e);
	}

	function handle_port_mousedown(port: PortInfo, e: MouseEvent): void {
		e.preventDefault();
		e.stopPropagation();
		onconnectstart(port, e);
	}

	function handle_port_mouseup(port: PortInfo, e: MouseEvent): void {
		e.stopPropagation();
		onportdrop(port);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class="dag-node"
	class:component={node.kind === "component"}
	class:dependency={node.kind === "dependency"}
	style:left="{position?.x ?? 0}px"
	style:top="{position?.y ?? 0}px"
	style:width="{node.width}px"
	style:height="{node.height}px"
	onmousedown={handle_mousedown}
>
	{#if node.kind === "component"}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="drag-handle">⠿</div>
		<div class="component-render">
			{#if processed_node}
				<MountComponents node={processed_node} />
			{:else}
				<span class="node-label" title={node.label}>{node.label}</span>
			{/if}
		</div>
	{:else}
		<div class="dep-header">
			<span class="node-label" title={node.label}>{node.label}</span>
			{#if onplay}
				<button
					class="play-btn"
					onclick={(e) => {
						e.stopPropagation();
						onplay(node.id);
					}}
					title="Run this event listener"
				>
					&#9654;
				</button>
			{/if}
		</div>
	{/if}

	<!-- Ports -->
	{#if node.kind === "component"}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="port port-right"
			title="Connect as input/output"
			onmousedown={(e) =>
				handle_port_mousedown(
					{ node_id, side: "right", edge_type: "input" },
					e
				)}
			onmouseup={(e) =>
				handle_port_mouseup(
					{ node_id, side: "right", edge_type: "input" },
					e
				)}
		></div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="port port-bottom"
			title="Connect as trigger"
			onmousedown={(e) =>
				handle_port_mousedown(
					{ node_id, side: "bottom", edge_type: "trigger" },
					e
				)}
			onmouseup={(e) =>
				handle_port_mouseup(
					{ node_id, side: "bottom", edge_type: "trigger" },
					e
				)}
		></div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="port port-left"
			title="Receive output"
			onmousedown={(e) =>
				handle_port_mousedown(
					{ node_id, side: "left", edge_type: "output" },
					e
				)}
			onmouseup={(e) =>
				handle_port_mouseup(
					{ node_id, side: "left", edge_type: "output" },
					e
				)}
		></div>
	{:else}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="port port-left"
			title="Input port"
			onmousedown={(e) =>
				handle_port_mousedown(
					{ node_id, side: "left", edge_type: "input" },
					e
				)}
			onmouseup={(e) =>
				handle_port_mouseup(
					{ node_id, side: "left", edge_type: "input" },
					e
				)}
		></div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="port port-right"
			title="Output port"
			onmousedown={(e) =>
				handle_port_mousedown(
					{ node_id, side: "right", edge_type: "output" },
					e
				)}
			onmouseup={(e) =>
				handle_port_mouseup(
					{ node_id, side: "right", edge_type: "output" },
					e
				)}
		></div>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="port port-top"
			title="Trigger port"
			onmousedown={(e) =>
				handle_port_mousedown(
					{ node_id, side: "top", edge_type: "trigger" },
					e
				)}
			onmouseup={(e) =>
				handle_port_mouseup(
					{ node_id, side: "top", edge_type: "trigger" },
					e
				)}
		></div>
	{/if}
</div>

<style>
	.dag-node {
		position: absolute;
		border-radius: 8px;
		background: var(--background-fill-primary, white);
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
		display: flex;
		flex-direction: column;
		transition: box-shadow 0.15s;
		border: 1px solid var(--border-color-primary, #e5e7eb);
		overflow: hidden;
	}

	.dag-node:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
	}

	.dag-node.component {
		border-left: 4px solid #3b82f6;
	}

	.dag-node.dependency {
		border-left: 4px solid #f97316;
		padding: 0 14px;
		justify-content: center;
		cursor: grab;
		user-select: none;
	}

	.dag-node.dependency:active {
		cursor: grabbing;
	}

	.drag-handle {
		flex-shrink: 0;
		height: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		user-select: none;
		background: var(--background-fill-secondary, #f9fafb);
		border-bottom: 1px solid var(--border-color-primary, #e5e7eb);
		font-size: 10px;
		color: var(--body-text-color-subdued, #9ca3af);
		letter-spacing: 2px;
	}

	.drag-handle:active {
		cursor: grabbing;
		background: var(--background-fill-primary, #f3f4f6);
	}

	.component-render {
		flex: 1;
		overflow: hidden;
		padding: 4px 10px 8px;
	}

	.node-label {
		font-size: 13px;
		font-weight: 500;
		color: var(--body-text-color, #111827);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.dep-header {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
	}

	.play-btn {
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		border: 1px solid #e5e7eb;
		background: var(--background-fill-primary, white);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 12px;
		color: #22c55e;
		transition: all 0.15s;
		margin-left: auto;
	}

	.play-btn:hover {
		background: #22c55e;
		color: white;
		border-color: #22c55e;
	}

	.port {
		position: absolute;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--border-color-primary, #d1d5db);
		border: 2px solid var(--background-fill-primary, white);
		cursor: crosshair;
		transition: all 0.15s;
		z-index: 3;
	}

	.port:hover {
		transform: scale(1.5);
		background: #3b82f6;
		box-shadow: 0 0 6px rgba(59, 130, 246, 0.5);
	}

	.port-right {
		right: -5px;
		top: 50%;
		transform: translateY(-50%);
	}

	.port-right:hover {
		transform: translateY(-50%) scale(1.5);
	}

	.port-left {
		left: -5px;
		top: 50%;
		transform: translateY(-50%);
	}

	.port-left:hover {
		transform: translateY(-50%) scale(1.5);
	}

	.port-bottom {
		bottom: -5px;
		left: 50%;
		transform: translateX(-50%);
	}

	.port-bottom:hover {
		transform: translateX(-50%) scale(1.5);
	}

	.port-top {
		top: -5px;
		left: 50%;
		transform: translateX(-50%);
	}

	.port-top:hover {
		transform: translateX(-50%) scale(1.5);
	}
</style>
