<script lang="ts">
	import { getContext } from "svelte";
	import { resizeNode, workflow } from "./workflow-store";
	import NodeWidget from "./NodeWidget.svelte";
	import { PORT_COLOR, PORT_COLOR_DIM } from "./workflow-types";
	import type { WFNode, PortType, NodeDataValue, NodeStatus } from "./workflow-types";

	interface Props {
		id: string;
		data: WFNode;
		selected?: boolean;
	}

	let { id, data: node, selected = false }: Props = $props();

	interface WfCtx {
		pending: {
			from_node_id: string;
			from_port_id: string;
			type: PortType;
			reversed?: boolean;
		} | null;
		nodeStatus: Record<string, NodeStatus>;
		nodeErrors: Record<string, string>;
		staleNodes: Set<string>;
		connectedPorts: Set<string>;
		ondatachange: (nodeId: string, portId: string, value: NodeDataValue) => void;
		onremove: (id: string) => void;
		onopenpicker: (id: string) => void;
		onrunnode: (id: string) => void;
		onselect: (id: string) => void;
		onnodepointerdown: (e: PointerEvent, id: string) => void;
		onportpointerdown: (
			e: PointerEvent,
			nodeId: string,
			portId: string,
			type: PortType,
			isInput: boolean
		) => void;
	}

	const ctx = getContext<WfCtx>("wf");

	const pending = $derived(ctx.pending);
	const status = $derived((ctx.nodeStatus[id] ?? "idle") as NodeStatus);
	const error = $derived(ctx.nodeErrors[id] ?? "");
	const isStale = $derived(ctx.staleNodes.has(id));
	const connectedPorts = $derived(ctx.connectedPorts);
	// Only operator nodes have meaningful per-node execution. References just
	// hold values; subjects just display passthrough.
	const canRunSolo = $derived(node.kind === "transform");

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
				nodes: wf.nodes.map((n) => (n.id === node.id ? { ...n, label: trimmed } : n))
			}));
		}
		editingLabel = false;
	}

	const primaryType = $derived<PortType>(node.outputs[0]?.type ?? node.inputs[0]?.type ?? "any");
	const accentColor = $derived(PORT_COLOR[primaryType]);
	const accentDim = $derived(PORT_COLOR_DIM[primaryType]);

	const isComponent = $derived(node.kind === "component");
	const componentIsOutput = $derived(
		isComponent && node.inputs[0]
			? connectedPorts.has(`${node.id}:${node.inputs[0].id}:input`)
			: false
	);
	const mode = $derived(
		isComponent ? (componentIsOutput ? "output" : "input") : node.kind
	);

	const hasWidget = $derived(mode === "input" || mode === "output");
	const widgetPortId = $derived(
		mode === "input"
			? (node.outputs[0]?.id ?? null)
			: mode === "output"
				? (node.inputs[0]?.id ?? null)
				: null
	);
	const widgetType = $derived<PortType | null>(
		mode === "input"
			? (node.outputs[0]?.type ?? null)
			: mode === "output"
				? (node.inputs[0]?.type ?? null)
				: null
	);
	const isReadonly = $derived(mode === "output");

	function compatible(a: PortType, b: PortType): boolean {
		return a === "any" || b === "any" || a === b;
	}

	function sourceHFUrl(n: WFNode): string {
		if (n.space_id) return `https://huggingface.co/spaces/${n.space_id}`;
		if (n.model_id) return `https://huggingface.co/${n.model_id}`;
		if (n.dataset_id) return `https://huggingface.co/datasets/${n.dataset_id}`;
		return "";
	}

	const isDropTarget = $derived(
		pending !== null &&
			pending.from_node_id !== node.id &&
			node.inputs.some(
				(p) =>
					compatible(pending.type, p.type) &&
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
	class:node-transform={node.kind === "transform"}
	class:node-running={status === "running"}
	class:node-done={status === "done"}
	class:node-error={status === "error"}
	class:node-stale={isStale}
	class:node-selected={selected}
	class:node-droptarget={isDropTarget}
	class:has-pending={pending !== null}
	bind:this={nodeEl}
	onclick={() => ctx.onselect(node.id)}
	style="
		width: {node.width}px;
		--accent: {accentColor};
		--accent-dim: {accentDim};
	"
>
	<div class="node-header" role="button" tabindex="-1">
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
			{#if canRunSolo}
				<button
					class="node-run"
					class:node-run-stale={isStale}
					onpointerdown={(e) => e.stopPropagation()}
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => { e.stopPropagation(); ctx.onrunnode(node.id); }}
					title={isStale ? "Run this node (inputs changed)" : "Run this node"}
					aria-label="Run this node"
				>
					<svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor" aria-hidden="true">
						<path d="M0 0l9 5-9 5V0z"/>
					</svg>
				</button>
			{/if}
			<button
				class="node-delete"
				onpointerdown={(e) => e.stopPropagation()}
				onmousedown={(e) => e.stopPropagation()}
				onclick={(e) => { e.stopPropagation(); ctx.onremove(node.id); }}
				title="Delete node">&times;</button
			>
		</div>
	</div>

	<!-- Source label for transform nodes — floats above the card.
	     Components are pure data containers and have no source label. -->
	{#if node.kind === "transform"}
		{#if node.space_id || node.model_id || node.dataset_id}
			{@const itemId = node.space_id ?? node.model_id ?? node.dataset_id ?? ""}
			<div class="node-outside-label-wrap">
				<button
					class="node-outside-label"
					title="Click to change source"
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => { e.stopPropagation(); ctx.onopenpicker(node.id); }}
				>{itemId.split("/").pop() ?? itemId}</button>
				<a
					class="node-outside-link"
					href={sourceHFUrl(node)}
					target="_blank"
					rel="noopener noreferrer"
					title="Open on HuggingFace"
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => e.stopPropagation()}
					aria-label="Open on HuggingFace"
				>
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
						<path d="M5 2H3.5A1.5 1.5 0 0 0 2 3.5v5A1.5 1.5 0 0 0 3.5 10h5A1.5 1.5 0 0 0 10 8.5V7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
						<path d="M7 2h3v3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M10 2L5.5 6.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
					</svg>
				</a>
			</div>
		{:else}
			<button
				class="node-outside-label node-outside-label-empty"
				onmousedown={(e) => e.stopPropagation()}
				onclick={(e) => { e.stopPropagation(); ctx.onopenpicker(node.id); }}
			>+ source</button>
		{/if}
	{/if}

	<!-- Input ports -->
	{#if node.inputs.length > 0}
		{@const collapsible = node.inputs.length > INPUT_COLLAPSE_THRESHOLD}
		<div class="ports" class:widget-ports={hasWidget}>
			{#each node.inputs as port, i}
				{@const portConnected = connectedPorts.has(`${node.id}:${port.id}:input`)}
				{@const visible = showAllInputs || i < INPUT_COLLAPSE_THRESHOLD || portConnected}
				{#if visible}
					<div class="port-row input-row" class:widget-port={hasWidget}>
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="port-handle-sf input-handle-sf"
							class:connected={portConnected}
							class:incompatible={pending !== null && !compatible(pending.type, port.type)}
							class:pulse={pending !== null && compatible(pending.type, port.type)}
							data-node-id={node.id}
							data-port-id={port.id}
							data-port-type={port.type}
							data-port-direction="input"
							style="--port-color: {PORT_COLOR[port.type]}"
							onpointerdown={(e) => ctx.onportpointerdown(e, node.id, port.id, port.type, true)}
						></div>
						{#if !hasWidget}
							<span class="port-label" class:port-label-optional={port.required === false}
								>{port.label}</span
							>
							<span class="port-type-tag" style="color: {PORT_COLOR[port.type]}"
								>{port.type}</span
							>
						{/if}
					</div>
					{#if !portConnected && node.kind === "transform" && (port.type === "text" || port.type === "number" || port.type === "boolean" || port.type === "any" || port.type === "json")}
						<div class="port-inline-config" onmousedown={(e) => e.stopPropagation()}>
							{#if port.type === "number"}
								<input
									class="inline-input inline-number"
									type="number"
									step="any"
									placeholder={port.default_value != null ? String(port.default_value) : "0"}
									value={node.data?.[port.id] ?? ""}
									oninput={(e) =>
										ctx.ondatachange(node.id, port.id, parseFloat(e.currentTarget.value) || 0)}
								/>
							{:else if port.type === "boolean"}
								<label class="inline-checkbox">
									<input
										type="checkbox"
										checked={!!node.data?.[port.id]}
										onchange={(e) => ctx.ondatachange(node.id, port.id, e.currentTarget.checked)}
									/>
									<span>{node.data?.[port.id] ? "On" : "Off"}</span>
								</label>
							{:else}
								<input
									class="inline-input"
									type="text"
									placeholder={port.default_value != null ? String(port.default_value) : port.label}
									value={typeof node.data?.[port.id] === "string" ? node.data[port.id] as string : ""}
									oninput={(e) => ctx.ondatachange(node.id, port.id, e.currentTarget.value)}
								/>
							{/if}
						</div>
					{/if}
				{/if}
			{/each}
			{#if collapsible}
				<button
					class="ports-toggle"
					onmousedown={(e) => e.stopPropagation()}
					onclick={() => (showAllInputs = !showAllInputs)}
				>
					{#if showAllInputs}▴ show less{:else}▾ {node.inputs.length - INPUT_COLLAPSE_THRESHOLD} more params{/if}
				</button>
			{/if}
		</div>
	{/if}

	<!-- Widget zone -->
	{#if hasWidget && widgetPortId && widgetType}
		<NodeWidget {node} {widgetPortId} {widgetType} {isReadonly} ondatachange={ctx.ondatachange} />
	{/if}

	<!-- Output ports -->
	{#if node.outputs.length > 0}
		<div class="ports" class:widget-ports={hasWidget}>
			{#each node.outputs as port}
				{@const portConnected = connectedPorts.has(`${node.id}:${port.id}:output`)}
				<div class="port-row output-row" class:widget-port={hasWidget}>
					{#if !hasWidget}
						<span class="port-type-tag" style="color: {PORT_COLOR[port.type]}">{port.type}</span>
						<span class="port-label">{port.label}</span>
					{/if}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="port-handle-sf output-handle-sf"
						class:connected={portConnected}
						data-node-id={node.id}
						data-port-id={port.id}
						data-port-type={port.type}
						data-port-direction="output"
						style="--port-color: {PORT_COLOR[port.type]}"
						onpointerdown={(e) => ctx.onportpointerdown(e, node.id, port.id, port.type, false)}
					></div>
				</div>
			{/each}
		</div>
	{/if}

	{#if status === "error" && error}
		<div class="node-error-banner">{error}</div>
	{/if}
</div>

<style>
	/* Prevent SvelteFlow from adding its own drag cursor while we use the node header */
	.wf-node {
		position: relative;
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
	}

	/* Space/transform nodes get a subtle top accent to distinguish from component nodes */
	.wf-node.node-transform {
		background: #13141c;
		border-color: #2a2b38;
	}

	.wf-node.node-transform .node-header {
		border-bottom-color: #22233a;
	}

	.wf-node:hover {
		box-shadow:
			0 0 0 1px var(--accent-dim),
			0 4px 20px rgba(0, 0, 0, 0.4);
	}

	.wf-node.node-selected {
		border-color: #f97316;
		box-shadow:
			0 0 0 1px #f97316,
			0 0 16px rgba(249, 115, 22, 0.15);
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

	/* Stale: ran successfully, but inputs have since changed. Subtle dashed
	 * outline so the user knows the displayed output no longer reflects
	 * current upstream state. Overridden by running/error which are stronger
	 * signals. */
	.wf-node.node-stale:not(.node-running):not(.node-error) {
		border-color: #f97316;
		border-style: dashed;
		box-shadow: 0 0 10px rgba(249, 115, 22, 0.12);
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
		to { transform: rotate(360deg); }
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
		mask-image: linear-gradient(to right, black calc(100% - 24px), transparent 100%);
		-webkit-mask-image: linear-gradient(to right, black calc(100% - 24px), transparent 100%);
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

	.node-outside-label-wrap {
		position: absolute;
		bottom: calc(100% + 6px);
		/* Anchor to the card's right edge; label sits to the LEFT of the
		 * open-link icon with a small gap. */
		right: 0;
		display: flex;
		align-items: center;
		gap: 6px;
		pointer-events: auto;
	}

	.node-outside-label {
		position: absolute;
		bottom: calc(100% + 6px);
		right: 12px;
		white-space: nowrap;
		font-family: "Manrope", sans-serif;
		font-size: 11.5px;
		font-weight: 500;
		color: #6b6e78;
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		transition: color 0.15s;
		pointer-events: auto;
	}

	.node-outside-label-wrap .node-outside-label {
		position: static;
		bottom: auto;
		right: auto;
	}

	.node-outside-label:hover {
		color: #c8c9d2;
	}

	.node-outside-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
		color: #4a4d57;
		opacity: 0;
		text-decoration: none;
		border-radius: 3px;
		transition: opacity 0.15s, color 0.15s, background 0.15s;
		flex-shrink: 0;
	}

	.wf-node:hover .node-outside-link,
	.node-outside-label-wrap:focus-within .node-outside-link {
		opacity: 1;
	}

	.node-outside-link:hover {
		color: #f97316;
		background: rgba(249, 115, 22, 0.08);
	}

	.node-outside-label-empty {
		color: #3a3b47;
		font-size: 10.5px;
	}

	.node-outside-label-empty:hover {
		color: #f97316;
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
	}

	.wf-node:hover .node-delete {
		display: flex;
	}

	.node-delete:hover {
		background: rgba(239, 68, 68, 0.15);
		color: #ef4444;
	}

	/* Per-node run button — hidden by default, revealed on hover, mirrors
	 * the node-delete affordance pattern. Stale state pulses faintly to
	 * signal "this needs re-running". */
	.node-run {
		display: none;
		width: 20px;
		height: 20px;
		margin-left: auto;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #5c5e6a;
		cursor: pointer;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		padding: 0;
	}

	.wf-node:hover .node-run {
		display: flex;
	}

	.node-run + .node-delete {
		margin-left: 2px;
	}

	.node-run:hover {
		background: rgba(249, 115, 22, 0.18);
		color: #f97316;
	}

	.node-run.node-run-stale {
		display: flex;
		color: #f97316;
		animation: node-run-pulse 1.8s ease-in-out infinite;
	}

	@keyframes node-run-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.55; }
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

	.port-label-optional {
		opacity: 0.5;
	}

	.port-type-tag {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		font-weight: 500;
		opacity: 0.5;
	}

	/* Port handles (plain divs, positioned on each port-row) */
	.port-handle-sf {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 2px solid var(--port-color);
		background: #0c0d10;
		cursor: crosshair;
		opacity: 0.5;
		transition: opacity 0.15s, transform 0.15s, background 0.15s, box-shadow 0.15s;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		touch-action: none;
	}

	.wf-node:hover .port-handle-sf,
	.wf-node.node-selected .port-handle-sf,
	.wf-node.has-pending .port-handle-sf {
		opacity: 1;
	}

	.port-handle-sf.incompatible {
		border-color: #ef4444;
		opacity: 0.4;
		animation: none;
	}

	.port-handle-sf.connected {
		background: var(--port-color);
		opacity: 1;
	}

	.input-handle-sf {
		left: -24px;
		right: auto;
	}

	.output-handle-sf {
		right: -24px;
		left: auto;
		border-radius: 2px;
		transform: translateY(-50%) rotate(45deg);
	}

	.port-handle-sf:hover {
		opacity: 1;
		background: var(--port-color);
		box-shadow: 0 0 6px var(--port-color);
	}

	.output-handle-sf:hover {
		transform: translateY(-50%) rotate(45deg) scale(1.4);
	}

	.port-handle-sf.pulse {
		animation: port-pulse 1s ease-in-out infinite;
	}

	@keyframes port-pulse {
		0%, 100% { box-shadow: 0 0 0 0 transparent; }
		50% { box-shadow: 0 0 0 4px var(--port-color); opacity: 0.3; }
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

	/* Light mode */
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

	:global(body:not(.dark)) .port-label {
		color: #6b6e78;
	}

	:global(body:not(.dark)) .node-outside-label {
		color: #9a9caa;
	}

	:global(body:not(.dark)) .node-outside-label:hover {
		color: #1a1b25;
	}

	:global(body:not(.dark)) .node-outside-label-empty {
		color: #c0c2cc;
	}

	:global(body:not(.dark)) .ports-toggle {
		color: #b0b2bc;
	}

	:global(body:not(.dark)) .node-delete {
		color: #9a9caa;
	}

	:global(body:not(.dark)) .port-handle-sf {
		background: #ffffff;
	}

	:global(body:not(.dark)) .inline-input {
		background: #f8f9fb;
		border-color: #e2e4ea;
		color: #1a1b25;
	}

	:global(body:not(.dark)) .inline-input::placeholder {
		color: #c0c2cc;
	}

	:global(body:not(.dark)) .inline-checkbox {
		color: #6b6e78;
	}
</style>
