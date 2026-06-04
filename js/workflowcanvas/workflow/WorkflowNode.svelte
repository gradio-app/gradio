<script lang="ts">
	import type {
		WFNode,
		PortType,
		NodeDataValue,
		NodeStatus
	} from "./workflow-types";
	import {
		PORT_COLOR,
		PORT_COLOR_DIM,
		ports_compatible
	} from "./workflow-types";
	import { resizeNode, workflow } from "./workflow-store";
	import NodeWidget from "./NodeWidget.svelte";

	interface Props {
		node: WFNode;
		pending: {
			from_node_id: string;
			from_port_id: string;
			type: PortType;
			x: number;
			y: number;
			reversed?: boolean;
		} | null;
		onstartconnection: (
			from_node_id: string,
			from_port_id: string,
			type: PortType,
			e: MouseEvent,
			reversed?: boolean
		) => void;
		oncompleteconnection: (
			to_node_id: string,
			to_port_id: string,
			to_type: PortType
		) => void;
		onmove: (id: string, x: number, y: number) => void;
		ondatachange: (
			nodeId: string,
			portId: string,
			value: NodeDataValue
		) => void;
		onremove: (id: string) => void;
		onautoconnect: (
			nodeId: string,
			portId: string,
			portType: PortType,
			side: "input" | "output"
		) => void;
		onopenpicker?: (nodeId: string) => void;
		connectedPorts: Set<string>;
		status: NodeStatus;
		error: string;
		zoom: number;
		selected: boolean;
		onselect: (id: string) => void;
	}

	let {
		node,
		pending,
		onstartconnection,
		oncompleteconnection,
		onmove,
		ondatachange,
		onremove,
		onautoconnect,
		onopenpicker,
		connectedPorts,
		status,
		error,
		zoom,
		selected,
		onselect
	}: Props = $props();

	let nodeEl: HTMLDivElement;
	let editingLabel = $state(false);
	let labelInput: HTMLInputElement;
	let showAllInputs = $state(false);

	const INPUT_COLLAPSE_THRESHOLD = 3;

	function renameNode(newLabel: string): void {
		const trimmed = newLabel.trim();
		if (trimmed && trimmed !== node.label) {
			workflow.update((wf) => ({
				...wf,
				nodes: wf.nodes.map((n) =>
					n.id === node.id ? { ...n, label: trimmed } : n
				)
			}));
		}
		editingLabel = false;
	}

	const primaryType: PortType =
		node.outputs[0]?.type ?? node.inputs[0]?.type ?? "any";
	const accentColor = PORT_COLOR[primaryType];
	const accentDim = PORT_COLOR_DIM[primaryType];

	// For "component" nodes, derive mode from whether the input port has an incoming edge.
	// If connected → output mode (readonly, displays results); otherwise → input mode (editable).
	const isComponent = node.kind === "component";
	const componentIsOutput =
		isComponent && node.inputs[0]
			? connectedPorts.has(`${node.id}:${node.inputs[0].id}:input`)
			: false;
	const mode = isComponent
		? componentIsOutput
			? "output"
			: "input"
		: node.kind;

	const hasWidget = mode === "input" || mode === "output";
	const widgetPortId =
		mode === "input"
			? (node.outputs[0]?.id ?? null)
			: mode === "output"
				? (node.inputs[0]?.id ?? null)
				: null;
	const widgetType: PortType | null =
		mode === "input"
			? (node.outputs[0]?.type ?? null)
			: mode === "output"
				? (node.inputs[0]?.type ?? null)
				: null;
	const isReadonly = mode === "output";

	function onHandleMouseDown(e: MouseEvent) {
		e.preventDefault();
		const startMouseX = e.clientX;
		const startMouseY = e.clientY;
		const startNodeX = node.x;
		const startNodeY = node.y;

		function onMove(ev: MouseEvent) {
			const dx = (ev.clientX - startMouseX) / zoom;
			const dy = (ev.clientY - startMouseY) / zoom;
			onmove(node.id, startNodeX + dx, startNodeY + dy);
		}
		function onUp() {
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
		}
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
	}

	function firstCompatibleInput(): (typeof node.inputs)[0] | null {
		if (!pending || pending.from_node_id === node.id) return null;
		return (
			node.inputs.find(
				(p) =>
					ports_compatible(pending.type, p.type) &&
					!connectedPorts.has(`${node.id}:${p.id}:input`)
			) ?? null
		);
	}

	const isDropTarget = $derived(
		pending !== null &&
			pending.from_node_id !== node.id &&
			node.inputs.some(
				(p) =>
					ports_compatible(pending.type, p.type) &&
					!connectedPorts.has(`${node.id}:${p.id}:input`)
			)
	);

	$effect(() => {
		if (!nodeEl) return;
		const ro = new ResizeObserver(([entry]) => {
			const h = Math.ceil(entry.borderBoxSize[0].blockSize);
			if (Math.abs(h - node.height) > 1) {
				resizeNode(node.id, node.width, h);
			}
		});
		ro.observe(nodeEl);
		return () => ro.disconnect();
	});
