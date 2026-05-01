<script lang="ts">
	import { LIBRARY, type NodeTemplate } from "./node-library";
	import { PORT_COLOR } from "./workflow-types";
	import type { PortType } from "./workflow-types";
	import { fetchSpaceApi, componentToPortType } from "./space-api";

	let { onadd = undefined }: { onadd?: (template: NodeTemplate) => void } = $props();

	let expandedSection: string | null = $state("spaces");
	let collapsed = $state(false);
	let hiddenPresets = $state(new Set<string>(
		typeof localStorage !== "undefined"
			? JSON.parse(localStorage.getItem("gradio_hidden_presets") ?? "[]")
			: []
	));
	let sidebarWidth = $state(220);
	let isResizing = $state(false);

	function startResize(e: MouseEvent) {
		e.preventDefault();
		isResizing = true;
		const startX = e.clientX;
		const startWidth = sidebarWidth;

		function onMove(ev: MouseEvent) {
			sidebarWidth = Math.max(160, Math.min(400, startWidth + (ev.clientX - startX)));
		}
		function onUp() {
			isResizing = false;
			window.removeEventListener("mousemove", onMove);
			window.removeEventListener("mouseup", onUp);
		}
		window.addEventListener("mousemove", onMove);
		window.addEventListener("mouseup", onUp);
	}
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
	let searchResults: { id: string; likes: number; title?: string; description?: string; running: boolean }[] = $state([]);
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
					`https://huggingface.co/api/spaces/semantic-search?q=${encodeURIComponent(query)}&limit=8`
				);
				if (!res.ok) { searchResults = []; return; }
				const data = await res.json();
				searchResults = data
					.filter((s: any) => s.sdk === "gradio")
					.slice(0, 6)
					.map((s: any) => ({
						id: s.id,
						likes: s.likes ?? 0,
						title: s.title || s.id.split("/").pop(),
						description: s.ai_short_description || "",
						running: s.runtime?.stage === "RUNNING"
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

	async function addCustomSpace() {
		const spaceId = customSpaceInput.trim();
		if (!spaceId || !spaceId.includes("/")) return;
		if (
			customSpaces.some((s) => s.space_id === spaceId) ||
			LIBRARY.spaces.some((s) => s.space_id === spaceId && !hiddenPresets.has(spaceId))
		) {
			customSpaceInput = "";
			return;
		}

		loadingSpace = true;
		loadingSpaceName = spaceId;
		spaceError = "";
		customSpaceInput = "";

		try {
			const apiInfo = await fetchSpaceApi(spaceId);
			const label = spaceId.split("/").pop() ?? spaceId;

			customSpaces = [
				...customSpaces,
				{
					label,
					kind: "transform",
					source: "space",
					space_id: spaceId,
					endpoint: apiInfo.endpoint,
					inputs: apiInfo.inputs,
					outputs: apiInfo.outputs,
					width: apiInfo.width,
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

	const spaceCategories = [
		{ key: "image", label: "Image" },
		{ key: "audio", label: "Audio" },
		{ key: "text", label: "Text" },
		{ key: "video", label: "Video" }
	];

	function getSpacesByCategory(cat: string) {
		return LIBRARY.spaces.filter((s) => s.category === cat && !hiddenPresets.has(s.space_id ?? ""));
	}

	function removePreset(spaceId: string) {
		hiddenPresets = new Set([...hiddenPresets, spaceId]);
		localStorage.setItem("gradio_hidden_presets", JSON.stringify([...hiddenPresets]));
	}

	const sections = [
		{ key: "spaces", label: "Spaces", icon: "hub", items: LIBRARY.spaces },
		{ key: "inputs", label: "Inputs", icon: "arrow_forward", items: LIBRARY.inputs },
		{ key: "outputs", label: "Outputs", icon: "arrow_back", items: LIBRARY.outputs }
	];
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<svelte:window onclick={handleWindowClick} />

<aside class="sidebar" class:sidebar-collapsed={collapsed} style="width: {collapsed ? 40 : sidebarWidth}px; min-width: {collapsed ? 40 : sidebarWidth}px;">
	<div class="sidebar-header">
		<button class="sidebar-collapse-btn" onclick={() => collapsed = !collapsed}>
			{collapsed ? "▸" : "◂"}
		</button>
		{#if !collapsed}
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
			<span class="section-chevron">{expandedSection === section.key ? "▾" : "▸"}</span>
		</button>

		{#if expandedSection === section.key}
			<div class="section-items">
				{#if section.key === "spaces"}
					<!-- Categorized spaces -->
					{#each spaceCategories as cat}
						{@const catSpaces = getSpacesByCategory(cat.key)}
						{#if catSpaces.length > 0}
							<div class="category-header">
								<span class="category-label">{cat.label}</span>
							</div>
							{#each catSpaces as item}
								{@const pt = primaryType(item)}
								<div
									draggable="true"
									class="chip"
									onclick={() => onadd?.(item)}
									ondragstart={(e) => {
										e.dataTransfer!.setData("node-template", JSON.stringify(item));
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
									<a
										class="chip-link"
										href="https://huggingface.co/spaces/{item.space_id}"
										target="_blank"
										rel="noopener"
										onclick={(e) => e.stopPropagation()}
										title="Open on HuggingFace"
									>&#x2197;</a>
									<button
										class="chip-remove"
										onclick={(e) => { e.stopPropagation(); removePreset(item.space_id ?? ""); }}
										title="Remove"
									>&times;</button>
								</div>
							{/each}
						{/if}
					{/each}
				{:else}
					{#each section.items as item}
						{@const pt = primaryType(item)}
						<div
							draggable="true"
							class="chip"
							onclick={() => onadd?.(item)}
							ondragstart={(e) => {
								e.dataTransfer!.setData("node-template", JSON.stringify(item));
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
						</div>
					{/each}
				{/if}

				{#if section.key === "spaces"}
					{#each customSpaces as item, i}
						{@const pt = primaryType(item)}
						<div
							draggable="true"
							class="chip"
							onclick={() => onadd?.(item)}
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
										<div class="search-result-top">
											<span class="search-result-status" class:search-result-running={result.running} title={result.running ? "Running" : "Not running"}></span>
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
										</div>
										{#if result.description}
											<div class="search-result-desc">{result.description}</div>
										{/if}
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
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	{#if !collapsed}
		<div class="resize-handle" onmousedown={startResize}></div>
	{/if}
</aside>

<style>
	.sidebar {
		position: relative;
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
		width: 24px;
		height: 24px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: #5c5e6a;
		font-size: 16px !important;
		cursor: pointer;
		flex-shrink: 0;
		padding: 0;
		line-height: 1;
		transition: color 0.15s, background 0.15s;
	}

	.sidebar-collapse-btn:hover {
		background: #1e1f2a;
		color: #a0a2ae;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 12px 12px 10px;
		border-bottom: 1px solid #1e1f2a;
	}

	.sidebar-collapsed .sidebar-header {
		justify-content: center;
		padding: 14px 8px 10px;
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
		font-size: 14px !important;
		color: #5c5e6a;
		line-height: 1;
	}

	.section-toggle.expanded .section-chevron {
		transform: none;
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
		cursor: pointer;
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

	.category-header {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 10px 4px;
		margin-top: 4px;
	}

	.category-header:first-child {
		margin-top: 0;
	}

	.category-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #5c5e6a;
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
		flex-direction: column;
		width: 100%;
		padding: 7px 10px;
		border: none;
		border-bottom: 1px solid #1e1f2a;
		background: transparent;
		color: #c8c9d2;
		cursor: pointer;
		text-align: left;
		transition: background 0.1s;
	}

	.search-result:last-child {
		border-bottom: none;
	}

	.search-result:hover {
		background: #1a1b25;
	}

	.search-result-top {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
	}

	.search-result-status {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #5c5e6a;
		flex-shrink: 0;
	}

	.search-result-running {
		background: #34d399;
		box-shadow: 0 0 4px #34d39960;
	}

	.search-result-name {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.search-result-desc {
		font-size: 9.5px;
		color: #5c5e6a;
		margin-top: 2px;
		padding-left: 12px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.search-result-likes {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #5c5e6a;
		flex-shrink: 0;
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

	.resize-handle {
		position: absolute;
		top: 0;
		right: -3px;
		width: 6px;
		height: 100%;
		cursor: col-resize;
		z-index: 10;
	}

	.resize-handle:hover {
		background: rgba(249, 115, 22, 0.3);
	}

	.hint {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #2e2f3d;
		letter-spacing: 0.02em;
	}
</style>
