<script lang="ts">
	import type { WFNode, PortType, NodeDataValue, FileValue, NodeStatus } from "./workflow-types";
	import { PORT_COLOR, PORT_COLOR_DIM, KIND_LABEL } from "./workflow-types";
	import { resizeNode, workflow } from "./workflow-store";
	import { BaseTextbox } from "@gradio/textbox";
	import { BaseStaticImage } from "@gradio/image";

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
		ondatachange: (nodeId: string, portId: string, value: NodeDataValue) => void;
		onremove: (id: string) => void;
		onautoconnect: (nodeId: string, portId: string, portType: PortType, side: "input" | "output") => void;
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
				nodes: wf.nodes.map((n) => n.id === node.id ? { ...n, label: trimmed } : n)
			}));
		}
		editingLabel = false;
	}

	const primaryType: PortType =
		node.outputs[0]?.type ?? node.inputs[0]?.type ?? "any";
	const accentColor = PORT_COLOR[primaryType];
	const accentDim = PORT_COLOR_DIM[primaryType];

	const hasWidget = node.kind === "input" || node.kind === "output";
	const widgetPortId = node.kind === "input"
		? node.outputs[0]?.id ?? null
		: node.kind === "output"
			? node.inputs[0]?.id ?? null
			: null;
	const widgetType: PortType | null = node.kind === "input"
		? node.outputs[0]?.type ?? null
		: node.kind === "output"
			? node.inputs[0]?.type ?? null
			: null;
	const isReadonly = node.kind === "output";

	function getTextValue(): string {
		if (!widgetPortId) return "";
		const v = node.data?.[widgetPortId];
		return typeof v === "string" ? v : "";
	}

	function getFileValue(): FileValue | null {
		if (!widgetPortId) return null;
		const v = node.data?.[widgetPortId];
		return v && typeof v === "object" ? v : null;
	}

	function getNumberValue(): number {
		if (!widgetPortId) return 0;
		const v = node.data?.[widgetPortId];
		return typeof v === "number" ? v : 0;
	}

	function getBooleanValue(): boolean {
		if (!widgetPortId) return false;
		const v = node.data?.[widgetPortId];
		return typeof v === "boolean" ? v : false;
	}

	function getJsonValue(): string {
		if (!widgetPortId) return "";
		const v = node.data?.[widgetPortId];
		if (typeof v === "string") return v;
		return "";
	}

	function handleTextInput(e: Event) {
		const target = e.currentTarget as HTMLTextAreaElement;
		if (widgetPortId) ondatachange(node.id, widgetPortId, target.value);
	}

	function handleNumberInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		if (widgetPortId) ondatachange(node.id, widgetPortId, parseFloat(target.value) || 0);
	}

	function handleBooleanInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		if (widgetPortId) ondatachange(node.id, widgetPortId, target.checked);
	}

	function handleFileSelect(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file || !widgetPortId) return;
		const old = getFileValue();
		if (old?.url?.startsWith("blob:")) URL.revokeObjectURL(old.url);
		ondatachange(node.id, widgetPortId, {
			name: file.name,
			url: URL.createObjectURL(file),
			mime: file.type
		});
	}

	function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		const file = e.dataTransfer?.files?.[0];
		if (!file || !widgetPortId) return;
		const old = getFileValue();
		if (old?.url?.startsWith("blob:")) URL.revokeObjectURL(old.url);
		ondatachange(node.id, widgetPortId, {
			name: file.name,
			url: URL.createObjectURL(file),
			mime: file.type
		});
	}

	function clearFile() {
		if (!widgetPortId) return;
		const old = getFileValue();
		if (old?.url?.startsWith("blob:")) URL.revokeObjectURL(old.url);
		ondatachange(node.id, widgetPortId, null);
	}

	// Stubs for Gradio component upload API
	const i18n = (key: string) => key;
	async function stubUpload(files: File[]): Promise<any[]> {
		return files.map(f => ({
			url: URL.createObjectURL(f),
			orig_name: f.name,
			path: f.name,
			mime_type: f.type,
			size: f.size
		}));
	}
	async function stubStream(): Promise<any> { return; }

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

	<div class="node-header" role="button" tabindex="-1" onmousedown={onHandleMouseDown}>
		<div class="node-header-top">
			{#if status === "running"}
				<span class="node-status-spinner"></span>
			{/if}
			<span class="kind-tag">{KIND_LABEL[node.kind] ?? "?"}</span>
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
					}}
				>{node.label}</span>
			{/if}
			<button
				class="node-delete"
				onmousedown={(e) => e.stopPropagation()}
				onclick={() => onremove(node.id)}
				title="Delete node"
			>&times;</button>
		</div>
		{#if node.source === "space" && node.space_id}
			<a
				class="source-badge"
				href="https://huggingface.co/spaces/{node.space_id}"
				target="_blank"
				rel="noopener"
				title={node.space_id}
				onmousedown={(e) => e.stopPropagation()}
			>{node.space_id}</a>
		{/if}
	</div>

	<!-- Input ports -->
	{#if node.inputs.length > 0}
		{@const collapsible = node.inputs.length > INPUT_COLLAPSE_THRESHOLD}
		{@const hiddenCount = node.inputs.length - INPUT_COLLAPSE_THRESHOLD}
		<div class="ports">
			{#each node.inputs as port, i}
				{@const portConnected = connectedPorts.has(`${node.id}:${port.id}:input`)}
				{@const visible = showAllInputs || i < INPUT_COLLAPSE_THRESHOLD || portConnected}
				{#if visible}
					<div class="port-row input-row">
						{#if !portConnected && !pending}
							<button
								class="port-auto-btn"
								style="--port-color: {PORT_COLOR[port.type]}"
								onmousedown={(e) => e.stopPropagation()}
								onclick={() => onautoconnect(node.id, port.id, port.type, "input")}
								title="Add {port.type} input"
							>+</button>
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
						<span class="port-label" class:port-label-optional={port.required === false}>{port.label}</span>
						<span
							class="port-type-tag"
							style="color: {PORT_COLOR[port.type]}"
							>{port.type}</span
						>
					</div>
					{#if !portConnected && node.kind === "transform" && (port.type === "text" || port.type === "number" || port.type === "boolean" || port.type === "any" || port.type === "json")}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div class="port-inline-config" onmousedown={(e) => e.stopPropagation()}>
							{#if port.type === "number"}
								<input
									class="inline-input inline-number"
									type="number"
									step="any"
									placeholder={port.default_value != null ? String(port.default_value) : "0"}
									value={node.data?.[port.id] ?? ""}
									oninput={(e) => ondatachange(node.id, port.id, parseFloat(e.currentTarget.value) || 0)}
								/>
							{:else if port.type === "boolean"}
								<label class="inline-checkbox">
									<input
										type="checkbox"
										checked={!!node.data?.[port.id]}
										onchange={(e) => ondatachange(node.id, port.id, e.currentTarget.checked)}
									/>
									<span>{node.data?.[port.id] ? "On" : "Off"}</span>
								</label>
							{:else}
								<input
									class="inline-input"
									type="text"
									placeholder={port.default_value != null ? String(port.default_value) : port.label}
									value={typeof node.data?.[port.id] === "string" ? node.data[port.id] : ""}
									oninput={(e) => ondatachange(node.id, port.id, e.currentTarget.value)}
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
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="widget-zone" onmousedown={(e) => e.stopPropagation()}>
			{#if widgetType === "text" || widgetType === "json"}
				<div class="widget-gradio-wrap">
					<BaseTextbox
						value={getTextValue() || getJsonValue()}
						label="text"
						show_label={false}
						lines={widgetType === "json" ? 4 : 3}
						max_lines={8}
						placeholder={isReadonly ? "Waiting for output..." : widgetType === "json" ? '{"key": "value"}' : "Enter text..."}
						disabled={isReadonly}
						oninput={(val) => { if (widgetPortId) ondatachange(node.id, widgetPortId, val); }}
					/>
				</div>
			{:else if widgetType === "number"}
				{#if isReadonly}
					<div class="widget-text-display">
						{getNumberValue()}
					</div>
				{:else}
					<input
						class="widget-number"
						type="number"
						value={getNumberValue()}
						oninput={handleNumberInput}
						step="any"
					/>
				{/if}
			{:else if widgetType === "boolean"}
				<label class="widget-checkbox-row">
					<input
						class="widget-checkbox"
						type="checkbox"
						checked={getBooleanValue()}
						disabled={isReadonly}
						onchange={handleBooleanInput}
					/>
					<span class="widget-checkbox-label">{getBooleanValue() ? "On" : "Off"}</span>
				</label>
			{:else if widgetType === "image" || widgetType === "audio" || widgetType === "video" || widgetType === "file" || widgetType === "gallery" || widgetType === "model3d"}
				{@const fileVal = getFileValue()}
				{#if fileVal}
					<div class="widget-preview">
						{#if (widgetType === "image" || widgetType === "gallery") && isReadonly}
							<div class="widget-gradio-wrap widget-gradio-image">
								<BaseStaticImage
									value={{ url: fileVal.url, orig_name: fileVal.name, path: fileVal.url, mime_type: fileVal.mime }}
									show_label={false}
									{i18n}
									buttons={[]}
								/>
							</div>
						{:else if widgetType === "image" || widgetType === "gallery"}
							<img class="widget-img" src={fileVal.url} alt={fileVal.name} />
						{:else if widgetType === "audio"}
							<audio class="widget-audio" controls src={fileVal.url}></audio>
						{:else if widgetType === "video"}
							<video class="widget-video" controls src={fileVal.url}></video>
						{:else}
							<div class="widget-file-info">
								<span class="widget-file-name">{fileVal.name}</span>
							</div>
						{/if}
						{#if !isReadonly}
							<button class="widget-clear" onclick={clearFile}>&times;</button>
						{/if}
					</div>
				{:else}
					{#if isReadonly}
						<div class="widget-placeholder">Waiting for output...</div>
					{:else}
						<label
							class="widget-file-drop"
							ondragover={(e) => { e.preventDefault(); e.stopPropagation(); }}
							ondrop={handleFileDrop}
						>
							<input
								type="file"
								accept={widgetType === "image" ? "image/*" : widgetType === "audio" ? "audio/*" : widgetType === "video" ? "video/*" : widgetType === "model3d" ? ".glb,.gltf,.obj,.stl" : "*"}
								onchange={handleFileSelect}
							/>
							<span class="widget-drop-text">
								Drop {widgetType} or click
							</span>
						</label>
					{/if}
				{/if}
			{/if}
		</div>
	{/if}

	<!-- Output ports -->
	{#if node.outputs.length > 0}
		<div class="ports">
			{#each node.outputs as port}
				{@const portConnected = connectedPorts.has(`${node.id}:${port.id}:output`)}
				<div class="port-row output-row">
					<span
						class="port-type-tag"
						style="color: {PORT_COLOR[port.type]}"
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
							onclick={() => onautoconnect(node.id, port.id, port.type, "output")}
							title="Add {port.type} output"
						>+</button>
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
		transition: box-shadow 0.2s, border-color 0.3s;
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
		box-shadow: 0 0 0 1px #f97316, 0 0 16px rgba(249, 115, 22, 0.15);
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
		to { transform: rotate(360deg); }
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
		transition: color 0.15s, background 0.15s;
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
		transition: opacity 0.15s, background 0.15s;
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
		0% { transform: scale(2); background: var(--port-color); box-shadow: 0 0 12px var(--port-color); }
		100% { transform: scale(1); }
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

	/* ─── Gradio Component Wrapper ─── */
	.widget-gradio-wrap {
		font-size: 12px;
		--input-text-size: 11px;
		--input-text-weight: 400;
		--input-padding: 8px 10px;
		--input-background-fill: #101118;
		--input-background-fill-focus: #101118;
		--input-border-color: #1e1f2a;
		--input-border-color-focus: var(--accent);
		--input-border-width: 1px;
		--input-radius: 6px;
		--input-shadow: none;
		--input-shadow-focus: 0 0 0 2px var(--accent-dim);
		--input-placeholder-color: #4a4b58;
		--body-text-color: #c8c9d2;
		--font-sans: "JetBrains Mono", monospace;
		--line-sm: 1.4;
		--spacing-sm: 4px;
		--weight-semibold: 600;
		--layer-1: #101118;
		--shadow-inset: none;
		--button-secondary-background-fill: #1e1f2a;
		--button-secondary-background-fill-hover: #2a2b36;
		--button-secondary-text-color: #8b8d98;
		--button-shadow-active: none;
		--error-icon-color: #ef4444;
	}

	.widget-gradio-wrap :global(textarea),
	.widget-gradio-wrap :global(input) {
		font-family: "JetBrains Mono", monospace !important;
		font-size: 11px !important;
		line-height: 1.4 !important;
		background: #101118 !important;
		color: #c8c9d2 !important;
		border: 1px solid #1e1f2a !important;
		border-radius: 6px !important;
		padding: 8px 10px !important;
		outline: none !important;
		box-shadow: none !important;
	}

	.widget-gradio-wrap :global(textarea:focus),
	.widget-gradio-wrap :global(input:focus) {
		border-color: var(--accent) !important;
		box-shadow: 0 0 0 2px var(--accent-dim) !important;
	}

	.widget-gradio-wrap :global(textarea::placeholder),
	.widget-gradio-wrap :global(input::placeholder) {
		color: #4a4b58 !important;
	}

	.widget-gradio-wrap :global(.block),
	.widget-gradio-wrap :global(.wrap),
	.widget-gradio-wrap :global(.container) {
		background: transparent !important;
		border: none !important;
		box-shadow: none !important;
		padding: 0 !important;
		margin: 0 !important;
		gap: 0 !important;
	}

	.widget-gradio-wrap :global(.block.padded) {
		padding: 0 !important;
	}

	.widget-gradio-wrap :global(.label-wrap),
	.widget-gradio-wrap :global(.info-text),
	.widget-gradio-wrap :global(.icon-button-wrapper),
	.widget-gradio-wrap :global(.icon-buttons) {
		display: none !important;
	}

	.widget-gradio-image {
		overflow: hidden;
		border-radius: 6px;
	}

	.widget-gradio-image :global(img) {
		max-height: 140px !important;
		width: 100% !important;
		object-fit: contain !important;
		display: block !important;
	}

	.widget-gradio-image :global(.image-container) {
		max-height: 140px !important;
		overflow: hidden !important;
	}

	.widget-gradio-image :global(.empty-wrapper) {
		display: none !important;
	}

	.widget-gradio-wrap :global(.icon-button-wrapper),
	.widget-gradio-wrap :global(.icon-buttons) {
		display: none !important;
	}

	.widget-gradio-wrap :global(textarea) {
		min-height: 60px !important;
		height: auto !important;
		resize: vertical !important;
	}

	.widget-gradio-wrap :global(label) {
		display: block !important;
	}

	.widget-gradio-wrap :global(.input-container) {
		display: flex !important;
	}

	/* ─── Widget Zone ─── */
	.widget-zone {
		padding: 6px 12px 8px;
		border-top: 1px solid #1e1f2a;
	}

	.widget-textarea {
		width: 100%;
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		line-height: 1.4;
		border: 1px solid #1e1f2a;
		border-radius: 6px;
		padding: 8px 10px;
		resize: vertical;
		background: #101118;
		color: #c8c9d2;
		outline: none;
		transition: border-color 0.15s;
		box-sizing: border-box;
	}

	.widget-textarea::placeholder {
		color: #4a4b58;
	}

	.widget-textarea:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-dim);
	}

	.widget-text-display {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		line-height: 1.4;
		padding: 8px 10px;
		border: 1px solid #1e1f2a;
		border-radius: 6px;
		background: #101118;
		color: #5c5e6a;
		min-height: 42px;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.widget-number {
		width: 100%;
		font-family: "JetBrains Mono", monospace;
		font-size: 12px;
		border: 1px solid #1e1f2a;
		border-radius: 6px;
		padding: 8px 10px;
		background: #101118;
		color: #c8c9d2;
		outline: none;
		box-sizing: border-box;
		transition: border-color 0.15s;
	}

	.widget-number:focus {
		border-color: var(--accent);
		box-shadow: 0 0 0 2px var(--accent-dim);
	}

	.widget-checkbox-row {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 0;
		cursor: pointer;
	}

	.widget-checkbox {
		width: 16px;
		height: 16px;
		accent-color: var(--accent);
		cursor: pointer;
	}

	.widget-checkbox-label {
		font-family: "JetBrains Mono", monospace;
		font-size: 11px;
		color: #8b8d98;
	}

	.widget-file-info {
		padding: 10px 12px;
	}

	.widget-file-name {
		font-family: "JetBrains Mono", monospace;
		font-size: 10.5px;
		color: #8b8d98;
		word-break: break-all;
	}

	.widget-file-drop {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 60px;
		border: 1px dashed #24252e;
		border-radius: 6px;
		background: #101118;
		cursor: pointer;
		transition: border-color 0.15s, background 0.15s;
	}

	.widget-file-drop:hover {
		border-color: var(--accent);
		background: #14151a;
	}

	.widget-file-drop input {
		display: none;
	}

	.widget-drop-text {
		font-size: 10.5px;
		color: #4a4b58;
	}

	.widget-placeholder {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #2e2f3d;
		text-align: center;
		padding: 18px 0;
		border: 1px dashed #1e1f2a;
		border-radius: 6px;
		background: #101118;
	}

	.widget-preview {
		position: relative;
		border-radius: 6px;
		overflow: hidden;
		background: #101118;
		border: 1px solid #1e1f2a;
	}

	.widget-img {
		display: block;
		width: 100%;
		max-height: 140px;
		object-fit: contain;
		border-radius: 5px;
	}

	.widget-audio {
		display: block;
		width: 100%;
		height: 36px;
		border-radius: 5px;
	}

	.widget-video {
		display: block;
		width: 100%;
		max-height: 100px;
		object-fit: contain;
		border-radius: 5px;
	}

	.widget-clear {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: none;
		background: rgba(0, 0, 0, 0.6);
		color: #a0a2ae;
		font-size: 12px;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s;
	}

	.widget-clear:hover {
		background: rgba(239, 68, 68, 0.7);
		color: #fff;
	}
</style>