</script>

<div
	class="wf-node"
	class:node-running={status === "running"}
	class:node-done={status === "done"}
	class:node-error={status === "error"}
	class:node-selected={selected}
	class:node-droptarget={isDropTarget}
	class:has-pending={pending !== null}
	bind:this={nodeEl}
	onclick={() => onselect(node.id)}
	onmouseup={(e) => {
		const port = firstCompatibleInput();
		if (port) {
			e.stopPropagation();
			oncompleteconnection(node.id, port.id, port.type);
		}
	}}
	style="
		left: {node.x}px;
		top: {node.y}px;
		width: {node.width}px;
		--accent: {accentColor};
		--accent-dim: {accentDim};
	"
>
	<div
		class="node-header"
		role="button"
		tabindex="-1"
		onmousedown={onHandleMouseDown}
	>
		<div class="node-header-top">
			{#if status === "running"}
				<span class="node-status-spinner"></span>
			{/if}
			{#if editingLabel}
				<input
					bind:this={labelInput}
					class="node-label-input"
					value={node.label}
					onblur={(e) => renameNode(e.currentTarget.value)}
					onkeydown={(e) => {
						if (e.key === "Enter") renameNode(e.currentTarget.value);
						if (e.key === "Escape") editingLabel = false;
						e.stopPropagation();
					}}
					onmousedown={(e) => e.stopPropagation()}
				/>
			{:else}
				<span
					class="node-label"
					ondblclick={(e) => {
						e.stopPropagation();
						editingLabel = true;
						requestAnimationFrame(() => labelInput?.select());
					}}>{node.label}</span
				>
			{/if}
			<button
				class="node-delete"
				onmousedown={(e) => e.stopPropagation()}
				onclick={() => onremove(node.id)}
				title="Delete node">&times;</button
			>
		</div>
		{#if node.kind === "transform" && node.source === "space"}
			{#if node.space_id}
				<button
					class="source-badge source-badge-btn"
					title="Click to change model"
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => {
						e.stopPropagation();
						onopenpicker?.(node.id);
					}}
				>
					<span class="source-badge-text">{node.space_id}</span>
					<span class="source-badge-edit">✎</span>
				</button>
			{:else}
				<button
					class="source-badge source-badge-empty"
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => {
						e.stopPropagation();
						onopenpicker?.(node.id);
					}}
				>
					Search for a model...
				</button>
			{/if}
		{:else if node.source === "space" && node.space_id}
			<span class="source-badge">{node.space_id}</span>
		{/if}
	</div>

	<!-- Input ports -->
	{#if node.inputs.length > 0}
		{@const collapsible = node.inputs.length > INPUT_COLLAPSE_THRESHOLD}
		{@const hiddenCount = node.inputs.length - INPUT_COLLAPSE_THRESHOLD}
		<div class="ports" class:widget-ports={hasWidget}>
			{#each node.inputs as port, i}
				{@const portConnected = connectedPorts.has(
					`${node.id}:${port.id}:input`
				)}
				{@const visible =
					showAllInputs || i < INPUT_COLLAPSE_THRESHOLD || portConnected}
				{#if visible}
					<div class="port-row input-row" class:widget-port={hasWidget}>
						<span
							class="port-dot input-dot"
							class:port-optional={port.required === false}
							class:port-filled={port.required !== false}
							class:incompatible={pending !== null &&
								!ports_compatible(pending.type, port.type)}
							class:pulse={pending !== null &&
								ports_compatible(pending.type, port.type)}
							style="--port-color: {PORT_COLOR[port.type]}"
							data-port-id="{node.id}:{port.id}:input"
							role="button"
							tabindex="-1"
							onmousedown={(e) => {
								if (!pending) {
									e.stopPropagation();
									const sx = e.clientX,
										sy = e.clientY;
									let fired = false;
									function onMove(mv: MouseEvent) {
										if (
											!fired &&
											(Math.abs(mv.clientX - sx) > 4 ||
												Math.abs(mv.clientY - sy) > 4)
										) {
											fired = true;
											onstartconnection(node.id, port.id, port.type, mv, true);
										}
									}
									function onUp() {
										window.removeEventListener("mousemove", onMove);
										window.removeEventListener("mouseup", onUp);
									}
									window.addEventListener("mousemove", onMove);
									window.addEventListener("mouseup", onUp);
								}
							}}
							onmouseup={(e) => {
								e.stopPropagation();
								oncompleteconnection(node.id, port.id, port.type);
							}}
						></span>
						{#if !hasWidget}
							<span
								class="port-label"
								class:port-label-optional={port.required === false}
								>{port.label}</span
							>
							<span class="port-type-tag" style="color: {PORT_COLOR[port.type]}"
								>{port.type}</span
							>
						{/if}
					</div>
					{#if !portConnected && node.kind === "transform" && (port.type === "text" || port.type === "number" || port.type === "boolean" || port.type === "any" || port.type === "json")}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="port-inline-config"
							onmousedown={(e) => e.stopPropagation()}
						>
							{#if port.type === "number"}
								<input
									class="inline-input inline-number"
									type="number"
									step="any"
									placeholder={port.default_value != null
										? String(port.default_value)
										: "0"}
									value={node.data?.[port.id] ?? ""}
									oninput={(e) =>
										ondatachange(
											node.id,
											port.id,
											parseFloat(e.currentTarget.value) || 0
										)}
								/>
							{:else if port.type === "boolean"}
								<label class="inline-checkbox">
									<input
										type="checkbox"
										checked={!!node.data?.[port.id]}
										onchange={(e) =>
											ondatachange(node.id, port.id, e.currentTarget.checked)}
									/>
									<span>{node.data?.[port.id] ? "On" : "Off"}</span>
								</label>
							{:else}
								<input
									class="inline-input"
									type="text"
									placeholder={port.default_value != null
										? String(port.default_value)
										: port.label}
									value={typeof node.data?.[port.id] === "string"
										? node.data[port.id]
										: ""}
									oninput={(e) =>
										ondatachange(node.id, port.id, e.currentTarget.value)}
								/>
							{/if}
						</div>
					{/if}
				{/if}
			{/each}
			{#if collapsible}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<button
					class="ports-toggle"
					onmousedown={(e) => e.stopPropagation()}
					onclick={() => (showAllInputs = !showAllInputs)}
				>
					{#if showAllInputs}
						▴ show less
					{:else}
						▾ {hiddenCount} more params
					{/if}
				</button>
			{/if}
		</div>
	{/if}

	<!-- Widget zone for input/output nodes -->
	{#if hasWidget && widgetPortId && widgetType}
		<NodeWidget
			{node}
			{widgetPortId}
			{widgetType}
			{isReadonly}
			{ondatachange}
		/>
	{/if}

	<!-- Output ports -->
	{#if node.outputs.length > 0}
		<div class="ports" class:widget-ports={hasWidget}>
			{#each node.outputs as port}
				{@const portConnected = connectedPorts.has(
					`${node.id}:${port.id}:output`
				)}
				<div class="port-row output-row" class:widget-port={hasWidget}>
					{#if !hasWidget}
						<span class="port-type-tag" style="color: {PORT_COLOR[port.type]}"
							>{port.type}</span
						>
						<span class="port-label">{port.label}</span>
					{/if}
					<span
						class="port-dot output-dot"
						style="--port-color: {PORT_COLOR[port.type]}"
						data-port-id="{node.id}:{port.id}:output"
						role="button"
						tabindex="-1"
						onmousedown={(e) =>
							onstartconnection(node.id, port.id, port.type, e)}
					></span>
				</div>
			{/each}
		</div>
	{/if}

	{#if status === "error" && error}
		<div class="node-error-banner">
			{error}
		</div>
	{/if}
</div>

<style>
	.wf-node {
		position: absolute;
		background: #16171f;
		border: 1px solid #24252e;
		border-radius: 10px;
		min-height: 90px;
		user-select: none;
		font-family: "Manrope", sans-serif;
		overflow: visible;
		transition:
			box-shadow 0.2s,
			border-color 0.3s;
		box-sizing: border-box;
		z-index: 1;
	}

	.wf-node:hover {
		z-index: 2;
		box-shadow:
			0 0 0 1px var(--accent-dim),
			0 4px 20px rgba(0, 0, 0, 0.4);
	}

	.wf-node.node-selected {
		border-color: #f97316;
		box-shadow:
			0 0 0 1px #f97316,
			0 0 16px rgba(249, 115, 22, 0.15);
		z-index: 3;
	}

	.wf-node.node-droptarget {
		border-color: var(--accent);
		box-shadow:
			0 0 0 1px var(--accent),
			0 0 20px var(--accent-dim);
	}

	.wf-node.node-running {
		border-color: #f5a623;
		box-shadow: 0 0 12px rgba(245, 166, 35, 0.2);
	}

	.wf-node.node-done {
		border-color: #4fd1a5;
		box-shadow: 0 0 12px rgba(79, 209, 165, 0.15);
	}

	.wf-node.node-error {
		border-color: #ef4444;
		box-shadow: 0 0 12px rgba(239, 68, 68, 0.15);
	}

	.node-status-spinner {
		width: 12px;
		height: 12px;
		border: 2px solid transparent;
		border-top-color: #f5a623;
		border-radius: 50%;
		animation: node-spin 0.7s linear infinite;
		flex-shrink: 0;
	}

	@keyframes node-spin {
		to {
			transform: rotate(360deg);
		}
	}

	.node-status-check {
		font-size: 11px;
		color: #4fd1a5;
		flex-shrink: 0;
	}

	.node-status-error {
		font-size: 11px;
		color: #ef4444;
		cursor: help;
		flex-shrink: 0;
	}

	.node-header {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 9px 12px 8px;
		cursor: grab;
		border-bottom: 1px solid #1e1f2a;
	}

	.node-header:active {
		cursor: grabbing;
	}

	.node-header-top {
		display: flex;
		align-items: center;
		gap: 7px;
	}

	.node-label {
		font-size: 12.5px;
		font-weight: 600;
		color: #d5d6de;
		white-space: nowrap;
		cursor: text;
		flex: 1;
		min-width: 0;
		overflow: hidden;
		padding: 1px 4px;
		border: 1px solid transparent;
		border-radius: 4px;
		box-sizing: border-box;
		mask-image: linear-gradient(
			to right,
			black calc(100% - 24px),
			transparent 100%
		);
		-webkit-mask-image: linear-gradient(
			to right,
			black calc(100% - 24px),
			transparent 100%
		);
	}

	.node-label-input {
		font-family: "Manrope", sans-serif;
		font-size: 12.5px;
		font-weight: 600;
		color: #d5d6de;
		background: #101118;
		border: 1px solid #f97316;
		border-radius: 4px;
		padding: 1px 4px;
		outline: none;
		width: 100%;
		min-width: 0;
		box-sizing: border-box;
	}

	.source-badge {
		font-family: "JetBrains Mono", monospace;
		font-size: 8px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 3px;
		background: #1e1f2a;
		color: #5c5e6a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		text-decoration: none;
		transition:
			color 0.15s,
			background 0.15s;
		align-self: flex-start;
	}

	.source-badge:hover {
		color: #c8c9d2;
		background: #2a2b36;
	}

	.source-badge-btn {
		display: flex;
		align-items: center;
		gap: 4px;
		border: none;
		cursor: pointer;
		max-width: 100%;
	}

	.source-badge-text {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.source-badge-edit {
		font-size: 9px;
		opacity: 0;
		transition: opacity 0.15s;
		flex-shrink: 0;
	}

	.source-badge-btn:hover .source-badge-edit {
		opacity: 1;
	}

	.source-badge-empty {
		border: 1px dashed #2a2b36;
		background: transparent;
		color: #3e4050;
		cursor: pointer;
		font-size: 9px;
	}

	.source-badge-empty:hover {
		border-color: #f97316;
		color: #f97316;
		background: rgba(249, 115, 22, 0.06);
	}

	.node-delete {
		display: none;
		width: 20px;
		height: 20px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #5c5e6a;
		font-size: 12px;
		cursor: pointer;
		flex-shrink: 0;
		margin-left: auto;
		align-items: center;
		justify-content: center;
		padding: 0;
		text-align: center;
		margin-left: auto;
		padding: 0;
	}

	.wf-node:hover .node-delete {
		display: flex;
	}

	.node-delete:hover {
		background: rgba(239, 68, 68, 0.15);
		color: #ef4444;
	}

	.ports {
		padding: 6px 0 8px;
	}

	.ports.widget-ports {
		padding: 0;
	}

	.port-row.widget-port {
		padding: 0;
		min-height: 0;
		position: static;
	}

	.port-row {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 4px 12px;
		position: relative;
		min-height: 22px;
	}

	.input-row {
		padding-left: 20px;
	}

	.output-row {
		justify-content: flex-end;
		padding-right: 20px;
	}

	.port-label {
		font-size: 11.5px;
		font-weight: 500;
		color: #8b8d98;
		white-space: nowrap;
	}

	.port-type-tag {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		font-weight: 500;
		opacity: 0.5;
	}

	.port-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid var(--port-color);
		background: #0c0d10;
		cursor: crosshair;
		flex-shrink: 0;
		opacity: 0;
		transition:
			opacity 0.15s,
			transform 0.15s,
			background 0.15s,
			border-color 0.15s,
			box-shadow 0.15s;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
	}

	.wf-node:hover .port-dot,
	.node-selected .port-dot,
	.has-pending .port-dot {
		opacity: 1;
	}

	.input-dot {
		left: -24px;
	}

	.output-dot {
		right: -24px;
		border-radius: 2px;
		transform: translateY(-50%) rotate(45deg);
	}

	.port-filled {
		background: var(--port-color);
		box-shadow: 0 0 6px var(--port-color);
	}

	.port-optional {
		background: transparent;
		opacity: 0.5;
	}

	.port-label-optional {
		opacity: 0.5;
	}

	.port-dot:hover {
		transform: translateY(-50%) scale(1.4);
		background: var(--port-color);
		box-shadow: 0 0 6px var(--port-color);
	}

	.output-dot:hover {
		transform: translateY(-50%) rotate(45deg) scale(1.4);
	}

	.port-dot.pulse {
		animation: port-pulse 1s ease-in-out infinite;
	}

	.port-dot.incompatible {
		border-color: #ef4444;
		opacity: 0.4;
		animation: none;
	}

	:global(.port-snap) {
		animation: port-snap-anim 0.4s ease-out !important;
	}

	@keyframes port-snap-anim {
		0% {
			transform: translateY(-50%) scale(2);
			background: var(--port-color);
			box-shadow: 0 0 12px var(--port-color);
		}
		100% {
			transform: translateY(-50%) scale(1);
		}
	}

	@keyframes port-pulse {
		0%,
		100% {
			box-shadow: 0 0 0 0 transparent;
		}
		50% {
			box-shadow: 0 0 0 4px var(--port-color);
			opacity: 0.3;
		}
	}

	.node-error-banner {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #fca5a5;
		background: rgba(239, 68, 68, 0.1);
		border-top: 1px solid rgba(239, 68, 68, 0.2);
		border-radius: 0 0 10px 10px;
		padding: 6px 12px;
		line-height: 1.4;
		word-break: break-word;
		overflow: hidden;
		max-height: 4.5em;
		overflow-y: auto;
	}

	.ports-toggle {
		display: block;
		width: 100%;
		padding: 4px 12px;
		border: none;
		background: transparent;
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		font-weight: 600;
		color: #3e3f4d;
		cursor: pointer;
		text-align: left;
		letter-spacing: 0.03em;
		transition: color 0.15s;
	}

	.ports-toggle:hover {
		color: #8b8d98;
	}

	/* ─── Inline Config ─── */
	.port-inline-config {
		padding: 2px 12px 4px 20px;
	}

	.inline-input {
		width: 100%;
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		padding: 4px 8px;
		border: 1px solid #1e1f2a;
		border-radius: 4px;
		background: #101118;
		color: #c8c9d2;
		outline: none;
		box-sizing: border-box;
	}

	.inline-input:focus {
		border-color: #3e3f4d;
	}

	.inline-input::placeholder {
		color: #4a4b58;
	}

	.inline-number {
		width: 80px;
	}

	.inline-checkbox {
		display: flex;
		align-items: center;
		gap: 6px;
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #8b8d98;
		cursor: pointer;
	}

	/* ─── Light mode ─── */
	:global(body:not(.dark)) .wf-node {
		background: #ffffff;
		border-color: #e2e4ea;
	}

	:global(body:not(.dark)) .wf-node:hover {
		box-shadow:
			0 0 0 1px var(--accent-dim),
			0 4px 20px rgba(0, 0, 0, 0.08);
	}

	:global(body:not(.dark)) .node-header {
		border-bottom-color: #e2e4ea;
	}

	:global(body:not(.dark)) .node-label {
		color: #1a1b25;
	}

	:global(body:not(.dark)) .node-label-input {
		color: #1a1b25;
		background: #ffffff;
	}

	:global(body:not(.dark)) .port-dot {
		background: #ffffff;
	}

	:global(body:not(.dark)) .port-label {
		color: #6b6e78;
	}

	:global(body:not(.dark)) .source-badge {
		background: #f0f1f5;
		color: #8b8d98;
	}

	:global(body:not(.dark)) .source-badge:hover {
		color: #1a1b25;
		background: #e2e4ea;
	}

	:global(body:not(.dark)) .ports-toggle {
		color: #b0b2bc;
	}

	:global(body:not(.dark)) .ports-toggle:hover {
		color: #6b6e78;
	}

	:global(body:not(.dark)) .node-delete {
		color: #9a9caa;
	}

	:global(body:not(.dark)) .inline-input {
		background: #f8f9fb;
		border-color: #e2e4ea;
		color: #1a1b25;
	}

	:global(body:not(.dark)) .inline-input:focus {
		border-color: #b0b2bc;
	}

	:global(body:not(.dark)) .inline-input::placeholder {
		color: #c0c2cc;
	}

	:global(body:not(.dark)) .inline-checkbox {
		color: #6b6e78;
	}
</style>
