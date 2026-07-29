<script lang="ts">
	import { getContext } from "svelte";
	import { resizeNode, workflow } from "./workflow-store";
	import NodeWidget from "./NodeWidget.svelte";
	import PlayIcon from "./icons/PlayIcon.svelte";
	import OpenLinkIcon from "./icons/OpenLinkIcon.svelte";
	import {
		PORT_COLOR,
		PORT_COLOR_DIM,
		ports_compatible
	} from "./workflow-types";
	import type {
		WFNode,
		PortType,
		NodeDataValue,
		NodeStatus
	} from "./workflow-types";

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
		nodeDurations: Record<string, number>;
		staleNodes: Set<string>;
		connectedPorts: Set<string>;
		readOnly: boolean;
		ondatachange: (
			nodeId: string,
			portId: string,
			value: NodeDataValue
		) => void;
		onremove: (id: string) => void;
		onopenpicker: (id: string) => void;
		onswitchendpoint: (id: string, endpointName: string) => void;
		onhydratendpoints: (id: string, spaceId: string) => void;
		onrunnode: (id: string) => void;
		onselect: (id: string, additive?: boolean) => void;
		onnodepointerdown: (e: PointerEvent, id: string) => void;
		onportpointerdown: (
			e: PointerEvent,
			nodeId: string,
			portId: string,
			type: PortType,
			isInput: boolean
		) => void;
		onpopout: (
			nodeId: string,
			portId: string,
			type: PortType,
			isInput: boolean
		) => void;
	}

	const ctx = getContext<WfCtx>("wf");

	const pending = $derived(ctx.pending);
	const readOnly = $derived(ctx.readOnly);
	const status = $derived((ctx.nodeStatus[id] ?? "idle") as NodeStatus);
	const error = $derived(ctx.nodeErrors[id] ?? "");
	const isStale = $derived(ctx.staleNodes.has(id));
	const connectedPorts = $derived(ctx.connectedPorts);
	// Only operator nodes have meaningful per-node execution. References just
	// hold values; subjects just display passthrough.
	const canRunSolo = $derived(node.kind === "transform");
	const duration = $derived(ctx.nodeDurations[id] as number | undefined);

	function formatDuration(seconds: number): string {
		if (seconds >= 10) return `${Math.round(seconds)}s`;
		if (seconds >= 1) return `${seconds.toFixed(1)}s`;
		return `${parseFloat(seconds.toFixed(2))}s`;
	}

	let nodeEl: HTMLDivElement;
	let editingLabel = $state(false);
	let labelInput: HTMLInputElement;
	let showAllInputs = $state(false);
	let errorExpanded = $state(false);
	$effect(() => {
		if (!error) errorExpanded = false;
	});

	function castChoiceValue(v: string, portType: PortType): NodeDataValue {
		if (portType === "number") {
			const n = Number(v);
			return Number.isNaN(n) ? v : n;
		}
		if (portType === "boolean") {
			if (v === "true") return true;
			if (v === "false") return false;
		}
		return v;
	}

	function renameNode(newLabel: string): void {
		const trimmed = newLabel.trim();
		if (!readOnly && trimmed && trimmed !== node.label) {
			workflow.update((wf) => ({
				...wf,
				references: wf.references.map((n) =>
					n.id === node.id ? { ...n, label: trimmed } : n
				),
				operators: wf.operators.map((n) =>
					n.id === node.id ? { ...n, label: trimmed } : n
				),
				subjects: wf.subjects.map((n) =>
					n.id === node.id ? { ...n, label: trimmed } : n
				)
			}));
		}
		editingLabel = false;
	}

	const primaryType = $derived<PortType>(
		node.outputs[0]?.type ?? node.inputs[0]?.type ?? "any"
	);
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
	class:node-transform={node.kind === "transform"}
	class:node-running={status === "running"}
	class:node-done={status === "done"}
	class:node-error={status === "error"}
	class:node-stale={isStale}
	class:node-selected={selected}
	class:node-droptarget={isDropTarget}
	class:has-pending={pending !== null}
	bind:this={nodeEl}
	onclick={(e) => ctx.onselect(node.id, e.shiftKey)}
	style="
		width: {node.width}px;
		--accent: {accentColor};
		--accent-dim: {accentDim};
	"
