<script lang="ts">
	import { Client } from "@gradio/client";
	import { LIBRARY, type NodeTemplate } from "./node-library";
	import { PORT_COLOR } from "./workflow-types";
	import type { PortType } from "./workflow-types";

	let expandedSection: string | null = $state("inputs");
	let collapsed = $state(false);
	let customSpaceInput = $state("");
	let customSpaces: NodeTemplate[] = $state([]);
	let loadingSpace = $state(false);
	let loadingSpaceName = $state("");
	let spaceError = $state("");

	function handleWindowClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		if (searchResults.length > 0 && !target.closest(".add-space-wrapper")) {
			searchResults = [];
		}
	}

	// Search state
	let searchResults: { id: string; likes: number; title?: string }[] = $state([]);
	let searching = $state(false);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	function handleSearchInput(e: Event) {
		const query = (e.currentTarget as HTMLInputElement).value;
		customSpaceInput = query;
		spaceError = "";

		if (searchTimeout) clearTimeout(searchTimeout);

		if (query.length < 2) {
			searchResults = [];
			searching = false;
			return;
		}

		// If it looks like an exact space ID, don't search
		if (query.includes("/") && !query.endsWith("/")) {
			searchResults = [];
			return;
		}

		searching = true;
		searchTimeout = setTimeout(async () => {
			try {
				const res = await fetch(
					`https://huggingface.co/api/spaces?search=${encodeURIComponent(query)}&filter=gradio&limit=20&sort=likes&direction=-1&expand[]=likes&expand[]=cardData&expand[]=runtime`
				);
				if (!res.ok) { searchResults = []; return; }
				const data = await res.json();
				searchResults = data
					.filter((s: any) => s.runtime?.stage === "RUNNING")
					.slice(0, 6)
					.map((s: any) => ({
						id: s.id,
						likes: s.likes ?? 0,
						title: s.cardData?.title || s.id.split("/").pop()
					}));
			} catch {
				searchResults = [];
			} finally {
				searching = false;
			}
		}, 300);
	}

	function selectSearchResult(spaceId: string) {
		customSpaceInput = spaceId;
		searchResults = [];
		addCustomSpace();
	}

	function primaryType(
		item: (typeof LIBRARY)["inputs"][number]
	): PortType {
		return item.outputs[0]?.type ?? item.inputs[0]?.type ?? "any";
	}

	function toggle(section: string) {
		expandedSection = expandedSection === section ? null : section;
	}

	// Map Gradio component types to our port types
	function componentToPortType(component: string, type?: string): PortType {
		const c = component.toLowerCase();
		if (c === "image" || c === "imageeditor") return "image";
		if (c === "gallery") return "gallery";
		if (c === "audio") return "audio";
		if (c === "video") return "video";
		if (c === "number" || c === "slider") return "number";
		if (c === "checkbox") return "boolean";
		if (c === "file" || c === "uploadbutton" || c === "downloadbutton") return "file";
		if (c === "model3d") return "model3d";
		if (c === "json" || c === "dataframe") return "json";
		if (c === "textbox" || c === "text" || c === "markdown" || c === "chatbot" || c === "label" || c === "code" || c === "highlightedtext" || c === "dropdown" || c === "radio" || c === "checkboxgroup" || c === "colorpicker") return "text";

		// Fallback: check the type field from the API
		if (type) {
			const t = type.toLowerCase();
			if (t.includes("image") || t.includes("pil")) return "image";
			if (t.includes("video") || t.includes("mp4")) return "video";
			if (t.includes("audio") || t.includes("wav") || t.includes("mp3")) return "audio";
			if (t.includes("filepath") || t.includes("file")) return "file";
			if (t === "number" || t === "float" || t === "int" || t === "integer") return "number";
			if (t === "bool" || t === "boolean") return "boolean";
			if (t === "str" || t === "string") return "text";
		}

		return "any";
	}

	async function addCustomSpace() {
		const spaceId = customSpaceInput.trim();
		if (!spaceId || !spaceId.includes("/")) return;
		if (
			customSpaces.some((s) => s.space_id === spaceId) ||
			LIBRARY.spaces.some((s) => s.space_id === spaceId)
		) {
			customSpaceInput = "";
			return;
		}

		loadingSpace = true;
		loadingSpaceName = spaceId;
		spaceError = "";
		customSpaceInput = "";

		try {
			// Timeout after 10s to avoid infinite retries on static/non-Gradio Spaces
			const app = await Promise.race([
				Client.connect(spaceId.startsWith("http") ? spaceId : `https://${spaceId.replace("/", "-").toLowerCase()}.hf.space`),
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error("Timed out — Space may not have a Gradio API")), 10000)
				)
			]);
			const api = await app.view_api();
			const named = api.named_endpoints ?? {};
			const unnamed = api.unnamed_endpoints ?? {};
			// Merge named and unnamed endpoints
			const endpoints = { ...named, ...unnamed };
			const endpointNames = Object.keys(endpoints);

			if (endpointNames.length === 0) {
				spaceError = "No API endpoints found";
				loadingSpace = false;
				return;
			}

			// Pick the best endpoint: prefer /predict, then the one with the most returns
			let epName: string;
			if (endpointNames.includes("/predict")) {
				epName = "/predict";
			} else {
				// Sort by number of returns (descending) to pick the most complete endpoint
				epName = endpointNames.sort((a, b) =>
					(endpoints[b].returns?.length ?? 0) - (endpoints[a].returns?.length ?? 0)
				)[0];
			}
			const ep = endpoints[epName];

			const inputs = (ep.parameters ?? []).map((p: any, i: number) => {
				const hasDefault = p.default !== undefined && p.default !== null;
				return {
					id: `in_${i}`,
					label: p.label || p.parameter_name || `Input ${i}`,
					type: componentToPortType(p.component ?? "", p.type ?? ""),
					required: !hasDefault,
					default_value: hasDefault ? p.default : undefined
				};
			});

			const outputs = (ep.returns ?? []).map((r: any, i: number) => ({
				id: `out_${i}`,
				label: r.label || `Output ${i}`,
				type: componentToPortType(r.component ?? "", r.type ?? "")
			}));

			// Fallback if introspection returns empty
			if (inputs.length === 0) inputs.push({ id: "in", label: "Input", type: "any" as PortType });
			if (outputs.length === 0) outputs.push({ id: "out", label: "Output", type: "any" as PortType });

			const label = spaceId.split("/").pop() ?? spaceId;
			// Calculate width based on longest port label
			const maxPortLen = Math.max(
				...inputs.map((p: any) => (p.label as string).length),
				...outputs.map((p: any) => (p.label as string).length),
				label.length
			);
			const width = Math.max(280, Math.min(400, maxPortLen * 9 + 100));
			customSpaces = [
				...customSpaces,
				{
					label,
					kind: "transform",
					source: "space",
					space_id: spaceId,
					endpoint: epName,
					inputs,
					outputs,
					width,
					height: 90
				}
			];
			customSpaceInput = "";
		} catch (err) {
			spaceError = err instanceof Error ? err.message : "Failed to connect";
		} finally {
			loadingSpace = false;
		}
	}

	const sections = [
		{ key: "inputs", label: "Inputs", icon: "arrow_forward", items: LIBRARY.inputs },
		{ key: "spaces", label: "Spaces", icon: "hub", items: LIBRARY.spaces },
		{ key: "outputs", label: "Outputs", icon: "arrow_back", items: LIBRARY.outputs }
	];
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<svelte:window onclick={handleWindowClick} />

