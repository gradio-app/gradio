<script lang="ts">
	import type {
		WFNode,
		PortType,
		NodeDataValue,
		NodeStatus
	} from "./workflow-types";
	import { PORT_COLOR, PORT_COLOR_DIM, KIND_LABEL } from "./workflow-types";
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
		} | null;
		onstartconnection: (
			from_node_id: string,
			from_port_id: string,
			type: PortType,
			e: MouseEvent
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

	function compatible(a: PortType, b: PortType): boolean {
		return a === "any" || b === "any" || a === b;
	}

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
	bind:this={nodeEl}
	onclick={() => onselect(node.id)}
	style="
		left: {node.x}px;
		top: {node.y}px;
		width: {node.width}px;
		--accent: {accentColor};
		--accent-dim: {accentDim};
	"
>
	<div class="node-top-accent"></div>

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
			<span class="kind-tag"
				>{KIND_LABEL[mode] ?? KIND_LABEL[node.kind] ?? "?"}</span
			>
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
		{#if node.source === "space" && node.space_id}
			<a
				class="source-badge"
				href="https://huggingface.co/spaces/{node.space_id}"
				target="_blank"
				rel="noopener"
				title={node.space_id}
				onmousedown={(e) => e.stopPropagation()}>{node.space_id}</a
			>
		{/if}
	</div>

	<!-- Input ports -->
	{#if node.inputs.length > 0}
		{@const collapsible = node.inputs.length > INPUT_COLLAPSE_THRESHOLD}
		{@const hiddenCount = node.inputs.length - INPUT_COLLAPSE_THRESHOLD}
		<div class="ports">
			{#each node.inputs as port, i}
				{@const portConnected = connectedPorts.has(
					`${node.id}:${port.id}:input`
				)}
				{@const visible =
					showAllInputs || i < INPUT_COLLAPSE_THRESHOLD || portConnected}
				{#if visible}
					<div class="port-row input-row">
						{#if !portConnected && !pending}
							<button
								class="port-auto-btn"
								style="--port-color: {PORT_COLOR[port.type]}"
								onmousedown={(e) => e.stopPropagation()}
								onclick={() =>
									onautoconnect(node.id, port.id, port.type, "input")}
								title="Add {port.type} input">+</button
							>
						{/if}
						<span
							class="port-dot input-dot"
							class:port-optional={port.required === false}
							class:port-filled={port.required !== false}
							class:incompatible={pending !== null &&
								!compatible(pending.type, port.type)}
							class:pulse={pending !== null &&
								compatible(pending.type, port.type)}
							style="--port-color: {PORT_COLOR[port.type]}"
							data-port-id="{node.id}:{port.id}:input"
							role="button"
							tabindex="-1"
							onmouseup={() =>
								oncompleteconnection(node.id, port.id, port.type)}
						></span>
						<span
							class="port-label"
							class:port-label-optional={port.required === false}
							>{port.label}</span
						>
						<span class="port-type-tag" style="color: {PORT_COLOR[port.type]}"
							>{port.type}</span
						>
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
		<div class="ports">
			{#each node.outputs as port}
				{@const portConnected = connectedPorts.has(
					`${node.id}:${port.id}:output`
				)}
				<div class="port-row output-row">
					<span class="port-type-tag" style="color: {PORT_COLOR[port.type]}"
						>{port.type}</span
					>
					<span class="port-label">{port.label}</span>
					<span
						class="port-dot output-dot"
						style="--port-color: {PORT_COLOR[port.type]}"
						data-port-id="{node.id}:{port.id}:output"
						role="button"
						tabindex="-1"
						onmousedown={(e) =>
							onstartconnection(node.id, port.id, port.type, e)}
					></span>
					{#if !portConnected && !pending}
						<button
							class="port-auto-btn"
							style="--port-color: {PORT_COLOR[port.type]}"
							onmousedown={(e) => e.stopPropagation()}
							onclick={() =>
								onautoconnect(node.id, port.id, port.type, "output")}
							title="Add {port.type} output">+</button
						>
					{/if}
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
		overflow: hidden;
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

	.node-top-accent {
		height: 2px;
		background: linear-gradient(90deg, var(--accent), transparent);
		opacity: 0.7;
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

	.kind-tag {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.06em;
		padding: 2px 5px;
		border-radius: 3px;
		background: var(--accent-dim);
		color: var(--accent);
		line-height: 1;
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

	.port-auto-btn {
		display: none;
		width: 16px;
		height: 16px;
		border: 1px solid var(--port-color);
		border-radius: 3px;
		background: transparent;
		color: var(--port-color);
		font-size: 12px;
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		padding: 0;
		flex-shrink: 0;
		opacity: 0.6;
		transition:
			opacity 0.15s,
			background 0.15s;
	}

	.wf-node:hover .port-auto-btn {
		display: flex;
	}

	.port-auto-btn:hover {
		opacity: 1;
		background: var(--port-color);
		color: #0c0d10;
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

	.port-row {
		display: flex;
		align-items: center;
		gap: 7px;
		padding: 4px 12px;
	}

	.output-row {
		justify-content: flex-end;
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
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 2px solid var(--port-color);
		background: #16171f;
		cursor: crosshair;
		flex-shrink: 0;
		transition:
			transform 0.15s,
			background 0.15s,
			border-color 0.15s,
			box-shadow 0.15s;
		position: relative;
	}

	.port-filled {
		background: var(--port-color);
	}

	.port-optional {
		background: transparent;
		opacity: 0.5;
	}

	.port-label-optional {
		opacity: 0.5;
	}

	.output-dot {
		border-radius: 2px;
		transform: rotate(45deg);
	}

	.port-dot:hover {
		transform: scale(1.4);
		background: var(--port-color);
		box-shadow: 0 0 6px var(--port-color);
	}

	.output-dot:hover {
		transform: rotate(45deg) scale(1.4);
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
			transform: scale(2);
			background: var(--port-color);
			box-shadow: 0 0 12px var(--port-color);
		}
		100% {
			transform: scale(1);
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
		padding: 2px 12px 4px 30px;
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
</style>