>
	<div class="node-header" role="button" tabindex="-1">
		<div class="node-header-top">
			{#if status === "running" && !canRunSolo}
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
						if (readOnly) return;
						editingLabel = true;
						requestAnimationFrame(() => labelInput?.select());
					}}>{node.label}</span
				>
			{/if}
			{#if canRunSolo}
				<button
					class="node-run"
					class:node-run-stale={isStale && status !== "running"}
					class:has-duration={duration !== undefined}
					onpointerdown={(e) => e.stopPropagation()}
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => {
						e.stopPropagation();
						ctx.onrunnode(node.id);
					}}
					title={(status === "running"
						? "Running…"
						: isStale
							? "Run this node (inputs changed)"
							: "Run this node") +
						(duration !== undefined
							? ` — last run ${formatDuration(duration)}`
							: "")}
					aria-label="Run this node"
				>
					{#if duration !== undefined}
						<span class="node-run-time">{formatDuration(duration)}</span>
					{/if}
					{#if status === "running"}
						<span class="node-status-spinner"></span>
					{:else}
						<PlayIcon />
					{/if}
				</button>
			{/if}
			{#if !readOnly}
				<button
					class="node-delete"
					onpointerdown={(e) => e.stopPropagation()}
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => {
						e.stopPropagation();
						ctx.onremove(node.id);
					}}
					title="Delete node">&times;</button
				>
			{/if}
		</div>
	</div>

	<!-- Source label for transform nodes — floats above the card.
	     Components are pure data containers and have no source label. -->
	{#if node.kind === "transform"}
		{#if node.space_id || node.model_id || node.dataset_id}
			{@const itemId = node.space_id ?? node.model_id ?? node.dataset_id ?? ""}
			<div class="node-outside-label-wrap">
				{#if readOnly}
					<span class="node-outside-label"
						>{itemId.split("/").pop() ?? itemId}</span
					>
				{:else}
					<button
						class="node-outside-label"
						title="Click to change source"
						onpointerdown={(e) => e.stopPropagation()}
						onmousedown={(e) => e.stopPropagation()}
						onclick={(e) => {
							e.stopPropagation();
							ctx.onopenpicker(node.id);
						}}>{itemId.split("/").pop() ?? itemId}</button
					>
				{/if}
				<a
					class="node-outside-link"
					href={sourceHFUrl(node)}
					target="_blank"
					rel="noopener noreferrer"
					title="Open on HuggingFace"
					onpointerdown={(e) => e.stopPropagation()}
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => e.stopPropagation()}
					aria-label="Open on HuggingFace"
				>
					<OpenLinkIcon />
				</a>
			</div>
		{:else if node.fn}
			<!-- Python fn nodes already have a "source" — their function
			     name. Show that above the card; no picker swap because
			     fn nodes can't be replaced by a Space/Model in place. -->
			<div class="node-outside-label-wrap">
				<span class="node-outside-label node-outside-label-fn">{node.fn}()</span
				>
			</div>
		{:else if !readOnly}
			<button
				class="node-outside-label node-outside-label-empty"
				onpointerdown={(e) => e.stopPropagation()}
				onmousedown={(e) => e.stopPropagation()}
				onclick={(e) => {
					e.stopPropagation();
					ctx.onopenpicker(node.id);
				}}>+ source</button
			>
		{/if}
	{/if}

	{#if node.space_id}
		<div
			class="node-endpoint-row"
			onpointerdown={(e) => e.stopPropagation()}
			onmousedown={(e) => e.stopPropagation()}
		>
			{#if node.endpoints && node.endpoints.length > 1}
				<select
					class="node-endpoint-select"
					disabled={readOnly}
					value={node.endpoint ?? ""}
					onpointerdown={(e) => e.stopPropagation()}
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => e.stopPropagation()}
					onchange={(e) => {
						e.stopPropagation();
						ctx.onswitchendpoint(
							node.id,
							(e.currentTarget as HTMLSelectElement).value
						);
					}}
				>
					{#each node.endpoints as ep}
						<option value={ep.name}>{ep.name}</option>
					{/each}
				</select>
			{:else if !node.endpoints}
				<button
					class="node-endpoint-load"
					onpointerdown={(e) => e.stopPropagation()}
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => {
						e.stopPropagation();
						ctx.onhydratendpoints(node.id, node.space_id ?? "");
					}}
					title="Discover this Space's other endpoints"
				>
					{node.endpoint ?? "/predict"} ▾
				</button>
			{/if}
		</div>
	{/if}

	<!-- Input ports -->
	{#if node.inputs.length > 0}
		{@const hiddenCount = node.inputs.filter(
			(p) =>
				p.required === false && !connectedPorts.has(`${node.id}:${p.id}:input`)
		).length}
		{@const collapsible = hiddenCount > 0}
		<div class="ports" class:widget-ports={hasWidget}>
			{#each node.inputs as port}
				{@const portConnected = connectedPorts.has(
					`${node.id}:${port.id}:input`
				)}
				{@const visible =
					showAllInputs || portConnected || port.required !== false}
				{#if visible}
					{@const inlineWidget =
						!portConnected &&
						node.kind === "transform" &&
						!port.choices?.length &&
						(port.type === "number" || port.type === "boolean")}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="port-row input-row"
						class:widget-port={hasWidget}
						class:port-row-inline={inlineWidget}
						onmousedown={inlineWidget ? (e) => e.stopPropagation() : undefined}
					>
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="port-handle-sf input-handle-sf"
							class:connected={portConnected}
							class:incompatible={pending !== null &&
								!ports_compatible(pending.type, port.type)}
							class:pulse={pending !== null &&
								ports_compatible(pending.type, port.type)}
							class:popout-hint={!portConnected && pending === null}
							data-node-id={node.id}
							data-port-id={port.id}
							data-port-type={port.type}
							data-port-direction="input"
							style="--port-color: {PORT_COLOR[port.type]}"
							title={!portConnected && pending === null
								? "Click to create an input node"
								: undefined}
							onpointerdown={(e) =>
								ctx.onportpointerdown(e, node.id, port.id, port.type, true)}
							onclick={(e) => {
								if (!portConnected && pending === null) {
									e.stopPropagation();
									ctx.onpopout(node.id, port.id, port.type, true);
								}
							}}
						></div>
						{#if !hasWidget}
							<span
								class="port-label"
								class:port-label-optional={port.required === false}
								>{port.label}</span
							>
							{#if !inlineWidget}
								<span
									class="port-type-tag"
									style="color: {PORT_COLOR[port.type]}">{port.type}</span
								>
							{/if}
						{/if}
						{#if inlineWidget}
							{#if port.type === "number"}
								<input
									class="inline-number-inrow"
									type="number"
									step="any"
									placeholder={port.default_value != null
										? String(port.default_value)
										: "0"}
									value={node.data?.[port.id] ?? ""}
									oninput={(e) =>
										ctx.ondatachange(
											node.id,
											port.id,
											parseFloat(e.currentTarget.value) || 0
										)}
								/>
							{:else if port.type === "boolean"}
								<label class="inline-checkbox-inrow">
									<input
										type="checkbox"
										checked={!!node.data?.[port.id]}
										onchange={(e) =>
											ctx.ondatachange(
												node.id,
												port.id,
												e.currentTarget.checked
											)}
									/>
								</label>
							{/if}
						{/if}
					</div>
					{#if !portConnected && node.kind === "transform" && !inlineWidget && (port.type === "text" || port.type === "number" || port.type === "boolean" || port.type === "any" || port.type === "json")}
						<div
							class="port-inline-config"
							onmousedown={(e) => e.stopPropagation()}
						>
							{#if port.choices && port.choices.length > 0 && port.multiselect}
								{@const selected = Array.isArray(node.data?.[port.id])
									? (node.data[port.id] as string[])
									: []}
								<div class="inline-choices">
									{#each port.choices as choice}
										<label class="inline-checkbox">
											<input
												type="checkbox"
												checked={selected.includes(choice)}
												onchange={(e) => {
													const next = e.currentTarget.checked
														? [...selected, choice]
														: selected.filter((c) => c !== choice);
													ctx.ondatachange(node.id, port.id, next);
												}}
											/>
											<span>{choice}</span>
										</label>
									{/each}
								</div>
							{:else if port.choices && port.choices.length > 0}
								{@const raw = node.data?.[port.id] ?? port.default_value}
								{@const current = raw != null ? String(raw) : ""}
								{@const hasCurrent = port.choices.includes(current)}
								<select
									class="inline-input inline-select"
									value={hasCurrent ? current : ""}
									onchange={(e) => {
										const v = e.currentTarget.value;
										if (v === "") return;
										ctx.ondatachange(
											node.id,
											port.id,
											castChoiceValue(v, port.type)
										);
									}}
								>
									{#if !hasCurrent}
										<option value="" disabled>Select {port.label}</option>
									{/if}
									{#each port.choices as choice}
										<option value={choice}>{choice}</option>
									{/each}
								</select>
							{:else if port.type === "number"}
								<input
									class="inline-input inline-number"
									type="number"
									step="any"
									placeholder={port.default_value != null
										? String(port.default_value)
										: "0"}
									value={node.data?.[port.id] ?? ""}
									oninput={(e) =>
										ctx.ondatachange(
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
											ctx.ondatachange(
												node.id,
												port.id,
												e.currentTarget.checked
											)}
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
										? (node.data[port.id] as string)
										: ""}
									oninput={(e) =>
										ctx.ondatachange(node.id, port.id, e.currentTarget.value)}
								/>
							{/if}
						</div>
					{/if}
				{/if}
			{/each}
			{#if collapsible}
				<button
					class="ports-toggle"
					onpointerdown={(e) => e.stopPropagation()}
					onmousedown={(e) => e.stopPropagation()}
					onclick={(e) => {
						e.stopPropagation();
						showAllInputs = !showAllInputs;
					}}
				>
					{#if showAllInputs}▴ show less{:else}▾ {hiddenCount} optional param{hiddenCount ===
						1
							? ""
							: "s"}{/if}
				</button>
			{/if}
		</div>
	{/if}

	<!-- Widget zone -->
	{#if hasWidget && widgetPortId && widgetType}
		<NodeWidget
			{node}
			{widgetPortId}
			{widgetType}
			{isReadonly}
			ondatachange={ctx.ondatachange}
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
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="port-handle-sf output-handle-sf"
						class:connected={portConnected}
						class:popout-hint={!readOnly && !portConnected && pending === null}
						data-node-id={node.id}
						data-port-id={port.id}
						data-port-type={port.type}
						data-port-direction="output"
						style="--port-color: {PORT_COLOR[port.type]}"
						title={!readOnly && !portConnected && pending === null
							? "Click to create an output node"
							: undefined}
						onpointerdown={(e) =>
							ctx.onportpointerdown(e, node.id, port.id, port.type, false)}
						onclick={(e) => {
							if (!readOnly && !portConnected && pending === null) {
								e.stopPropagation();
								ctx.onpopout(node.id, port.id, port.type, false);
							}
						}}
					></div>
				</div>
			{/each}
		</div>
	{/if}

	{#if status === "error" && error}
		<div class="node-error-banner" class:expanded={errorExpanded}>
			<div class="node-error-text">{error}</div>
			<button
				type="button"
				class="node-error-toggle nodrag nopan"
				onclick={(e) => {
					e.stopPropagation();
					errorExpanded = !errorExpanded;
				}}
				onpointerdown={(e) => e.stopPropagation()}
				onmousedown={(e) => e.stopPropagation()}
			>
				{errorExpanded ? "show less" : "show more"}
			</button>
		</div>
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
		to {
			transform: rotate(360deg);
		}
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
		transition:
			opacity 0.15s,
			color 0.15s,
			background 0.15s;
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

	.node-outside-label-fn {
		font-family: "JetBrains Mono", monospace;
		font-size: 10.5px;
		color: #8b8d98;
		cursor: default;
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

	/* Per-node run button — always visible; shows the spinner in place of the
	 * play icon while the node runs. Once the node has run, the last duration
	 * (which doubles as an ETA on re-runs) joins the icon inside the same
	 * pill, so hover highlights both together. Stale state pulses faintly to
	 * signal "this needs re-running". */
	.node-run {
		display: flex;
		min-width: 20px;
		height: 20px;
		margin-left: auto;
		border: none;
		border-radius: 10px;
		background: transparent;
		color: #5c5e6a;
		cursor: pointer;
		flex-shrink: 0;
		align-items: center;
		justify-content: center;
		gap: 5px;
		padding: 0;
	}

	.node-run.has-duration {
		padding: 0 3px 0 7px;
		background: rgba(255, 255, 255, 0.06);
	}

	.node-run + .node-delete {
		margin-left: 2px;
	}

	.node-run-time {
		color: #8b8d98;
		font-size: 10px;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.node-run:hover .node-run-time {
		color: inherit;
	}

	.wf-node.node-stale .node-run-time {
		opacity: 0.55;
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
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.55;
		}
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
		padding: 3px 12px;
		position: relative;
		min-height: 20px;
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
		transition:
			opacity 0.15s,
			transform 0.15s,
			background 0.15s,
			box-shadow 0.15s;
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
		position: relative;
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #fca5a5;
		background: rgba(239, 68, 68, 0.1);
		border-radius: 0 0 10px 10px;
		padding: 6px 12px 24px;
		line-height: 1.4;
		word-break: break-word;
	}

	.node-error-text {
		max-height: 3.6em;
		overflow: hidden;
		transition: max-height 0.2s ease;
		mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
		-webkit-mask-image: linear-gradient(to bottom, black 40%, transparent 100%);
	}

	.node-error-banner.expanded .node-error-text {
		max-height: none;
		mask-image: none;
		-webkit-mask-image: none;
	}

	.node-error-toggle {
		position: absolute;
		bottom: 4px;
		right: 8px;
		background: none;
		border: none;
		padding: 0;
		font-family: "JetBrains Mono", monospace;
		font-size: 8px;
		color: rgba(252, 165, 165, 0.55);
		cursor: pointer;
		line-height: 1;
		transition: color 0.15s;
	}

	.node-error-toggle:hover {
		color: #fca5a5;
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
		padding: 1px 12px 3px 20px;
	}

	.inline-input {
		width: 100%;
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		padding: 3px 7px;
		border: 1px solid #1e1f2a;
		border-radius: 4px;
		background: #101118;
		color: #c8c9d2;
		outline: none;
		box-sizing: border-box;
		height: 24px;
	}

	.inline-input:focus {
		border-color: #3e3f4d;
	}

	.inline-input::placeholder {
		color: #4a4b58;
	}

	.popout-hint {
		cursor: cell;
	}

	.inline-number {
		width: 80px;
	}

	.port-row-inline {
		display: grid;
		grid-template-columns: 1fr 60px 20px;
		gap: 5px;
		align-items: center;
	}

	.inline-number-inrow {
		width: 100%;
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		padding: 2px 6px;
		border: 1px solid #1e1f2a;
		border-radius: 4px;
		background: #101118;
		color: #c8c9d2;
		outline: none;
		box-sizing: border-box;
		flex-shrink: 0;
		height: 22px;
	}

	.inline-number-inrow:focus {
		border-color: #3e3f4d;
	}

	.inline-number-inrow::placeholder {
		color: #4a4b58;
	}

	.inline-checkbox-inrow {
		cursor: pointer;
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

	.inline-select {
		cursor: pointer;
	}

	.inline-choices {
		display: flex;
		flex-direction: column;
		gap: 4px;
		max-height: 120px;
		overflow-y: auto;
	}

	.inline-choices input[type="checkbox"] {
		width: 14px;
		height: 14px;
		accent-color: var(--accent);
		cursor: pointer;
		appearance: auto;
		-webkit-appearance: checkbox;
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

	:global(body:not(.dark)) .node-transform .node-header {
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

	:global(body:not(.dark)) .inline-number-inrow {
		background: #f8f9fb;
		border-color: #e2e4ea;
		color: #1a1b25;
	}

	:global(body:not(.dark)) .inline-number-inrow::placeholder {
		color: #c0c2cc;
	}

	:global(body:not(.dark)) .inline-checkbox {
		color: #6b6e78;
	}

	.node-endpoint-row {
		padding: 2px 12px 0 0;
		display: flex;
		justify-content: flex-end;
	}

	.node-endpoint-select,
	.node-endpoint-load {
		font-family: "JetBrains Mono", monospace;
		font-size: 9.5px;
		padding: 1px 0 1px 4px;
		border: none;
		background: transparent;
		color: #5c5e6a;
		cursor: pointer;
		outline: none;
		opacity: 0.6;
		transition:
			opacity 0.15s,
			color 0.15s;
		-webkit-appearance: none;
		appearance: none;
		text-align: right;
		text-align-last: right;
	}

	.node-endpoint-select:hover,
	.node-endpoint-load:hover {
		opacity: 1;
		color: #a0a2ae;
	}

	.wf-node:hover .node-endpoint-select,
	.wf-node:hover .node-endpoint-load {
		opacity: 1;
	}

	:global(body:not(.dark)) .node-endpoint-select,
	:global(body:not(.dark)) .node-endpoint-load {
		color: #8b8d98;
	}

	:global(body:not(.dark)) .node-endpoint-select:hover,
	:global(body:not(.dark)) .node-endpoint-load:hover {
		color: #3e4050;
	}
</style>
