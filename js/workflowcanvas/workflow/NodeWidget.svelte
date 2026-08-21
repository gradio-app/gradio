<script lang="ts">
	import type {
		WFNode,
		PortType,
		NodeDataValue,
		FileValue
	} from "./workflow-types";
	import { getContext } from "svelte";
	import { BaseTextbox } from "@gradio/textbox";
	import { BaseStaticImage } from "@gradio/image";
	import DownloadIcon from "./icons/DownloadIcon.svelte";
	import OpenLinkIcon from "./icons/OpenLinkIcon.svelte";
	import ExpandIcon from "./icons/ExpandIcon.svelte";
	import UploadIcon from "./icons/UploadIcon.svelte";
	import MicIcon from "./icons/MicIcon.svelte";
	import CameraIcon from "./icons/CameraIcon.svelte";
	import NodeCapture from "./NodeCapture.svelte";

	interface Props {
		node: WFNode;
		widgetPortId: string;
		widgetType: PortType;
		isReadonly: boolean;
		/** The node has a user-pinned height, so stretch to fill it. */
		fillHeight?: boolean;
		ondatachange: (
			nodeId: string,
			portId: string,
			value: NodeDataValue
		) => void;
	}

	let {
		node,
		widgetPortId,
		widgetType,
		isReadonly,
		fillHeight = false,
		ondatachange
	}: Props = $props();

	const wf = getContext<{
		onviewfullscreen?: (src: string, alt: string) => void;
		readOnly?: boolean;
	}>("wf");

	// Editable canvases resize through the node's own corner handle, which does
	// both axes and persists. A textarea's native grip sits in the same corner
	// and only does height, so it's redundant there — but it's the only way a
	// run-only viewer can enlarge a text output, so keep it for them.
	const nativeTextareaResize = $derived(!!wf?.readOnly);

	let capturing = $state(false);
	let captureStreamPromise = $state<Promise<MediaStream> | null>(null);

	// Capture needs a secure context; getUserMedia is undefined over plain http
	// on anything but localhost, so don't offer what can't work.
	const canCapture = $derived(
		(widgetType === "image" || widgetType === "audio") &&
			!isReadonly &&
			typeof navigator !== "undefined" &&
			!!navigator.mediaDevices?.getUserMedia
	);

	const widgetPort = $derived(
		node.outputs.find((p) => p.id === widgetPortId) ??
			node.inputs.find((p) => p.id === widgetPortId)
	);
	const choices = $derived(widgetPort?.choices ?? null);
	const hasChoices = $derived(!!choices?.length);

	// When the schema is ambiguous (any/json/file) but the runtime value carries
	// a media MIME, render the media instead of a JSON blob.
	const effectiveWidgetType = $derived<PortType>(
		((): PortType => {
			if (!isReadonly) return widgetType;
			if (
				widgetType !== "any" &&
				widgetType !== "json" &&
				widgetType !== "file"
			)
				return widgetType;
			const v = node.data?.[widgetPortId];
			if (!v || typeof v !== "object" || Array.isArray(v)) return widgetType;
			const mime = (v as FileValue).mime;
			if (typeof mime !== "string") return widgetType;
			if (mime.startsWith("video/")) return "video";
			if (mime.startsWith("image/")) return "image";
			if (mime.startsWith("audio/")) return "audio";
			return widgetType;
		})()
	);
	const multiselect = $derived(!!widgetPort?.multiselect);

	let fileInputEl: HTMLInputElement | undefined = $state();
	let dragActive = $state(false);

	function getTextValue(): string {
		const v = node.data?.[widgetPortId];
		return typeof v === "string" ? v : "";
	}

	function getFileValue(): FileValue | null {
		const v = node.data?.[widgetPortId];
		return v && typeof v === "object" && !Array.isArray(v) ? v : null;
	}

	function getNumberValue(): number {
		const v = node.data?.[widgetPortId];
		return typeof v === "number" ? v : 0;
	}

	function getBooleanValue(): boolean {
		const v = node.data?.[widgetPortId];
		return typeof v === "boolean" ? v : false;
	}

	const HTML_PAGE_WIDTH = 1280;
	const HTML_PAGE_HEIGHT = 800;

	let htmlPreviewEl: HTMLDivElement | undefined = $state();
	let htmlScale = $state(220 / HTML_PAGE_WIDTH);

	$effect(() => {
		const el = htmlPreviewEl;
		if (!el) return;
		const ro = new ResizeObserver(() => {
			const w = el.clientWidth;
			if (w > 0) htmlScale = w / HTML_PAGE_WIDTH;
		});
		ro.observe(el);
		return () => ro.disconnect();
	});

	const htmlValue = $derived(
		typeof node.data?.[widgetPortId] === "string"
			? (node.data[widgetPortId] as string)
			: ""
	);

	function openHtmlInTab(html: string): void {
		// A Blob URL inherits the origin of whoever created it, so opening this
		// HTML directly would run model-authored markup as the app itself. Host it
		// in a sandboxed iframe instead, which is the same opaque origin the
		// in-page preview gives it.
		const srcdoc = html.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
		const wrapper =
			`<!doctype html><html><head><meta charset="utf-8">` +
			`<title>HTML preview</title>` +
			`<style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style>` +
			`</head><body><iframe sandbox="allow-scripts" srcdoc="${srcdoc}"` +
			` title="HTML preview"></iframe></body></html>`;
		const blob = new Blob([wrapper], { type: "text/html" });
		const url = URL.createObjectURL(blob);
		window.open(url, "_blank", "noopener");
		setTimeout(() => URL.revokeObjectURL(url), 60_000);
	}

	function handleNumberInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		ondatachange(node.id, widgetPortId, parseFloat(target.value) || 0);
	}

	function handleBooleanInput(e: Event) {
		const target = e.currentTarget as HTMLInputElement;
		ondatachange(node.id, widgetPortId, target.checked);
	}

	function revoke_old_blob(): void {
		const old = getFileValue();
		if (old?.url?.startsWith("blob:")) URL.revokeObjectURL(old.url);
	}

	function adopt_file(file: File): void {
		revoke_old_blob();
		ondatachange(node.id, widgetPortId, {
			name: file.name,
			url: URL.createObjectURL(file),
			mime: file.type
		});
	}

	function handleFileSelect(e: Event) {
		const file = (e.currentTarget as HTMLInputElement).files?.[0];
		if (file) adopt_file(file);
	}

	function handleFileDrop(e: DragEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragActive = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) adopt_file(file);
	}

	const ACCEPT: Partial<Record<PortType, string>> = {
		image: "image/*",
		audio: "audio/*",
		video: "video/*",
		model3d: ".glb,.gltf,.obj,.stl"
	};

	function clearFile() {
		revoke_old_blob();
		ondatachange(node.id, widgetPortId, null);
	}

	function beginCapture(): void {
		// This must run in the button's click handler. Calling getUserMedia from
		// the capture component's effect loses the user activation in browsers
		// that require it, leaving the panel at “Opening mic…”.
		captureStreamPromise = navigator.mediaDevices.getUserMedia(
			widgetType === "audio" ? { audio: true } : { video: true }
		);
		capturing = true;
	}

	/**
	 * Download the current file value. Same-origin and blob/data URLs work
	 * via a direct `<a download>`. Cross-origin URLs (e.g. HF Inference
	 * results) often ignore the download attribute and navigate instead,
	 * so we fetch into a blob first and then trigger the link on the
	 * resulting object URL — that forces a save instead of a tab swap.
	 */
	async function downloadFile() {
		const v = getFileValue();
		if (!v?.url) return;
		const name = v.name || "download";
		const sameOrigin =
			v.url.startsWith("blob:") ||
			v.url.startsWith("data:") ||
			(v.url.startsWith("http") &&
				new URL(v.url, window.location.origin).origin ===
					window.location.origin) ||
			!v.url.startsWith("http");
		try {
			const url = sameOrigin
				? v.url
				: await fetch(v.url)
						.then((r) => r.blob())
						.then((b) => URL.createObjectURL(b));
			const a = document.createElement("a");
			a.href = url;
			a.download = name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			if (!sameOrigin) setTimeout(() => URL.revokeObjectURL(url), 1000);
		} catch {
			// Fall back to navigating; user can right-click → save.
			window.open(v.url, "_blank", "noopener");
		}
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
<div
	class="widget-zone nodrag nopan nowheel"
	class:fill={fillHeight}
	class:native-resize={nativeTextareaResize}
	class:text-full={(effectiveWidgetType === "text" ||
		effectiveWidgetType === "json") &&
		!hasChoices}
	onmousedown={(e) => e.stopPropagation()}
	onpointerdown={(e) => e.stopPropagation()}
>
	{#if hasChoices && choices}
		{@const rawValue = node.data?.[widgetPortId]}
		{@const selected = multiselect && Array.isArray(rawValue) ? rawValue : []}
		{@const current =
			!multiselect && typeof rawValue === "string" ? rawValue : ""}
		<div class="widget-choices">
			{#each choices as choice}
				<label class="widget-choice-row">
					{#if multiselect}
						<input
							type="checkbox"
							class="widget-checkbox widget-checkbox-choice"
							checked={selected.includes(choice)}
							disabled={isReadonly}
							onchange={(e) =>
								ondatachange(
									node.id,
									widgetPortId,
									e.currentTarget.checked
										? [...selected, choice]
										: selected.filter((c) => c !== choice)
								)}
						/>
					{:else}
						<input
							type="radio"
							class="widget-radio"
							name="{node.id}-{widgetPortId}"
							value={choice}
							checked={current === choice}
							disabled={isReadonly}
							onchange={() => ondatachange(node.id, widgetPortId, choice)}
						/>
					{/if}
					<span class="widget-checkbox-label">{choice}</span>
				</label>
			{/each}
		</div>
	{:else if effectiveWidgetType === "text" || effectiveWidgetType === "json"}
		<div class="widget-text-wrap">
			<div class="widget-gradio-wrap">
				<BaseTextbox
					value={getTextValue()}
					label="text"
					show_label={false}
					lines={effectiveWidgetType === "json" ? 4 : 3}
					max_lines={8}
					placeholder={isReadonly
						? "Waiting for output..."
						: effectiveWidgetType === "json"
							? '{"key": "value"}'
							: "Enter text..."}
					disabled={isReadonly}
					onchange={(val) => {
						if (node.data?.[widgetPortId] !== val)
							ondatachange(node.id, widgetPortId, val);
					}}
				/>
			</div>
		</div>
	{:else if effectiveWidgetType === "number"}
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
	{:else if effectiveWidgetType === "boolean"}
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
	{:else if effectiveWidgetType === "html"}
		{#if htmlValue}
			<div
				class="widget-html-preview"
				bind:this={htmlPreviewEl}
				style={fillHeight
					? ""
					: `height: ${Math.round(HTML_PAGE_HEIGHT * htmlScale)}px;`}
			>
				<iframe
					class="widget-html-iframe"
					srcdoc={htmlValue}
					sandbox="allow-scripts"
					title="HTML preview"
					style="height: {HTML_PAGE_HEIGHT}px; transform: scale({htmlScale});"
				></iframe>
				<div class="widget-preview-actions">
					<button
						class="widget-action"
						onclick={() => openHtmlInTab(htmlValue)}
						title="Open in new tab"
						aria-label="Open in new tab"
					>
						<OpenLinkIcon />
					</button>
				</div>
			</div>
		{:else}
			<div class="widget-placeholder">Waiting for output...</div>
		{/if}
	{:else if effectiveWidgetType === "image" || effectiveWidgetType === "audio" || effectiveWidgetType === "video" || effectiveWidgetType === "file" || effectiveWidgetType === "gallery" || effectiveWidgetType === "model3d"}
		{@const fileVal = getFileValue()}
		{#if fileVal}
			<div class="widget-preview">
				{#if (effectiveWidgetType === "image" || effectiveWidgetType === "gallery") && isReadonly}
					<div class="widget-gradio-wrap widget-gradio-image">
						<BaseStaticImage
							value={{
								url: fileVal.url,
								orig_name: fileVal.name,
								path: fileVal.url,
								mime_type: fileVal.mime,
								meta: { _type: "gradio.FileData" }
							}}
							show_label={false}
							{i18n}
							buttons={[]}
						/>
					</div>
				{:else if effectiveWidgetType === "image" || effectiveWidgetType === "gallery"}
					<img class="widget-img" src={fileVal.url} alt={fileVal.name} />
				{:else if effectiveWidgetType === "audio"}
					<div class="widget-audio-shell">
						<audio class="widget-audio" controls src={fileVal.url}></audio>
					</div>
				{:else if effectiveWidgetType === "video"}
					<video class="widget-video" controls src={fileVal.url}></video>
				{:else}
					<div class="widget-file-info">
						<span class="widget-file-name">{fileVal.name}</span>
					</div>
				{/if}
				<div class="widget-preview-actions">
					{#if (effectiveWidgetType === "image" || effectiveWidgetType === "gallery") && wf?.onviewfullscreen}
						<button
							class="widget-action"
							onclick={(e) => {
								e.stopPropagation();
								wf.onviewfullscreen?.(fileVal.url, fileVal.name ?? "image");
							}}
							onpointerdown={(e) => e.stopPropagation()}
							title="View full screen"
							aria-label="View full screen"
						>
							<ExpandIcon />
						</button>
					{/if}
					<button
						class="widget-action"
						onclick={downloadFile}
						title="Download {fileVal.name}"
						aria-label="Download"
					>
						<DownloadIcon />
					</button>
					{#if !isReadonly}
						<button
							class="widget-action widget-clear"
							onclick={clearFile}
							title="Clear"
							aria-label="Clear">&times;</button
						>
					{/if}
				</div>
			</div>
		{:else if isReadonly}
			<div class="widget-placeholder">Waiting for output...</div>
		{:else if capturing && captureStreamPromise}
			<NodeCapture
				kind={widgetType === "audio" ? "audio" : "image"}
				streamPromise={captureStreamPromise}
				onfile={(f) => {
					adopt_file(f);
					captureStreamPromise = null;
					capturing = false;
				}}
				oncancel={() => {
					captureStreamPromise = null;
					capturing = false;
				}}
			/>
		{:else}
			<!-- Empty input: drop anywhere on the zone, or take one of the two
			     explicit routes in. The buttons carry the affordance the old
			     "or record from mic" text link was too quiet to carry. -->
			<!-- svelte-ignore a11y_interactive_supports_focus -->
			<div
				class="widget-file-drop nodrag nopan"
				class:drag-active={dragActive}
				role="button"
				tabindex="0"
				title="Drop a file here, or click to browse"
				onclick={() => fileInputEl?.click()}
				onkeydown={(e) => {
					if (e.key === "Enter" || e.key === " ") fileInputEl?.click();
				}}
				onmousedown={(e) => e.stopPropagation()}
				onpointerdown={(e) => e.stopPropagation()}
				ondragenter={(e) => {
					e.preventDefault();
					e.stopPropagation();
					dragActive = true;
				}}
				ondragover={(e) => {
					e.preventDefault();
					e.stopPropagation();
					dragActive = true;
				}}
				ondragleave={(e) => {
					// Only the zone itself leaving counts; moving between its own
					// children fires dragleave too and would flicker the highlight.
					if (!e.currentTarget.contains(e.relatedTarget as Node | null))
						dragActive = false;
				}}
				ondrop={handleFileDrop}
			>
				<input
					bind:this={fileInputEl}
					type="file"
					accept={ACCEPT[widgetType] ?? "*"}
					onchange={handleFileSelect}
					style="display: none"
				/>
				<span class="widget-drop-text">
					{dragActive ? `Drop to add ${widgetType}` : `Drop ${widgetType} here`}
				</span>
				<div class="widget-drop-actions">
					<button
						class="widget-io-btn"
						onclick={(e) => {
							e.stopPropagation();
							fileInputEl?.click();
						}}
						onpointerdown={(e) => e.stopPropagation()}
						title="Choose a file"
					>
						<UploadIcon />
						<span>Upload</span>
					</button>
					{#if canCapture}
						<button
							class="widget-io-btn widget-io-record"
							onclick={(e) => {
								e.stopPropagation();
								beginCapture();
							}}
							onpointerdown={(e) => e.stopPropagation()}
							title={widgetType === "audio"
								? "Record from your microphone"
								: "Capture from your webcam"}
						>
							{#if widgetType === "audio"}
								<MicIcon />
								<span>Record</span>
							{:else}
								<CameraIcon />
								<span>Webcam</span>
							{/if}
						</button>
					{/if}
				</div>
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
		/* Canvas blocks user-select to stop dbl-click selecting random
		 * UI text; opt the widget back in so users can highlight + copy
		 * text inside textboxes / display zones. */
		user-select: text;
		-webkit-user-select: text;
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
		resize: none !important;
	}

	.widget-zone.text-full.native-resize :global(textarea) {
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

	.widget-choices {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 8px 12px 10px;
	}

	.widget-choice-row {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.widget-radio {
		width: 14px;
		height: 14px;
		accent-color: var(--accent);
		cursor: pointer;
		border-radius: 50%;
		appearance: auto;
		-webkit-appearance: radio;
	}

	.widget-checkbox-choice {
		width: 14px;
		height: 14px;
		accent-color: var(--accent);
		cursor: pointer;
		appearance: auto;
		-webkit-appearance: checkbox;
	}

	.widget-checkbox {
		width: 16px;
		height: 16px;
		border-radius: 3px;
		border-color: #3a3b48;
		cursor: pointer;
	}
	.widget-checkbox:checked {
		background-color: var(--accent);
		border-color: var(--accent);
	}
	:global(body:not(.dark)) .widget-checkbox:not(:checked) {
		border-color: #d0d2dc;
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
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 8px;
		min-height: 92px;
		padding: 12px 10px;
		border: none;
		border-radius: 0 0 10px 10px;
		background: #101118;
		cursor: pointer;
		transition:
			background 0.15s,
			box-shadow 0.15s;
		box-sizing: border-box;
	}

	.widget-file-drop:hover {
		background: #14151a;
	}

	/* Dragging over: inset ring rather than a real border, so the zone doesn't
	   change size (and shift the card) mid-drag. */
	.widget-file-drop.drag-active {
		background: #14161f;
		box-shadow: inset 0 0 0 1.5px var(--accent);
	}

	.widget-file-drop input {
		display: none;
	}

	.widget-drop-text {
		font-size: 10.5px;
		color: #4a4b58;
		text-align: center;
	}

	.widget-file-drop.drag-active .widget-drop-text {
		color: var(--accent);
	}

	.widget-drop-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 6px;
	}

	.widget-io-btn {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 4px 9px;
		border: 1px solid #2a2b38;
		border-radius: 5px;
		background: #191a23;
		color: #a8aab6;
		font-family: "Manrope", sans-serif;
		font-size: 10.5px;
		font-weight: 600;
		line-height: 1;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s;
	}

	.widget-io-btn:hover {
		background: #21222d;
		border-color: #3a3b4a;
		color: #e6e7ec;
	}

	.widget-io-record:hover {
		border-color: var(--accent);
		color: var(--accent);
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
		/* Scales with the node so widening one actually enlarges the preview;
		   --preview-max-h is set from the node width. */
		max-height: var(--preview-max-h, 320px);
		object-fit: contain;
		background: #101118;
	}

	.widget-audio-shell {
		display: flex;
		align-items: center;
		padding: 8px 10px;
		background: #15161e;
		border-radius: 0 0 10px 10px;
	}

	.widget-audio {
		display: block;
		width: 100%;
		height: 32px;
		border-radius: 7px;
	}

	.widget-video {
		display: block;
		width: 100%;
		max-height: 100px;
		object-fit: contain;
		border-radius: 5px;
	}

	.widget-preview-actions {
		position: absolute;
		top: 4px;
		right: 4px;
		display: flex;
		gap: 4px;
		opacity: 0;
		transition: opacity 0.15s;
	}

	.widget-preview:hover .widget-preview-actions {
		opacity: 1;
	}

	.widget-action {
		width: 22px;
		height: 22px;
		border-radius: 50%;
		border: none;
		background: rgba(0, 0, 0, 0.6);
		color: #d5d6de;
		font-size: 13px;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.widget-action:hover {
		background: rgba(0, 0, 0, 0.85);
		color: #fff;
	}

	.widget-clear:hover {
		background: rgba(239, 68, 68, 0.85);
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

	:global(body:not(.dark)) .widget-file-drop.drag-active {
		background: #f0f2f8;
	}

	:global(body:not(.dark)) .widget-drop-text {
		color: #9a9caa;
	}

	:global(body:not(.dark)) .widget-io-btn {
		background: #ffffff;
		border-color: #dfe1e9;
		color: #5c5e6a;
	}

	:global(body:not(.dark)) .widget-io-btn:hover {
		background: #f4f5f9;
		border-color: #c3c6d2;
		color: #1a1b25;
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

	/* The letterbox around a contained image is the element's own background, so
	   it has to follow the theme or a light canvas gets black bars. */
	:global(body:not(.dark)) .widget-img {
		background: #f1f2f6;
	}

	.widget-html-preview {
		position: relative;
		overflow: hidden;
		border-radius: 0 0 10px 10px;
		background: #fff;
	}

	.widget-html-iframe {
		display: block;
		width: 1280px;
		border: none;
		background: #fff;
		transform-origin: top left;
		pointer-events: none;
	}

	.widget-html-preview .widget-preview-actions {
		opacity: 0;
		transition: opacity 0.15s;
	}

	.widget-html-preview:hover .widget-preview-actions {
		opacity: 1;
	}

	/* ─── Fill mode ───
	 * The node has a height the user dragged out, so the widget takes the slack
	 * instead of leaving dead space under a fixed-size preview. Every rule here
	 * is a `min-height: 0` chain: without it a flex item refuses to shrink below
	 * its content and the card overflows. Comes last in the file so it wins
	 * against the natural-size rules above it. */
	.widget-zone.fill {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.widget-zone.fill > * {
		flex: 1 1 auto;
		min-height: 0;
	}

	.widget-zone.fill .widget-preview,
	.widget-zone.fill .widget-text-wrap,
	.widget-zone.fill .widget-gradio-wrap,
	.widget-zone.fill .widget-gradio-image {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.widget-zone.fill .widget-preview > *,
	.widget-zone.fill .widget-text-wrap > * {
		flex: 1 1 auto;
		min-height: 0;
	}

	.widget-zone.fill .widget-img,
	.widget-zone.fill .widget-video {
		height: 100%;
		max-height: none;
	}

	/* BaseStaticImage nests the image in wrappers that shrink-wrap to its natural
	   size, so stretching the outermost one isn't enough — the whole chain down
	   to the `img` has to be told to fill, or a small output stays a speck in the
	   middle of a card the user just dragged bigger. */
	.widget-zone.fill .widget-gradio-image :global(.image-container),
	.widget-zone.fill .widget-gradio-image :global(.image-frame),
	.widget-zone.fill .widget-gradio-image :global(button),
	.widget-zone.fill .widget-gradio-image :global(img) {
		width: 100% !important;
		height: 100% !important;
		max-height: none !important;
	}

	.widget-zone.fill .widget-gradio-image :global(img) {
		object-fit: contain !important;
	}

	/* A stretched native audio player looks broken, so keep it its own size and
	   let the auto margins park it in the middle of the space. */
	.widget-zone.fill .widget-audio-shell {
		flex: 0 0 auto;
		width: calc(100% - 16px);
		margin: auto 8px;
		border-radius: 8px;
	}

	:global(body:not(.dark)) .widget-audio-shell {
		background: #f8f9fb;
		border-top: 1px solid #eceef3;
	}

	.widget-zone.fill .widget-placeholder,
	.widget-zone.fill .widget-file-drop {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12px 10px;
	}

	.widget-zone.fill .widget-gradio-wrap :global(.block),
	.widget-zone.fill .widget-gradio-wrap :global(.container),
	.widget-zone.fill .widget-gradio-wrap :global(.input-container) {
		display: flex !important;
		flex-direction: column !important;
		flex: 1 1 auto !important;
		min-height: 0 !important;
	}

	.widget-zone.fill :global(textarea) {
		flex: 1 1 auto !important;
		height: 100% !important;
		min-height: 0 !important;
		resize: none !important;
	}

	.widget-zone.fill .widget-text-display {
		max-height: none;
	}
</style>