<aside class="sidebar" class:sidebar-collapsed={collapsed}>
	<div class="sidebar-header">
		<button class="sidebar-collapse-btn" onclick={() => collapsed = !collapsed}>
			{collapsed ? "›" : "‹"}
		</button>
		{#if !collapsed}
			<span class="sidebar-icon">&#xe1b8;</span>
			<span class="sidebar-title">Components</span>
		{/if}
	</div>

	{#if !collapsed}
	{#each sections as section}
		<button
			class="section-toggle"
			class:expanded={expandedSection === section.key}
			onclick={() => toggle(section.key)}
		>
			<span class="section-label">{section.label}</span>
			<span class="section-count">{section.key === "spaces" ? section.items.length + customSpaces.length : section.items.length}</span>
			<span class="section-chevron">&#x203A;</span>
		</button>

		{#if expandedSection === section.key}
			<div class="section-items">
				{#each section.items as item}
					{@const pt = primaryType(item)}
					<div
						draggable="true"
						class="chip"
						ondragstart={(e) => {
							e.dataTransfer!.setData(
								"node-template",
								JSON.stringify(item)
							);
							const ghost = document.createElement("div");
							ghost.textContent = item.label;
							ghost.style.cssText = `background:${PORT_COLOR[pt]};color:#0c0d10;padding:4px 10px;border-radius:5px;font-family:Manrope,sans-serif;font-size:11px;font-weight:600;position:fixed;top:-100px`;
							document.body.appendChild(ghost);
							e.dataTransfer!.setDragImage(ghost, 0, 0);
							setTimeout(() => document.body.removeChild(ghost), 0);
						}}
					>
						<span
							class="chip-dot"
							style="background: {PORT_COLOR[pt]}; box-shadow: 0 0 6px {PORT_COLOR[pt]}40"
						></span>
						<span class="chip-label">{item.label}</span>
						{#if item.source === "space" && item.space_id}
							<a
								class="chip-link"
								href="https://huggingface.co/spaces/{item.space_id}"
								target="_blank"
								rel="noopener"
								onclick={(e) => e.stopPropagation()}
								title="Open on HuggingFace"
							>&#x2197;</a>
						{/if}
					</div>
				{/each}

				{#if section.key === "spaces"}
					{#each customSpaces as item, i}
						{@const pt = primaryType(item)}
						<div
							draggable="true"
							class="chip"
							ondragstart={(e) =>
								e.dataTransfer!.setData(
									"node-template",
									JSON.stringify(item)
								)}
						>
							<span
								class="chip-dot"
								style="background: {PORT_COLOR[pt]}; box-shadow: 0 0 6px {PORT_COLOR[pt]}40"
							></span>
							<span class="chip-label">{item.label}</span>
							{#if item.space_id}
								<a
									class="chip-link"
									href="https://huggingface.co/spaces/{item.space_id}"
									target="_blank"
									rel="noopener"
									onclick={(e) => e.stopPropagation()}
									title="Open on HuggingFace"
								>&#x2197;</a>
							{/if}
							<button
								class="chip-remove"
								onclick={(e) => { e.stopPropagation(); customSpaces = customSpaces.filter((_, j) => j !== i); }}
								title="Remove"
							>&times;</button>
						</div>
					{/each}
					<div class="add-space-wrapper">
						<div class="add-space">
							<input
								class="space-input"
								type="text"
								placeholder="Search Spaces..."
								value={customSpaceInput}
								disabled={loadingSpace}
								oninput={handleSearchInput}
								onkeydown={(e) => {
									if (e.key === "Enter" && customSpaceInput.includes("/")) {
										searchResults = [];
										addCustomSpace();
									}
									if (e.key === "Escape") searchResults = [];
								}}
							/>
							<button
								class="space-add-btn"
								onclick={() => { searchResults = []; addCustomSpace(); }}
								disabled={loadingSpace || !customSpaceInput.trim().includes("/")}
							>{loadingSpace ? "..." : "+"}</button>
						</div>
						{#if searchResults.length > 0}
							<div class="search-dropdown">
								{#each searchResults as result}
									<button
										class="search-result"
										onclick={() => selectSearchResult(result.id)}
									>
										<span class="search-result-name">{result.id}</span>
										<span class="search-result-likes">&hearts; {result.likes}</span>
										<a
											class="search-result-link"
											href="https://huggingface.co/spaces/{result.id}"
											target="_blank"
											rel="noopener"
											onclick={(e) => e.stopPropagation()}
											title="Open on HuggingFace"
										>&#x2197;</a>
									</button>
								{/each}
							</div>
						{:else if searching}
							<div class="search-dropdown">
								<div class="search-searching">Searching...</div>
							</div>
						{/if}
					</div>
					{#if loadingSpace}
						<div class="space-loading">
							<span class="space-loading-spinner"></span>
							<span class="space-loading-text">Connecting to {loadingSpaceName}...</span>
						</div>
					{/if}
					{#if spaceError}
						<span class="space-error">{spaceError}</span>
					{/if}
				{/if}
			</div>
		{/if}
	{/each}

	<div class="sidebar-footer">
		<span class="hint">Drag to canvas</span>
	</div>
	{/if}
</aside>

<style>
	.sidebar {
		width: 220px;
		min-width: 220px;
		transition: width 0.2s, min-width 0.2s;
		display: flex;
		flex-direction: column;
		background: #101118;
		border-right: 1px solid #1e1f2a;
		overflow-y: auto;
		font-family: "Manrope", sans-serif;
		color-scheme: dark;
	}

	.sidebar-collapsed {
		width: 40px;
		min-width: 40px;
	}

	.sidebar-collapse-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #5c5e6a;
		font-size: 14px;
		cursor: pointer;
		flex-shrink: 0;
		transition: color 0.15s, background 0.15s;
	}

	.sidebar-collapse-btn:hover {
		background: #1e1f2a;
		color: #a0a2ae;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 16px 10px;
		border-bottom: 1px solid #1e1f2a;
	}

	.sidebar-collapsed .sidebar-header {
		justify-content: center;
		padding: 14px 8px 10px;
	}

	.sidebar-icon {
		font-family: "Material Symbols Rounded";
		font-size: 16px;
		color: #5c5e6a;
	}

	.sidebar-title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #5c5e6a;
	}

	.section-toggle {
		display: flex;
		align-items: center;
		width: 100%;
		padding: 10px 16px;
		border: none;
		background: transparent;
		cursor: pointer;
		transition: background 0.15s;
	}

	.section-toggle:hover {
		background: #16171f;
	}

	.section-label {
		font-size: 12px;
		font-weight: 600;
		color: #a0a2ae;
		flex: 1;
		text-align: left;
	}

	.section-count {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #3e3f4d;
		margin-right: 6px;
	}

	.section-chevron {
		font-size: 14px;
		color: #3e3f4d;
		transition: transform 0.2s;
		line-height: 1;
	}

	.section-toggle.expanded .section-chevron {
		transform: rotate(90deg);
	}

	.section-items {
		padding: 2px 8px 8px;
	}

	.chip {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 7px 10px;
		margin-bottom: 2px;
		border-radius: 6px;
		cursor: grab;
		transition:
			background 0.15s,
			transform 0.1s;
		background: transparent;
	}

	.chip:hover {
		background: #1a1b25;
	}

	.chip:active {
		cursor: grabbing;
		transform: scale(0.98);
	}

	.chip-dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.chip-label {
		font-size: 12.5px;
		font-weight: 500;
		color: #c8c9d2;
		flex: 1;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.chip-link {
		display: none;
		font-size: 11px;
		color: #5c5e6a;
		text-decoration: none;
		flex-shrink: 0;
		line-height: 1;
		padding: 2px;
		border-radius: 3px;
		transition: color 0.15s;
	}

	.chip:hover .chip-link {
		display: block;
	}

	.chip-link:hover {
		color: #c8c9d2;
	}

	.chip-remove {
		display: none;
		width: 16px;
		height: 16px;
		border: none;
		border-radius: 3px;
		background: transparent;
		color: #5c5e6a;
		font-size: 12px;
		line-height: 1;
		cursor: pointer;
		align-items: center;
		justify-content: center;
		padding: 0;
		flex-shrink: 0;
	}

	.chip:hover .chip-remove {
		display: flex;
	}

	.chip-remove:hover {
		color: #ef4444;
		background: rgba(239, 68, 68, 0.15);
	}

	.chip-badge {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.04em;
		padding: 1px 5px;
		border-radius: 3px;
		background: #1e1f2a;
		color: #5c5e6a;
	}

	.add-space {
		display: flex;
		gap: 4px;
		padding: 6px 4px 2px;
	}

	.space-input {
		flex: 1;
		font-family: "JetBrains Mono", monospace;
		font-size: 10.5px;
		height: 28px;
		padding: 0 8px;
		border: 1px solid #1e1f2a;
		border-radius: 5px;
		background: #0c0d10;
		color: #c8c9d2;
		outline: none;
		min-width: 0;
		box-sizing: border-box;
	}

	.space-input::placeholder {
		color: #5c5e6a;
	}

	.space-input:focus {
		border-color: #3e3f4d;
	}

	.space-add-btn {
		width: 28px;
		height: 28px;
		border: 1px solid #3e3f4d;
		border-radius: 5px;
		background: #1a1b25;
		color: #a0a2ae;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.15s, color 0.15s, border-color 0.15s;
		flex-shrink: 0;
	}

	.space-add-btn:hover:not(:disabled) {
		background: #2a2b36;
		color: #f97316;
		border-color: #f97316;
	}

	.space-add-btn:disabled {
		opacity: 0.35;
		cursor: default;
		background: #101118;
		color: #3e3f4d;
		border-color: #1e1f2a;
	}

	.add-space-wrapper {
		position: relative;
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 4px;
		right: 4px;
		background: #16171f;
		border: 1px solid #2a2b36;
		border-radius: 6px;
		margin-top: 2px;
		overflow: hidden;
		z-index: 10;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.search-result {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 7px 10px;
		border: none;
		background: transparent;
		color: #c8c9d2;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
	}

	.search-result:hover {
		background: #1a1b25;
	}

	.search-result-name {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.search-result-likes {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #5c5e6a;
		flex-shrink: 0;
		margin-left: 6px;
	}

	.search-result-link {
		font-size: 11px;
		color: #5c5e6a;
		text-decoration: none;
		flex-shrink: 0;
		padding: 2px;
		border-radius: 3px;
		transition: color 0.15s;
	}

	.search-result-link:hover {
		color: #c8c9d2;
	}

	.search-searching {
		font-family: "JetBrains Mono", monospace;
		font-size: 9.5px;
		color: #5c5e6a;
		padding: 8px 10px;
		text-align: center;
	}

	.space-loading {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 12px;
	}

	.space-loading-spinner {
		width: 12px;
		height: 12px;
		border: 2px solid transparent;
		border-top-color: #f5a623;
		border-radius: 50%;
		animation: sidebar-spin 0.7s linear infinite;
		flex-shrink: 0;
	}

	@keyframes sidebar-spin {
		to { transform: rotate(360deg); }
	}

	.space-loading-text {
		font-family: "JetBrains Mono", monospace;
		font-size: 9.5px;
		color: #5c5e6a;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.space-error {
		display: block;
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #ef4444;
		padding: 2px 12px 4px;
	}

	.sidebar-footer {
		margin-top: auto;
		padding: 12px 16px;
		border-top: 1px solid #1e1f2a;
	}

	.hint {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #2e2f3d;
		letter-spacing: 0.02em;
	}
</style>
