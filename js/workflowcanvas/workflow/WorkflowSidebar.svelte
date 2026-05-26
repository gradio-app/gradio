<script lang="ts">
	import { LIBRARY, SPACE_CATEGORIES, TASK_SCHEMAS, categorizeSpace, type NodeTemplate } from "./node-library";
	import { PORT_COLOR } from "./workflow-types";
	import type { PortType } from "./workflow-types";
	import { fetchSpaceApi, componentToPortType } from "./space-api";

	interface TrendingSpace {
		id: string;
		title: string;
		description: string;
		likes: number;
		running: boolean;
		category: string | null;
	}

	let { onadd = undefined, server = {}, hfToken = "", trendingSpaces: propTrendingSpaces = undefined, trendingLoading: propTrendingLoading = undefined }: { onadd?: (template: NodeTemplate) => void; server?: Record<string, any>; hfToken?: string; trendingSpaces?: TrendingSpace[]; trendingLoading?: boolean } = $props();

	let expandedSection: string | null = $state("spaces");
	let collapsed = $state(false);
	let sidebarWidth = $state(240);
	let isResizing = $state(false);

	// Load custom spaces from localStorage
	let customSpaces: NodeTemplate[] = $state(
		typeof localStorage !== "undefined"
			? JSON.parse(localStorage.getItem("gradio_custom_spaces") ?? "[]")
			: []
	);

	// Auto-save custom spaces to localStorage
	$effect(() => {
		if (typeof localStorage !== "undefined") {
			localStorage.setItem("gradio_custom_spaces", JSON.stringify(customSpaces));
		}
	});

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
	let loadingSpace = $state(false);
	let loadingSpaceName = $state("");
	let spaceError = $state("");

	function handleWindowClick(e: MouseEvent): void {
		const target = e.target as HTMLElement;
		if (searchResults.length > 0 && !target.closest(".add-space-wrapper")) {
			searchResults = [];
		}
	}

	// Trending spaces — use parent-provided data if available, otherwise fetch own
	let ownTrendingSpaces: TrendingSpace[] = $state([]);
	let ownTrendingLoading = $state(true);
	let trendingSpaces = $derived(propTrendingSpaces ?? ownTrendingSpaces);
	let trendingLoading = $derived(propTrendingLoading ?? ownTrendingLoading);

	async function fetchTrendingSpaces() {
		if (propTrendingSpaces !== undefined) return;
		if (!server?.search_spaces) { ownTrendingLoading = false; return; }
		try {
			const raw = await server.search_spaces(["trending", "", ""]);
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			if (!Array.isArray(data)) { ownTrendingSpaces = []; return; }
			ownTrendingSpaces = data
				.map((s: any) => {
					const desc = s.cardData?.short_description || "";
					return {
						id: s.id,
						title: s.cardData?.title || s.id.split("/").pop() || s.id,
						description: desc,
						likes: s.likes ?? 0,
						running: s.runtime?.stage === "RUNNING",
						category: categorizeSpace(s.cardData?.pipeline_tag, s.cardData?.tags, desc, s.id)
					};
				})
				.filter((s: TrendingSpace) => s.category !== null && s.running);
		} catch {
			ownTrendingSpaces = [];
		} finally {
			ownTrendingLoading = false;
		}
	}

	if (typeof window !== "undefined") {
		fetchTrendingSpaces();
	}

	function trendingToTemplate(space: TrendingSpace): NodeTemplate {
		return {
			label: space.id.split("/").pop() || space.id,
			kind: "transform",
			source: "space",
			space_id: space.id,
			category: space.category ?? undefined,
			inputs: [],
			outputs: [],
			width: 280,
			height: 90
		};
	}

	function getTrendingByCategory(cat: string): TrendingSpace[] {
		return trendingSpaces.filter((s) => s.category === cat);
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
				if (!server?.search_spaces) { searchResults = []; return; }
				const raw = await server.search_spaces(["search", query, ""]);
				const data = typeof raw === "string" ? JSON.parse(raw) : raw;
				if (!Array.isArray(data)) { searchResults = []; return; }
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
			customSpaces.some((s) => s.space_id === spaceId)
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


	// ── Model search ──
	interface HFModel {
		id: string;
		pipeline_tag: string;
		likes: number;
		downloads: number;
	}

	const MODEL_TASKS = [
		{ key: "text-to-image", label: "Text → Image" },
		{ key: "text-generation", label: "Text Generation" },
		{ key: "image-to-text", label: "Image → Text" },
		{ key: "image-classification", label: "Image Classification" },
		{ key: "object-detection", label: "Object Detection" },
		{ key: "automatic-speech-recognition", label: "Speech → Text" },
		{ key: "text-to-speech", label: "Text → Speech" },
		{ key: "translation", label: "Translation" },
		{ key: "summarization", label: "Summarization" },
		{ key: "text-classification", label: "Text Classification" },
		{ key: "image-to-image", label: "Image → Image" },
		{ key: "depth-estimation", label: "Depth Estimation" },
		{ key: "image-segmentation", label: "Image Segmentation" },
		{ key: "text-to-video", label: "Text → Video" },
		{ key: "image-text-to-text", label: "Image+Text → Text" },
		{ key: "feature-extraction", label: "Embeddings" },
	];

	let modelSearchQuery = $state("");
	let modelSearchResults: HFModel[] = $state([]);
	let modelSearching = $state(false);
	let modelSearchTimeout: ReturnType<typeof setTimeout> | null = null;
	let selectedModelTask = $state("");
	let trendingModels: HFModel[] = $state([]);
	let trendingModelsLoading = $state(true);

	async function fetchTrendingModels() {
		if (!server?.search_models) { trendingModelsLoading = false; return; }
		try {
			const raw = await server.search_models(["trending", "", "", ""]);
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			if (!Array.isArray(data)) { trendingModels = []; return; }
			trendingModels = data
				.filter((m: any) => m.pipeline_tag && TASK_SCHEMAS[m.pipeline_tag])
				.map((m: any) => ({
					id: m.id,
					pipeline_tag: m.pipeline_tag,
					likes: m.likes ?? 0,
					downloads: m.downloads ?? 0,
				}));
		} catch {
			trendingModels = [];
		} finally {
			trendingModelsLoading = false;
		}
	}

	if (typeof window !== "undefined") {
		fetchTrendingModels();
	}

	function handleModelSearch(e: Event) {
		const query = (e.currentTarget as HTMLInputElement).value;
		modelSearchQuery = query;

		if (modelSearchTimeout) clearTimeout(modelSearchTimeout);

		if (query.length < 2 && !selectedModelTask) {
			modelSearchResults = [];
			modelSearching = false;
			return;
		}

		modelSearching = true;
		modelSearchTimeout = setTimeout(async () => {
			try {
				if (!server?.search_models) { modelSearchResults = []; return; }
				const raw = await server.search_models(["search", query.length >= 2 ? query : "", selectedModelTask, ""]);
				const data = typeof raw === "string" ? JSON.parse(raw) : raw;
				if (!Array.isArray(data)) { modelSearchResults = []; return; }
				modelSearchResults = data
					.filter((m: any) => m.pipeline_tag && TASK_SCHEMAS[m.pipeline_tag])
					.map((m: any) => ({
						id: m.id,
						pipeline_tag: m.pipeline_tag,
						likes: m.likes ?? 0,
						downloads: m.downloads ?? 0,
					}));
			} catch {
				modelSearchResults = [];
			} finally {
				modelSearching = false;
			}
		}, 300);
	}

	function handleTaskFilter(taskKey: string) {
		selectedModelTask = selectedModelTask === taskKey ? "" : taskKey;
		// Re-trigger search with new filter
		handleModelSearch({ currentTarget: { value: modelSearchQuery } } as any);
	}

	function modelToTemplate(model: HFModel): NodeTemplate {
		const schema = TASK_SCHEMAS[model.pipeline_tag];
		return {
			label: model.id.split("/").pop() || model.id,
			kind: "transform",
			source: "model",
			model_id: model.id,
			pipeline_tag: model.pipeline_tag,
			inputs: schema?.inputs ?? [],
			outputs: schema?.outputs ?? [],
			width: 280,
			height: 90,
		};
	}

	function getModelsForTask(task: string): HFModel[] {
		return trendingModels.filter((m) => m.pipeline_tag === task);
	}

	// ── Dataset search ──
	interface HFDataset {
		id: string;
		likes: number;
		downloads: number;
		description: string;
	}

	let datasetSearchQuery = $state("");
	let datasetSearchResults: HFDataset[] = $state([]);
	let datasetSearching = $state(false);
	let datasetSearchTimeout: ReturnType<typeof setTimeout> | null = null;
	let loadingDataset = $state(false);
	let loadingDatasetName = $state("");
	let datasetError = $state("");
	let datasetsAdded = $state(0);

	function handleDatasetSearch(e: Event) {
		const query = (e.currentTarget as HTMLInputElement).value;
		datasetSearchQuery = query;
		datasetError = "";

		if (datasetSearchTimeout) clearTimeout(datasetSearchTimeout);

		if (query.length < 2) {
			datasetSearchResults = [];
			datasetSearching = false;
			return;
		}

		datasetSearching = true;
		datasetSearchTimeout = setTimeout(async () => {
			try {
				if (!server?.search_datasets) { datasetSearchResults = []; return; }
				const raw = await server.search_datasets([query, ""]);
				const data = typeof raw === "string" ? JSON.parse(raw) : raw;
				if (!Array.isArray(data)) { datasetSearchResults = []; return; }
				datasetSearchResults = data.map((d: any) => ({
					id: d.id,
					likes: d.likes ?? 0,
					downloads: d.downloads ?? 0,
					description: d.cardData?.description?.slice(0, 80) || "",
				}));
			} catch {
				datasetSearchResults = [];
			} finally {
				datasetSearching = false;
			}
		}, 300);
	}

	async function addDataset(datasetId: string) {
		loadingDataset = true;
		loadingDatasetName = datasetId;
		datasetError = "";

		try {
			if (!server?.get_dataset_schema) throw new Error("Dataset schema function not available");
			const raw = await server.get_dataset_schema([datasetId, hfToken || ""]);
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			if (data?.error) throw new Error(data.error);

			const features: { name: string; type: any }[] = data.features ?? [];
			const featureToPortType = (f: any): PortType => {
				const dtype = f.type?.dtype || f.type?._type || "";
				if (dtype === "string" || f.type?._type === "Value" && f.type?.dtype === "string") return "text";
				if (dtype === "float32" || dtype === "float64" || dtype === "int32" || dtype === "int64") return "number";
				if (f.type?._type === "Image") return "image";
				if (f.type?._type === "Audio") return "audio";
				return "json";
			};

			const outputs = features.slice(0, 6).map((f, i) => ({
				id: `out_${i}`,
				label: f.name,
				type: featureToPortType(f),
			}));

			const template: NodeTemplate = {
				label: datasetId.split("/").pop() || datasetId,
				kind: "input" as const,
				source: "dataset",
				dataset_id: datasetId,
				dataset_config: data.config,
				dataset_split: data.split,
				inputs: [],
				outputs,
				width: 280,
				height: Math.max(90, 50 + outputs.length * 22),
			};

			onadd?.(template);
			datasetsAdded += 1;
		} catch (err) {
			datasetError = err instanceof Error ? err.message : "Failed to load dataset";
		} finally {
			loadingDataset = false;
		}
	}

	const sections = [
		{ key: "spaces", label: "Spaces", icon: "hub", items: LIBRARY.spaces },
		{ key: "models", label: "Models", icon: "model", items: [] as NodeTemplate[] },
		{ key: "datasets", label: "Datasets", icon: "data", items: [] as NodeTemplate[] },
		{ key: "components", label: "Components", icon: "layers", items: LIBRARY.components }
	];
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<svelte:window onclick={handleWindowClick} />

<aside class="sidebar" class:sidebar-collapsed={collapsed} style="width: {collapsed ? 40 : sidebarWidth}px; min-width: {collapsed ? 40 : sidebarWidth}px;">
	<div class="sidebar-header">
		<button class="sidebar-collapse-btn" class:collapsed onclick={() => collapsed = !collapsed}>
			<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="15 18 9 12 15 6"></polyline>
			</svg>
		</button>
	</div>

	{#if !collapsed}
	{#each sections as section}
		<button
			class="section-toggle"
			class:expanded={expandedSection === section.key}
			onclick={() => toggle(section.key)}
		>
			<span class="section-label">{section.label}</span>
			<span class="section-count">{section.key === "spaces" ? customSpaces.length + trendingSpaces.length : section.key === "models" ? trendingModels.length : section.key === "datasets" ? datasetsAdded : section.items.length}</span>
			<svg class="section-chevron" class:expanded={expandedSection === section.key} viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="6 9 12 15 18 9"></polyline>
			</svg>
		</button>

		{#if expandedSection === section.key}
			<div class="section-items">
				{#if section.key === "spaces"}
					{#if trendingLoading}
						<div class="trending-status">
							<span class="space-loading-spinner"></span>
							<span class="trending-status-text">Loading trending spaces...</span>
						</div>
					{/if}

					{#each SPACE_CATEGORIES as cat}
						{@const trending = getTrendingByCategory(cat.key)}
						{#if trending.length > 0}
							<div class="category-header">
								<span class="category-label">{cat.label}</span>
								<span class="category-count">{trending.length}</span>
							</div>

							{#each trending as space}
								<div
									draggable="true"
									class="space-card"
									onclick={() => onadd?.(trendingToTemplate(space))}
									ondragstart={(e) => {
										const template = trendingToTemplate(space);
										e.dataTransfer!.setData("node-template", JSON.stringify(template));
										const ghost = document.createElement("div");
										ghost.textContent = space.title;
										ghost.style.cssText = "background:#f97316;color:#0c0d10;padding:4px 10px;border-radius:5px;font-family:Manrope,sans-serif;font-size:11px;font-weight:600;position:fixed;top:-100px";
										document.body.appendChild(ghost);
										e.dataTransfer!.setDragImage(ghost, 0, 0);
										setTimeout(() => document.body.removeChild(ghost), 0);
									}}
								>
									<div class="space-card-header">
										<span class="space-card-status" class:space-card-running={space.running} title={space.running ? "Running" : "Sleeping"}></span>
										<span class="space-card-name">{space.title}</span>
										<span class="space-card-likes">&hearts; {space.likes}</span>
										<a
											class="space-card-link"
											href="https://huggingface.co/spaces/{space.id}"
											target="_blank"
											rel="noopener"
											onclick={(e) => e.stopPropagation()}
											title="Open on HuggingFace"
										>&#x2197;</a>
									</div>
									<div class="space-card-id">{space.id}</div>
									{#if space.description}
										<div class="space-card-desc">{space.description}</div>
									{/if}
								</div>
							{/each}
						{/if}
					{/each}
				{:else if section.key === "models"}
					<div class="add-space-wrapper">
						<div class="add-space">
							<input
								class="space-input"
								type="text"
								placeholder="Search models..."
								value={modelSearchQuery}
								oninput={handleModelSearch}
							/>
						</div>
					</div>
					<div class="model-task-filters">
						{#each MODEL_TASKS as task}
							<button
								class="model-task-tag"
								class:model-task-tag-active={selectedModelTask === task.key}
								onclick={() => handleTaskFilter(task.key)}
							>{task.label}</button>
						{/each}
					</div>

					{#if modelSearching}
						<div class="space-loading">
							<span class="space-loading-spinner"></span>
							<span class="space-loading-text">Searching...</span>
						</div>
					{:else if modelSearchQuery.length >= 2 || selectedModelTask}
						{#each modelSearchResults as model}
							{@const template = modelToTemplate(model)}
							{@const pt = template.outputs[0]?.type ?? template.inputs[0]?.type ?? "any"}
							<div
								draggable="true"
								class="space-card"
								onclick={() => onadd?.(template)}
								ondragstart={(e) => {
									e.dataTransfer!.setData("node-template", JSON.stringify(template));
									const ghost = document.createElement("div");
									ghost.textContent = model.id;
									ghost.style.cssText = `background:${PORT_COLOR[pt]};color:#0c0d10;padding:4px 10px;border-radius:5px;font-family:Manrope,sans-serif;font-size:11px;font-weight:600;position:fixed;top:-100px`;
									document.body.appendChild(ghost);
									e.dataTransfer!.setDragImage(ghost, 0, 0);
									setTimeout(() => document.body.removeChild(ghost), 0);
								}}
							>
								<div class="space-card-header">
									<span class="chip-dot" style="background: {PORT_COLOR[pt]}; box-shadow: 0 0 6px {PORT_COLOR[pt]}40"></span>
									<span class="space-card-name">{model.id.split("/").pop()}</span>
									<span class="space-card-likes">&hearts; {model.likes}</span>
								</div>
								<div class="space-card-id">{model.id}</div>
								<div class="space-card-desc">{model.pipeline_tag}</div>
							</div>
						{/each}
						{#if modelSearchResults.length === 0}
							<div class="trending-status">
								<span class="trending-status-text">No models found</span>
							</div>
						{/if}
					{:else}
						{#if trendingModelsLoading}
							<div class="trending-status">
								<span class="space-loading-spinner"></span>
								<span class="trending-status-text">Loading trending models...</span>
							</div>
						{:else}
							{#each MODEL_TASKS.slice(0, 6) as task}
								{@const models = getModelsForTask(task.key)}
								{#if models.length > 0}
									<div class="category-header">
										<span class="category-label">{task.label}</span>
										<span class="category-count">{models.length}</span>
									</div>
									{#each models.slice(0, 3) as model}
										{@const template = modelToTemplate(model)}
										{@const pt = template.outputs[0]?.type ?? template.inputs[0]?.type ?? "any"}
										<div
											draggable="true"
											class="space-card"
											onclick={() => onadd?.(template)}
											ondragstart={(e) => {
												e.dataTransfer!.setData("node-template", JSON.stringify(template));
											}}
										>
											<div class="space-card-header">
												<span class="chip-dot" style="background: {PORT_COLOR[pt]}; box-shadow: 0 0 6px {PORT_COLOR[pt]}40"></span>
												<span class="space-card-name">{model.id.split("/").pop()}</span>
												<span class="space-card-likes">&hearts; {model.likes}</span>
											</div>
											<div class="space-card-id">{model.id}</div>
										</div>
									{/each}
								{/if}
							{/each}
						{/if}
					{/if}
				{:else if section.key === "datasets"}
					<div class="add-space-wrapper">
						<div class="add-space">
							<input
								class="space-input"
								type="text"
								placeholder="Search datasets..."
								value={datasetSearchQuery}
								disabled={loadingDataset}
								oninput={handleDatasetSearch}
								onkeydown={(e) => {
									if (e.key === "Enter" && datasetSearchQuery.includes("/")) {
										datasetSearchResults = [];
										addDataset(datasetSearchQuery.trim());
									}
									if (e.key === "Escape") datasetSearchResults = [];
								}}
							/>
						</div>
						{#if datasetSearchResults.length > 0}
							<div class="search-dropdown">
								{#each datasetSearchResults as result}
									<button
										class="search-result"
										onclick={() => { const id = result.id; datasetSearchResults = []; datasetSearchQuery = ""; addDataset(id); }}
									>
										<div class="search-result-top">
											<span class="search-result-name">{result.id}</span>
											<span class="search-result-likes">&hearts; {result.likes}</span>
										</div>
										{#if result.description}
											<div class="search-result-desc">{result.description}</div>
										{/if}
									</button>
								{/each}
							</div>
						{:else if datasetSearching}
							<div class="search-dropdown">
								<div class="search-searching">Searching...</div>
							</div>
						{/if}
					</div>
					{#if loadingDataset}
						<div class="space-loading">
							<span class="space-loading-spinner"></span>
							<span class="space-loading-text">Loading {loadingDatasetName}...</span>
						</div>
					{/if}
					{#if datasetError}
						<span class="space-error">{datasetError}</span>
					{/if}
					<div class="trending-status">
						<span class="trending-status-text">Search for a dataset by name</span>
					</div>
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
		cursor: pointer;
		flex-shrink: 0;
		padding: 0;
		line-height: 1;
		transition: color 0.15s, background 0.15s, transform 0.2s ease;
	}

	.sidebar-collapse-btn:hover {
		background: #1e1f2a;
		color: #a0a2ae;
	}

	.sidebar-collapse-btn.collapsed {
		transform: rotate(180deg);
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
		color: #5c5e6a;
		flex-shrink: 0;
		transition: transform 0.2s ease;
		transform: rotate(-90deg);
	}

	.section-chevron.expanded {
		transform: rotate(0deg);
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

	.category-count {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #3e3f4d;
	}

	/* Trending space cards */
	.space-card {
		display: flex;
		flex-direction: column;
		padding: 8px 10px;
		margin-bottom: 2px;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.15s, transform 0.1s;
		background: transparent;
	}

	.space-card:hover {
		background: #1a1b25;
	}

	.space-card:active {
		cursor: grabbing;
		transform: scale(0.98);
	}

	.space-card-header {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
	}

	.space-card-status {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #5c5e6a;
		flex-shrink: 0;
	}

	.space-card-running {
		background: #34d399;
		box-shadow: 0 0 4px #34d39960;
	}

	.space-card-name {
		font-size: 12px;
		font-weight: 600;
		color: #c8c9d2;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.space-card-likes {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #5c5e6a;
		flex-shrink: 0;
	}

	.space-card-link {
		visibility: hidden;
		font-size: 11px;
		color: #5c5e6a;
		text-decoration: none;
		flex-shrink: 0;
		padding: 2px;
		border-radius: 3px;
		transition: color 0.15s;
	}

	.space-card:hover .space-card-link {
		visibility: visible;
	}

	.space-card-link:hover {
		color: #c8c9d2;
	}

	.space-card-id {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #3e3f4d;
		padding-left: 12px;
		margin-top: 1px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.space-card-desc {
		font-size: 10px;
		color: #5c5e6a;
		padding-left: 12px;
		margin-top: 2px;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.3;
	}

	.trending-status {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 12px;
	}

	.trending-status-text {
		font-family: "JetBrains Mono", monospace;
		font-size: 9.5px;
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
		visibility: hidden;
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
		visibility: visible;
	}

	.chip-link:hover {
		color: #c8c9d2;
	}

	.chip-remove {
		visibility: hidden;
		display: flex;
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
		visibility: visible;
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

	.model-task-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 4px;
		padding: 4px 4px 8px;
	}

	.model-task-tag {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		padding: 3px 7px;
		border: 1px solid #1e1f2a;
		border-radius: 4px;
		background: transparent;
		color: #5c5e6a;
		cursor: pointer;
		transition: all 0.15s;
	}

	.model-task-tag:hover {
		border-color: #3e3f4d;
		color: #a0a2ae;
	}

	.model-task-tag-active {
		border-color: #f97316;
		color: #f97316;
		background: rgba(249, 115, 22, 0.1);
	}

	.hint {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #2e2f3d;
		letter-spacing: 0.02em;
	}
</style>
