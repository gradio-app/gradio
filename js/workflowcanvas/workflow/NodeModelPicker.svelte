<script lang="ts">
	import { categorizeSpace, TASK_SCHEMAS } from "./node-library";
	import { fetchSpaceApi, normalizeOperatorPorts } from "./space-api";
	import { FEATURED_SPACES, FEATURED_MODELS } from "./featured";
	import type { ModalityConfig, SubTab } from "./workflow-modalities";
	import SearchIcon from "./icons/SearchIcon.svelte";
	import CloseIcon from "./icons/CloseIcon.svelte";
	import OpenLinkIcon from "./icons/OpenLinkIcon.svelte";

	interface SpaceResult {
		id: string;
		title: string;
		description: string;
		likes: number;
		running: boolean;
		category: string | null;
		pipeline_tag?: string;
	}

	type Source = "spaces" | "models" | "datasets";

	interface Props {
		mode: "create" | "update";
		modality: ModalityConfig;
		nodeId?: string;
		server?: Record<string, any>;
		hfToken?: string;
		anchorX?: number;
		anchorY?: number;
		initialSource?: Source;
		initialSubtab?: string;
		oncreate: (template: any) => void;
		onupdate: (nodeId: string, template: any) => void;
		onclose: () => void;
		onerror?: (message: string) => void;
	}

	let {
		mode,
		modality,
		nodeId,
		server = {},
		hfToken = "",
		anchorX = undefined,
		anchorY = undefined,
		initialSource = undefined,
		initialSubtab = undefined,
		oncreate,
		onupdate,
		onclose,
		onerror
	}: Props = $props();

	let source = $state<Source>(
		initialSource ?? (modality.key === "data" ? "datasets" : "spaces")
	);
	const isDataset = $derived(source === "datasets");
	const isModel = $derived(source === "models");
	const showSourceToggle = $derived(modality.key !== "data");

	const searchPlaceholder = $derived.by(() => {
		const kind = isDataset ? "datasets" : isModel ? "models" : "spaces";
		// Data modality is its own thing — no per-modality qualifier needed.
		if (modality.key === "data") return `Search ${kind}...`;
		return `Search ${modality.label.toLowerCase()} ${kind}...`;
	});

	// In "models" mode the HF API can only filter by pipeline_tag, so subtabs
	// whose only constraint is a free-text query (e.g. Enhance, Remove BG) are
	// hidden — they wouldn't return anything meaningful from the models API.
	const visibleSubtabs = $derived(
		isModel
			? modality.subtabs.filter((st) => {
					if (st.key === "all") return true;
					const modelTagList = st.modelTags ?? st.pipelineTags;
					return modelTagList.length > 0;
				})
			: modality.subtabs
	);

	function setSource(next: Source): void {
		if (next === source) return;
		// Reset emptiness flags up front so the auto-switch effect can't
		// fire on a stale value mid-source-change (same race as the
		// subtab onclick).
		trendingEmpty = null;
		newEmpty = null;
		source = next;
		// If the active subtab disappears in the new source, fall back to "all"
		if (!visibleSubtabs.some((st) => st.key === activeSubtab.key)) {
			activeSubtab = visibleSubtabs[0] ?? modality.subtabs[0];
		}
		if (activeContentTab === "search") {
			searchQuery = "";
			activeContentTab = "trending";
		}
	}

	const AVATAR_COLORS = [
		"#f97316",
		"#8b5cf6",
		"#3b82f6",
		"#10b981",
		"#ec4899",
		"#f59e0b",
		"#06b6d4",
		"#84cc16"
	];
	function avatarColor(id: string): string {
		let h = 5381;
		for (let i = 0; i < id.length; i++) h = ((h << 5) + h) ^ id.charCodeAt(i);
		return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
	}
	function avatarInitial(id: string): string {
		return (id.split("/").pop() || id)[0].toUpperCase();
	}

	type ContentTab = "featured" | "trending" | "new" | "search";

	let activeSubtab = $state<SubTab>(
		(initialSubtab && modality.subtabs.find((s) => s.key === initialSubtab)) ||
			modality.subtabs[0]
	);
	let activeContentTab = $state<ContentTab>(
		// Datasets API doesn't have a featured list, jump straight to search/trending.
		// When entering with a specific subtab, Featured ignores subtab filters, so
		// go to trending so the subtab actually narrows results.
		modality.key === "data" || initialSubtab ? "trending" : "featured"
	);

	const featuredResults = $derived.by(() => {
		if (source === "datasets") return [];
		const list = source === "models" ? FEATURED_MODELS : FEATURED_SPACES;
		const cats = modality.acceptedCategories ?? [modality.category];
		return list
			.filter((item) => cats.includes(item.modality))
			.map((item) => ({
				id: item.id,
				title: item.title,
				description: item.description,
				likes: item.likes ?? 0,
				running: true,
				category: item.modality,
				pipeline_tag: item.pipeline_tag
			}));
	});

	// If the active tab is known-empty, fall through to the next available
	// one so the panel never sits on a blank tab. Cascade: featured →
	// trending → new → search.
	$effect(() => {
		if (activeContentTab === "featured" && featuredResults.length === 0) {
			activeContentTab = "trending";
		} else if (activeContentTab === "trending" && trendingEmpty === true) {
			activeContentTab = newEmpty === true ? "search" : "new";
		} else if (activeContentTab === "new" && newEmpty === true) {
			activeContentTab = trendingEmpty === true ? "search" : "trending";
		}
	});
	let searchQuery = $state("");
	let results = $state<SpaceResult[]>([]);
	let loading = $state(false);
	let loadingSpaceId = $state<string | null>(null);

	// Track per-tab emptiness so we can hide Trending / New when a fetch
	// confirms there are no matching results. Reset to null (unknown) when
	// any filter changes that affects the fetch, so the next fetch can
	// re-evaluate. Featured tabs are handled separately via featuredResults.
	let trendingEmpty = $state<boolean | null>(null);
	let newEmpty = $state<boolean | null>(null);

	const displayResults = $derived(
		activeContentTab === "featured" ? featuredResults : results
	);
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;

	function parseResults(raw: any): SpaceResult[] {
		if (!Array.isArray(raw)) return [];
		return raw.map((s: any) => {
			const desc =
				s.cardData?.short_description || s.ai_short_description || "";
			return {
				id: s.id,
				title: s.cardData?.title || s.title || s.id.split("/").pop() || s.id,
				description: desc,
				likes: s.likes ?? 0,
				running: s.runtime?.stage === "RUNNING",
				category: categorizeSpace(
					s.cardData?.pipeline_tag || s.pipeline_tag,
					s.cardData?.tags,
					desc,
					s.id
				),
				pipeline_tag: s.cardData?.pipeline_tag || s.pipeline_tag || undefined
			};
		});
	}

	async function fetchResults() {
		if (isDataset) {
			await fetchDatasets(searchQuery);
			return;
		}
		if (isModel) {
			await fetchModels(searchQuery);
			return;
		}
		if (!server?.search_spaces) {
			results = [];
			return;
		}
		loading = true;
		results = [];
		try {
			// Spaces use the per-subtab `spaceTags` override when present
			// (category names like "image-editing") and fall back to
			// `pipelineTags` for subtabs where the model pipeline tag
			// works as a Space category too (e.g. text-to-image).
			const spaceTagList = activeSubtab.spaceTags ?? activeSubtab.pipelineTags;
			const spaceTag = spaceTagList.length > 0 ? spaceTagList[0] : "";

			let kind: string;
			let query: string;

			if (activeContentTab === "search") {
				kind = "search";
				query = searchQuery;
			} else if (activeSubtab.query) {
				// Always forward the subtab's freeform query alongside the
				// category. The server prefers `category=` when valid and
				// falls back to `q=` when the category isn't a real HF
				// Space category (e.g. `automatic-speech-recognition`).
				kind = activeContentTab === "new" ? "new" : "trending";
				query = activeSubtab.query;
			} else {
				kind = activeContentTab === "new" ? "new" : "trending";
				query = "";
			}

			const raw = await server.search_spaces([kind, query, spaceTag]);
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			let parsed = parseResults(data);

			// Filter by modality category only when the server didn't already
			// narrow by tag. Keep results that EITHER match the modality
			// OR couldn't be categorised — most Gradio Spaces lack a
			// pipeline_tag on their card, so dropping uncategorised ones
			// hides the bulk of legitimate results. We only exclude things
			// confidently categorised to a different modality.
			if (activeContentTab !== "search" && !spaceTag) {
				const cats = modality.acceptedCategories ?? [modality.category];
				parsed = parsed.filter((s) => !s.category || cats.includes(s.category));
			}

			results = parsed.slice(0, 20);
		} catch {
			results = [];
		} finally {
			loading = false;
		}
	}

	async function fetchDatasets(query: string) {
		if (!server?.search_datasets) {
			results = [];
			loading = false;
			return;
		}
		loading = true;
		results = [];
		try {
			const raw = await server.search_datasets([query]);
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			if (!Array.isArray(data)) {
				results = [];
				return;
			}
			results = data.slice(0, 20).map((d: any) => ({
				id: d.id,
				title: d.id.split("/").pop() || d.id,
				description: d.description || d.cardData?.summary || "",
				likes: d.likes ?? 0,
				running: true,
				category: "data",
				pipeline_tag: undefined
			}));
		} catch {
			results = [];
		} finally {
			loading = false;
		}
	}

	async function fetchModels(q: string) {
		if (!server?.search_models) {
			results = [];
			loading = false;
			return;
		}
		loading = true;
		results = [];
		try {
			// Models use the per-subtab `modelTags` override when present
			// and fall back to `pipelineTags`. `spaceTags` is ignored here
			// because Space category names (e.g. "image-editing") aren't
			// valid model pipeline tags.
			const modelTagList = activeSubtab.modelTags ?? activeSubtab.pipelineTags;
			const pipelineTag = modelTagList[0] ?? "";
			let kind: string;
			if (activeContentTab === "search") {
				kind = "search";
			} else {
				kind = activeContentTab === "new" ? "new" : "trending";
				q = "";
			}
			const raw = await server.search_models([kind, q, pipelineTag, ""]);
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			if (!Array.isArray(data)) {
				results = [];
				return;
			}
			results = data
				.filter((m: any) => m.pipeline_tag && TASK_SCHEMAS[m.pipeline_tag])
				.slice(0, 24)
				.map((m: any) => ({
					id: m.id,
					title: m.id.split("/").pop() || m.id,
					description: m.pipeline_tag || "",
					likes: m.likes ?? 0,
					running: true,
					category: "model",
					pipeline_tag: m.pipeline_tag
				}));
		} catch {
			results = [];
		} finally {
			loading = false;
		}
	}

	// Fetch when tab/subtab/mode changes (Featured is static, no API call).
	// After each fetch, record whether the active tab came back empty so we
	// can hide it from the tab strip.
	$effect(() => {
		activeSubtab;
		activeContentTab;
		isDataset;
		isModel;
		if (activeContentTab !== "search" && activeContentTab !== "featured") {
			const captured = activeContentTab;
			void fetchResults().then(() => {
				if (captured === "trending") trendingEmpty = results.length === 0;
				else if (captured === "new") newEmpty = results.length === 0;
			});
		}
	});

	function handleSearchInput(e: Event) {
		searchQuery = (e.currentTarget as HTMLInputElement).value;
		if (searchTimeout) clearTimeout(searchTimeout);
		if (isDataset) {
			loading = true;
			searchTimeout = setTimeout(() => void fetchDatasets(searchQuery), 300);
			return;
		}
		if (isModel) {
			if (searchQuery.length < 2) {
				if (activeContentTab === "search") results = [];
				return;
			}
			activeContentTab = "search";
			loading = true;
			searchTimeout = setTimeout(() => void fetchModels(searchQuery), 300);
			return;
		}
		if (searchQuery.length < 2) {
			if (activeContentTab === "search") results = [];
			return;
		}
		activeContentTab = "search";
		loading = true;
		searchTimeout = setTimeout(() => void fetchResults(), 300);
	}

	function selectModel(item: SpaceResult) {
		if (!item.pipeline_tag) return;
		const schema = TASK_SCHEMAS[item.pipeline_tag];
		const template = {
			label: item.id.split("/").pop() || item.id,
			kind: "transform" as const,
			source: "model" as const,
			model_id: item.id,
			pipeline_tag: item.pipeline_tag,
			inputs: normalizeOperatorPorts(modality, schema?.inputs ?? []),
			outputs: normalizeOperatorPorts(modality, schema?.outputs ?? []),
			width: 280,
			height: 90
		};
		if (mode === "update" && nodeId) {
			onupdate(nodeId, template);
		} else {
			oncreate(template);
		}
		onclose();
	}

	async function selectSpace(space: SpaceResult) {
		if (loadingSpaceId) return;
		loadingSpaceId = space.id;
		try {
			const apiInfo = await fetchSpaceApi(space.id);
			const template = {
				label: space.title || space.id.split("/").pop() || space.id,
				kind: "transform" as const,
				source: "space" as const,
				space_id: space.id,
				pipeline_tag: space.pipeline_tag,
				endpoint: apiInfo.endpoint,
				inputs: normalizeOperatorPorts(modality, apiInfo.inputs),
				outputs: normalizeOperatorPorts(modality, apiInfo.outputs),
				width: apiInfo.width,
				height: 90
			};
			if (mode === "update" && nodeId) {
				onupdate(nodeId, template);
			} else {
				oncreate(template);
			}
			onclose();
		} catch (err) {
			loadingSpaceId = null;
			const msg = err instanceof Error ? err.message : "Couldn't load space";
			const label = space.title || space.id;
			onerror?.(`${label}: ${msg}`);
		}
	}

	function featureToPortType(feature: any): string {
		const t = feature?.type;
		if (!t) return "json";
		if (t._type === "Image" || t.dtype === "image") return "image";
		if (t._type === "Audio" || t.dtype === "audio") return "audio";
		if (t._type === "Video" || t.dtype === "video") return "video";
		if (t._type === "ClassLabel") return "text";
		if (t._type === "Translation" || t._type === "TranslationVariableLanguages")
			return "text";
		if (t._type === "Value") {
			if (t.dtype === "string") return "text";
			if (t.dtype?.includes("int") || t.dtype?.includes("float"))
				return "number";
			if (t.dtype === "bool") return "boolean";
		}
		return "json";
	}

	async function selectDataset(dataset: SpaceResult) {
		loadingSpaceId = dataset.id;
		let outputs: Array<{ id: string; label: string; type: string }> = [
			{ id: "out_0", label: "Data", type: "json" }
		];
		let config = "default";
		let split = "train";
		try {
			if (server?.get_dataset_schema) {
				const raw = await server.get_dataset_schema([dataset.id]);
				const schema = typeof raw === "string" ? JSON.parse(raw) : raw;
				if (
					!schema.error &&
					Array.isArray(schema.features) &&
					schema.features.length > 0
				) {
					config = schema.config ?? "default";
					split = schema.split ?? "train";
					const ports = schema.features.map((f: any, i: number) => ({
						id: `out_${i}`,
						label: f.name,
						type: featureToPortType(f)
					}));
					if (ports.length > 0) outputs = ports;
				}
			}
		} catch {
			// fall through to defaults
		} finally {
			loadingSpaceId = null;
		}
		oncreate({
			label: dataset.title || dataset.id.split("/").pop() || dataset.id,
			kind: "transform" as const,
			source: "dataset" as const,
			dataset_id: dataset.id,
			dataset_config: config,
			dataset_split: split,
			// Single scalar input: row index. Inline-editable when not wired
			// (the standard `.port-inline-config` block handles the widget);
			// accepts upstream numbers/fns when wired.
			inputs: [
				{
					id: "row_index",
					label: "Row",
					type: "number" as const,
					default_value: 0
				}
			],
			outputs,
			width: 240,
			height: 90
		});
		onclose();
	}

	function hubUrl(id: string): string {
		if (isDataset) return `https://huggingface.co/datasets/${id}`;
		if (isModel) return `https://huggingface.co/${id}`;
		return `https://huggingface.co/spaces/${id}`;
	}

	function handleRowClick(item: SpaceResult) {
		if (isDataset) {
			void selectDataset(item);
		} else if (isModel) {
			selectModel(item);
		} else {
			selectSpace(item);
		}
	}

	function formatLikes(n: number): string {
		if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
		return String(n);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="picker-overlay" onclick={onclose}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="picker-panel"
		class:picker-panel-anchored={anchorX !== undefined}
		style={anchorX !== undefined
			? `left:${anchorX}px; top:${anchorY ?? 0}px;`
			: ""}
		onclick={(e) => e.stopPropagation()}
		onwheel={(e) => e.stopPropagation()}
	>
		<!-- Search row — input only. Mode tabs (Featured / Trending / New)
		     live in the subtab strip below so they share visual weight
		     with the modality categories (Generate / Edit / …). -->
		<div class="picker-search-row">
			<div class="picker-search-wrap">
				<span class="search-icon">
					<SearchIcon />
				</span>
				<input
					class="picker-search"
					type="text"
					placeholder={searchPlaceholder}
					value={searchQuery}
					oninput={handleSearchInput}
					autofocus
				/>
				<button
					class="picker-close-inline"
					onclick={onclose}
					aria-label="Close"
				>
					<CloseIcon />
				</button>
			</div>
		</div>

		<!-- Source toggle (Spaces / Models) — hidden for datasets -->
		{#if showSourceToggle}
			<div class="picker-source-row">
				<button
					class="picker-source-btn"
					class:active={source === "spaces"}
					onclick={() => setSource("spaces")}>Spaces</button
				>
				<button
					class="picker-source-btn"
					class:active={source === "models"}
					onclick={() => setSource("models")}>Models</button
				>
			</div>
		{/if}

		<!-- Modality subtabs: which kind of Space (Generate / Edit / …). -->
		{#if !isDataset && visibleSubtabs.length > 1}
			<div class="picker-subtabs">
				{#each visibleSubtabs as st}
					<button
						class="picker-subtab"
						class:active={activeSubtab.key === st.key}
						onclick={() => {
							// Reset emptiness flags BEFORE writing activeSubtab /
							// activeContentTab. Otherwise the auto-switch effect
							// can fire first and read a stale `trendingEmpty=true`
							// from the previous subtab, bumping activeContentTab
							// to "search" — which then fetches the wrong list.
							trendingEmpty = null;
							newEmpty = null;
							activeSubtab = st;
							if (activeContentTab !== "search") activeContentTab = "trending";
						}}
					>
						{st.label}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Content modes: how the list is sorted (Featured / Trending / New).
		     Smaller and lighter than the category subtabs so they read as
		     a secondary sort control, not a competing category. -->
		{#if !isDataset}
			<div class="picker-mode-row">
				<span class="picker-mode-label">Sort:</span>
				{#if featuredResults.length > 0}
					<button
						class="picker-mode-btn"
						class:active={activeContentTab === "featured"}
						onclick={() => {
							activeContentTab = "featured";
							searchQuery = "";
						}}>Featured</button
					>
				{/if}
				{#if trendingEmpty !== true}
					<button
						class="picker-mode-btn"
						class:active={activeContentTab === "trending"}
						onclick={() => {
							activeContentTab = "trending";
							searchQuery = "";
						}}>Trending</button
					>
				{/if}
				{#if newEmpty !== true}
					<button
						class="picker-mode-btn"
						class:active={activeContentTab === "new"}
						onclick={() => {
							activeContentTab = "new";
							searchQuery = "";
						}}>New ✦</button
					>
				{/if}
			</div>
		{/if}

		<!-- Results -->
		<div class="picker-results">
			{#if loading && activeContentTab !== "featured"}
				<div class="picker-loading">
					<span class="spinner"></span>
				</div>
			{:else if displayResults.length === 0}
				<div class="picker-empty">
					{activeContentTab === "search"
						? "Nothing found"
						: activeContentTab === "featured"
							? `No featured ${source} for ${modality.label.toLowerCase()} yet`
							: `No ${modality.label.toLowerCase()} ${source} found`}
				</div>
			{:else}
				{#each displayResults as space (space.id)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="space-row"
						class:loading={loadingSpaceId === space.id}
						onclick={() => handleRowClick(space)}
						role="button"
						tabindex="0"
					>
						<div
							class="space-avatar"
							style="background:linear-gradient(135deg, {avatarColor(
								space.id
							)}, {avatarColor(space.id + '_2')})"
						>
							{avatarInitial(space.id)}
						</div>
						<div class="space-row-left">
							<div class="space-name-row">
								<span class="space-name"
									>{space.title ||
										(space.id.split("/").pop() ?? space.id)}</span
								>
								{#if activeContentTab === "featured"}
									<span class="space-badge space-badge-featured">Featured</span>
								{/if}
								{#if space.pipeline_tag}
									<span class="space-badge">{space.pipeline_tag}</span>
								{/if}
							</div>
							{#if space.description}
								<div class="space-desc">{space.description}</div>
							{/if}
						</div>
						<div class="space-row-right">
							{#if loadingSpaceId === space.id}
								<span class="spinner small"></span>
							{:else if space.likes > 0}
								<span class="space-likes">♥ {formatLikes(space.likes)}</span>
							{/if}
							<a
								class="space-row-link"
								href={hubUrl(space.id)}
								target="_blank"
								rel="noopener noreferrer"
								title="Open on HuggingFace"
								aria-label="Open on HuggingFace"
								onclick={(e) => e.stopPropagation()}
								onmousedown={(e) => e.stopPropagation()}
							>
								<OpenLinkIcon />
							</a>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>

<style>
	/* Reuse toast-in animation from WorkflowCanvas.css */
	@keyframes wf-toast-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.picker-overlay {
		position: absolute;
		inset: 0;
		z-index: 50;
		pointer-events: none;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Compensate for the bottom bar (~60px) so the panel is centered in
		 * the visible canvas area, not the raw viewport. Extra few px of
		 * bottom padding keeps the optical center balanced against the top
		 * toolbar. */
		padding-bottom: 72px;
		padding-top: 8px;
		box-sizing: border-box;
	}

	.picker-panel {
		pointer-events: auto;
		width: 520px;
		/* Lock the panel to a fixed height so switching tabs (Featured /
		 * Trending / New) doesn't make the modal jump up and down. The
		 * results list scrolls inside; on short viewports we cap to leave
		 * room for the toolbar and bottom bar. */
		height: min(620px, calc(100vh - 160px));
		background: #13141c;
		border: 1px solid #2a2b36;
		border-radius: 16px;
		box-shadow:
			0 20px 60px rgba(0, 0, 0, 0.6),
			0 0 0 1px rgba(255, 255, 255, 0.04);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: wf-toast-in 0.12s ease-out;
	}

	.picker-panel-anchored {
		position: absolute;
	}

	.picker-close-inline {
		position: absolute;
		right: 8px;
		top: 50%;
		transform: translateY(-50%);
		width: 22px;
		height: 22px;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: #5c5e6a;
		font-size: 16px;
		line-height: 1;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: 0;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.picker-close-inline:hover {
		background: #1e1f2a;
		color: #a0a2ae;
	}

	:global(body:not(.dark)) .picker-close-inline {
		color: #8b8d98;
	}

	:global(body:not(.dark)) .picker-close-inline:hover {
		background: rgba(0, 0, 0, 0.06);
		color: #3e4050;
	}

	.picker-search-row {
		padding: 14px 16px 0;
		flex-shrink: 0;
	}

	.picker-search-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}

	.picker-mode-row {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 6px 16px 0;
		flex-shrink: 0;
	}

	.picker-mode-label {
		font-family: "Manrope", sans-serif;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #4a4d57;
		margin-right: 4px;
	}

	.picker-mode-btn {
		padding: 3px 8px;
		border: none;
		border-radius: 14px;
		background: transparent;
		color: #6b6e78;
		font-family: "Manrope", sans-serif;
		font-size: 11px;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 0.1s,
			color 0.1s;
	}

	.picker-mode-btn:hover {
		color: #c8c9d2;
		background: rgba(255, 255, 255, 0.04);
	}

	.picker-mode-btn.active {
		color: #f97316;
		background: rgba(249, 115, 22, 0.08);
	}

	:global(body:not(.dark)) .picker-mode-label {
		color: #8b8d98;
	}

	:global(body:not(.dark)) .picker-mode-btn {
		color: #8b8d98;
	}

	:global(body:not(.dark)) .picker-mode-btn:hover {
		color: #3e4050;
		background: rgba(0, 0, 0, 0.04);
	}

	:global(body:not(.dark)) .picker-mode-btn.active {
		color: #ea580c;
		background: rgba(249, 115, 22, 0.1);
	}

	.search-icon {
		position: absolute;
		left: 13px;
		display: inline-flex;
		color: #4a4d57;
		pointer-events: none;
		flex-shrink: 0;
	}

	.picker-search {
		flex: 1;
		min-width: 0;
		padding: 11px 40px 11px 36px;
		background: #0c0d10;
		border: 1px solid #2a2b36;
		border-radius: 10px;
		font-family: "Manrope", sans-serif;
		font-size: 14px;
		color: #d5d6de;
		outline: none;
		transition:
			border-color 0.15s,
			box-shadow 0.15s;
	}

	.picker-search::placeholder {
		color: #3e4050;
	}

	.picker-search:focus {
		border-color: #f97316;
		box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
	}

	.picker-source-row {
		display: flex;
		gap: 4px;
		padding: 8px 10px 0;
		flex-shrink: 0;
	}

	.picker-source-btn {
		flex: 1;
		padding: 6px 10px;
		border: 1px solid #1e1f2a;
		border-radius: 6px;
		background: transparent;
		color: #6b6e78;
		font-family: "Manrope", sans-serif;
		font-size: 11.5px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.picker-source-btn:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #c8c9d2;
	}

	.picker-source-btn.active {
		background: rgba(249, 115, 22, 0.12);
		border-color: rgba(249, 115, 22, 0.35);
		color: #f97316;
	}

	:global(body:not(.dark)) .picker-source-btn {
		border-color: #e2e4ea;
		color: #6b6e78;
	}

	:global(body:not(.dark)) .picker-source-btn:hover {
		background: #f0f1f5;
		color: #1a1b25;
	}

	:global(body:not(.dark)) .picker-source-btn.active {
		background: rgba(249, 115, 22, 0.1);
		border-color: rgba(249, 115, 22, 0.35);
		color: #d65500;
	}

	.picker-subtabs {
		display: flex;
		gap: 2px;
		padding: 8px 10px 0;
		flex-shrink: 0;
		flex-wrap: wrap;
	}

	.picker-subtab {
		padding: 4px 10px;
		border: 1px solid transparent;
		border-radius: 20px;
		background: transparent;
		color: #5c5e6a;
		font-family: "Manrope", sans-serif;
		font-size: 11px;
		font-weight: 600;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.picker-subtab:hover {
		background: rgba(255, 255, 255, 0.05);
		color: #a0a2ae;
	}

	.picker-subtab.active {
		background: rgba(249, 115, 22, 0.12);
		border-color: rgba(249, 115, 22, 0.3);
		color: #f97316;
	}

	.picker-tabs {
		display: flex;
		gap: 0;
		padding: 8px 10px 0;
		border-bottom: 1px solid #1e1f2a;
		flex-shrink: 0;
	}

	.picker-tab {
		padding: 6px 14px;
		border: none;
		border-bottom: 2px solid transparent;
		background: transparent;
		color: #5c5e6a;
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		margin-bottom: -1px;
		transition:
			color 0.15s,
			border-color 0.15s;
	}

	.picker-tab:hover {
		color: #a0a2ae;
	}

	.picker-tab.active {
		color: #d5d6de;
		border-bottom-color: #f97316;
	}

	.picker-results {
		flex: 1;
		overflow-y: auto;
		padding: 6px 8px 10px;
		scrollbar-width: thin;
		scrollbar-color: #2a2b36 transparent;
	}

	.picker-loading {
		display: flex;
		justify-content: center;
		padding: 60px;
	}

	.picker-empty {
		text-align: center;
		padding: 60px 24px;
		font-family: "Manrope", sans-serif;
		font-size: 13px;
		color: #4a4d57;
	}

	.space-avatar {
		width: 52px;
		height: 52px;
		border-radius: 12px;
		font-size: 22px;
		font-weight: 700;
		color: rgba(0, 0, 0, 0.55);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		text-shadow: 0 1px 2px rgba(255, 255, 255, 0.15);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
	}

	.space-row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 10px 12px;
		border-radius: 10px;
		cursor: pointer;
		transition: background 0.12s;
	}

	.space-row:hover {
		background: rgba(255, 255, 255, 0.04);
	}

	.space-row.loading {
		opacity: 0.6;
		pointer-events: none;
	}

	.space-row-left {
		flex: 1;
		min-width: 0;
	}

	.space-name-row {
		display: flex;
		align-items: center;
		gap: 8px;
		min-width: 0;
	}

	.space-name {
		font-family: "Manrope", sans-serif;
		font-size: 14px;
		font-weight: 700;
		color: #e8e9f0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.space-badge {
		display: inline-flex;
		align-items: center;
		padding: 2px 7px;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.06);
		color: #8b8d98;
		font-family: "Manrope", sans-serif;
		font-size: 10px;
		font-weight: 600;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.space-badge-featured {
		background: rgba(249, 115, 22, 0.14);
		color: #f97316;
	}

	.space-desc {
		font-family: "Manrope", sans-serif;
		font-size: 12.5px;
		color: #7a7d88;
		margin-top: 3px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.35;
	}

	.space-row-right {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-shrink: 0;
	}

	.space-likes {
		font-family: "Manrope", sans-serif;
		font-size: 11px;
		font-weight: 600;
		color: #4a4d57;
	}

	.space-row-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border-radius: 6px;
		color: #4a4d57;
		text-decoration: none;
		opacity: 0;
		transition:
			opacity 0.15s,
			color 0.15s,
			background 0.15s;
	}

	.space-row:hover .space-row-link,
	.space-row:focus-within .space-row-link {
		opacity: 1;
	}

	.space-row-link:hover {
		color: #f97316;
		background: rgba(249, 115, 22, 0.08);
	}

	.spinner {
		display: inline-block;
		width: 18px;
		height: 18px;
		border: 2px solid #2a2b36;
		border-top-color: #f97316;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
	}

	.spinner.small {
		width: 14px;
		height: 14px;
		border-width: 1.5px;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	/* Light mode */
	:global(body:not(.dark)) .picker-panel {
		background: #ffffff;
		border-color: #e2e4ea;
		box-shadow:
			0 12px 40px rgba(0, 0, 0, 0.12),
			0 0 0 1px rgba(0, 0, 0, 0.04);
	}

	:global(body:not(.dark)) .picker-search {
		background: #f8f9fb;
		border-color: #e2e4ea;
		color: #1a1b25;
	}

	:global(body:not(.dark)) .picker-search::placeholder {
		color: #b0b2bc;
	}

	:global(body:not(.dark)) .picker-search:focus {
		background: #ffffff;
	}

	:global(body:not(.dark)) .picker-tabs {
		border-bottom-color: #e2e4ea;
	}

	:global(body:not(.dark)) .picker-tab {
		color: #8b8d98;
	}

	:global(body:not(.dark)) .picker-tab.active {
		color: #1a1b25;
	}

	:global(body:not(.dark)) .space-row:hover {
		background: #f4f5f8;
	}

	:global(body:not(.dark)) .space-name {
		color: #1a1b25;
	}

	:global(body:not(.dark)) .space-desc {
		color: #6b6e78;
	}

	:global(body:not(.dark)) .space-badge {
		background: #eef0f4;
		color: #6b6e78;
	}

	:global(body:not(.dark)) .space-badge-featured {
		background: rgba(249, 115, 22, 0.12);
		color: #c84a00;
	}

	:global(body:not(.dark)) .space-likes {
		color: #b0b2bc;
	}

	:global(body:not(.dark)) .picker-empty {
		color: #b0b2bc;
	}

	:global(body:not(.dark)) .space-avatar {
		color: rgba(0, 0, 0, 0.55);
	}
</style>
