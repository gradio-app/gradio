<script lang="ts">
	import type {
		WFNode,
		PortType,
		NodeDataValue,
		FileValue
	} from "./workflow-types";
	import { BaseTextbox } from "@gradio/textbox";
	import { BaseStaticImage } from "@gradio/image";

	interface Props {
		node: WFNode;
		widgetPortId: string;
		widgetType: PortType;
		isReadonly: boolean;
		ondatachange: (
			nodeId: string,
			portId: string,
			value: NodeDataValue
		) => void;
	}

	let { node, widgetPortId, widgetType, isReadonly, ondatachange }: Props =
		$props();

	let fileInputEl: HTMLInputElement | undefined = $state();

	function getTextValue(): string {
		const v = node.data?.[widgetPortId];
		return typeof v === "string" ? v : "";
	}

	function getFileValue(): FileValue | null {
		const v = node.data?.[widgetPortId];
		return v && typeof v === "object" ? v : null;
	}

	function getNumberValue(): number {
		const v = node.data?.[widgetPortId];
		return typeof v === "number" ? v : 0;
	}

	function getBooleanValue(): boolean {
		const v = node.data?.[widgetPortId];
		return typeof v === "boolean" ? v : false;
	}

	function handleNumberInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		ondatachange(node.id, widgetPortId, parseFloat(target.value) || 0);
	}

	function handleBooleanInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		ondatachange(node.id, widgetPortId, target.checked);
	}

	function handleFileSelect(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
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
		if (!file) return;
		const old = getFileValue();
		if (old?.url?.startsWith("blob:")) URL.revokeObjectURL(old.url);
		ondatachange(node.id, widgetPortId, {
			name: file.name,
			url: URL.createObjectURL(file),
			mime: file.type
		});
	}

	function clearFile() {
		const old = getFileValue();
		if (old?.url?.startsWith("blob:")) URL.revokeObjectURL(old.url);
		ondatachange(node.id, widgetPortId, null);
	}

	const i18n = (key: string) => key;
	async function stubUpload(files: File[]): Promise<any[]> {
		return files.map((f) => ({
			url: URL.createObjectURL(f),
			orig_name: f.name,
			path: f.name,
			mime_type: f.type,
			size: f.size
		}));
	}
	async function stubStream(): Promise<any> {
		return;
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="widget-zone nodrag nopan" class:text-full={widgetType === "text" || widgetType === "json"} onmousedown={(e) => e.stopPropagation()} onpointerdown={(e) => e.stopPropagation()}>
	{#if widgetType === "text" || widgetType === "json"}
		<div class="widget-text-wrap">
			<div class="widget-gradio-wrap">
				<BaseTextbox
					value={getTextValue()}
					label="text"
					show_label={false}
					lines={widgetType === "json" ? 4 : 3}
					max_lines={8}
					placeholder={isReadonly
						? "Waiting for output..."
						: widgetType === "json"
							? '{"key": "value"}'
							: "Enter text..."}
					disabled={isReadonly}
					oninput={(val) => ondatachange(node.id, widgetPortId, val)}
				/>
			</div>
		</div>
	{:else if widgetType === "number"}
		<div class="widget-number-wrap">
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
		</div>
	{:else if widgetType === "boolean"}
		<div class="widget-bool-wrap">
			<label class="widget-checkbox-row">
				<input
					class="widget-checkbox"
					type="checkbox"
					checked={getBooleanValue()}
					disabled={isReadonly}
					onchange={handleBooleanInput}
				/>
				<span class="widget-checkbox-label"
					>{getBooleanValue() ? "On" : "Off"}</span
				>
			</label>
		</div>
	{:else if widgetType === "image" || widgetType === "audio" || widgetType === "video" || widgetType === "file" || widgetType === "gallery" || widgetType === "model3d"}
		{@const fileVal = getFileValue()}
		{#if fileVal}
			<div class="widget-preview">
				{#if (widgetType === "image" || widgetType === "gallery") && isReadonly}
					<div class="widget-gradio-wrap widget-gradio-image">
						<BaseStaticImage
							value={{
								url: fileVal.url,
								orig_name: fileVal.name,
								path: fileVal.url,
								mime_type: fileVal.mime
							}}
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
		{:else if isReadonly}
			<div class="widget-placeholder">Waiting for output...</div>
		{:else}
			<!-- svelte-ignore a11y_interactive_supports_focus -->
			<div
				class="widget-file-drop nodrag nopan"
				role="button"
				tabindex="0"
				onclick={() => fileInputEl?.click()}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputEl?.click(); }}
				onmousedown={(e) => e.stopPropagation()}
				onpointerdown={(e) => e.stopPropagation()}
				ondragover={(e) => { e.preventDefault(); e.stopPropagation(); }}
				ondrop={handleFileDrop}
			>
				<input
					bind:this={fileInputEl}
					type="file"
					accept={widgetType === "image"
						? "image/*"
						: widgetType === "audio"
							? "audio/*"
							: widgetType === "video"
								? "video/*"
								: widgetType === "model3d"
									? ".glb,.gltf,.obj,.stl"
									: "*"}
					onchange={handleFileSelect}
					style="display: none"
				/>
				<span class="widget-drop-text">
					Drop {widgetType} or click
				</span>
			</div>
		{/if}
	{/if}
</div>

<style>
	/* ─── Gradio Component Wrapper ─── */
	.widget-text-wrap,
	.widget-number-wrap,
	.widget-bool-wrap {
		padding: 6px 12px 8px;
	}

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
		padding: 0;
		border-top: 1px solid #1e1f2a;
	}

	.widget-zone.text-full {
		border-top: none;
	}

	.widget-zone.text-full .widget-text-wrap {
		padding: 0;
	}

	.widget-zone.text-full :global(textarea) {
		border-radius: 0 0 9px 9px !important;
		border-top: 1px solid #1e1f2a !important;
		border-left: none !important;
		border-right: none !important;
		border-bottom: none !important;
		min-height: 120px !important;
		width: 100% !important;
		box-sizing: border-box !important;
		resize: vertical !important;
	}

	.widget-zone.text-full :global(textarea:focus) {
		border-top-color: var(--accent) !important;
		box-shadow: none !important;
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
		max-height: 300px;
		overflow-y: auto;
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
		height: 80px;
		border: none;
		border-radius: 0 0 10px 10px;
		background: #101118;
		cursor: pointer;
		transition: background 0.15s;
	}

	.widget-file-drop:hover {
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
		padding: 24px 0;
		background: #101118;
		border-radius: 0 0 10px 10px;
	}

	.widget-preview {
		position: relative;
		overflow: hidden;
		border-radius: 0 0 10px 10px;
	}

	.widget-img {
		display: block;
		width: 100%;
		max-height: 320px;
		object-fit: contain;
		background: #101118;
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

	/* ─── Light mode ─── */
	:global(body:not(.dark)) .widget-zone {
		border-top-color: #e2e4ea;
	}

	:global(body:not(.dark)) .widget-gradio-wrap {
		--input-background-fill: #f8f9fb;
		--input-background-fill-focus: #ffffff;
		--input-border-color: #e2e4ea;
		--input-placeholder-color: #c0c2cc;
		--body-text-color: #1a1b25;
		--layer-1: #f8f9fb;
		--button-secondary-background-fill: #f0f1f5;
		--button-secondary-background-fill-hover: #e2e4ea;
		--button-secondary-text-color: #6b6e78;
	}

	:global(body:not(.dark)) .widget-gradio-wrap :global(textarea),
	:global(body:not(.dark)) .widget-gradio-wrap :global(input) {
		background: #f8f9fb !important;
		color: #1a1b25 !important;
		border-color: #e2e4ea !important;
	}

	:global(body:not(.dark)) .widget-gradio-wrap :global(textarea::placeholder),
	:global(body:not(.dark)) .widget-gradio-wrap :global(input::placeholder) {
		color: #c0c2cc !important;
	}

	:global(body:not(.dark)) .widget-text-display {
		background: #f8f9fb;
		border-color: #e2e4ea;
		color: #6b6e78;
	}

	:global(body:not(.dark)) .widget-number {
		background: #f8f9fb;
		border-color: #e2e4ea;
		color: #1a1b25;
	}

	:global(body:not(.dark)) .widget-checkbox-label {
		color: #6b6e78;
	}

	:global(body:not(.dark)) .widget-file-name {
		color: #6b6e78;
	}

	:global(body:not(.dark)) .widget-file-drop {
		background: #f8f9fb;
		border-color: #d0d2dc;
	}

	:global(body:not(.dark)) .widget-file-drop:hover {
		background: #f0f1f5;
	}

	:global(body:not(.dark)) .widget-drop-text {
		color: #b0b2bc;
	}

	:global(body:not(.dark)) .widget-placeholder {
		background: #f8f9fb;
		border-color: #e2e4ea;
		color: #b0b2bc;
	}

	:global(body:not(.dark)) .widget-preview {
		background: #f8f9fb;
		border-color: #e2e4ea;
	}
</style>
