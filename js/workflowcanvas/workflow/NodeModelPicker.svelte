<script lang="ts">
	import { TASK_SCHEMAS } from "./node-library";
	import {
		fetchSpaceApi,
		is_zero_gpu_space,
		normalizeOperatorPorts
	} from "./space-api";
	import type { ModalityConfig, SubTab } from "./workflow-modalities";
	import SearchIcon from "./icons/SearchIcon.svelte";
	import CloseIcon from "./icons/CloseIcon.svelte";
	import OpenLinkIcon from "./icons/OpenLinkIcon.svelte";

	type ResultType = "space" | "model" | "dataset";

	interface SpaceResult {
		id: string;
		title: string;
		description: string;
		likes: number;
		trendingScore?: number;
		running: boolean;
		type: ResultType;
		pipeline_tag?: string;
		zero_gpu?: boolean;
		fallback?: boolean;
		curated?: boolean;
		featured?: boolean;
	}

	interface Props {
		mode: "create" | "update";
		modality: ModalityConfig;
		nodeId?: string;
		server?: Record<string, any>;
		anchorX?: number;
		anchorY?: number;
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
		anchorX = undefined,
		anchorY = undefined,
		initialSubtab = undefined,
		oncreate,
		onupdate,
		onclose,
		onerror
	}: Props = $props();

	const is_dataset = $derived(modality.key === "data");

	const search_placeholder = $derived.by(() => {
		if (is_dataset) return "Search datasets, paste a Hub URL...";
		return `Search ${modality.label.toLowerCase()} spaces & models, paste a Hub URL...`;
	});

	const visible_subtabs = $derived(modality.subtabs);

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
	function avatar_color(id: string): string {
		let h = 5381;
		for (let i = 0; i < id.length; i++) h = ((h << 5) + h) ^ id.charCodeAt(i);
		return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
	}
	function avatar_initial(id: string): string {
		return (id.split("/").pop() || id)[0].toUpperCase();
	}

	type ContentTab = "featured" | "trending" | "new" | "search";

	let active_subtab = $state<SubTab>(
		(initialSubtab && modality.subtabs.find((s) => s.key === initialSubtab)) ||
			modality.subtabs[0]
	);
	let active_content_tab = $state<ContentTab>(
		modality.key === "data" || initialSubtab ? "trending" : "featured"
	);
	let zero_gpu_only = $state(true);
	let search_query = $state("");
	let results = $state<SpaceResult[]>([]);
	let loading = $state(false);
	let loading_space_id = $state<string | null>(null);

	let trending_empty = $state<boolean | null>(null);
	let new_empty = $state<boolean | null>(null);

	const featured_results = $derived<SpaceResult[]>(
		results.filter((r) => r.featured)
	);

	$effect(() => {
		if (active_content_tab === "featured" && featured_results.length === 0) {
			active_content_tab = "trending";
		}
	});

	const display_results = $derived(
		active_content_tab === "featured" ? featured_results : results
	);
	let search_timeout: ReturnType<typeof setTimeout> | null = null;
	let fetch_token = 0;

	function parse_space(s: any): SpaceResult {
		const desc = s.cardData?.short_description || s.ai_short_description || "";
		return {
			id: s.id,
			title: s.cardData?.title || s.title || s.id.split("/").pop() || s.id,
			description: desc,
			likes: s.likes ?? 0,
			trendingScore: s.trendingScore ?? undefined,
			running: s.runtime?.stage === "RUNNING",
			type: "space",
			pipeline_tag: s.cardData?.pipeline_tag || s.pipeline_tag || undefined,
			zero_gpu: is_zero_gpu_space(s),
			fallback: s._fallback === true,
			curated: s._curated === true,
			featured: s._featured === true
		};
	}

	function parse_model(m: any): SpaceResult {
		return {
			id: m.id,
			title: m.id.split("/").pop() || m.id,
			description: m.pipeline_tag || "",
			likes: m.likes ?? 0,
			trendingScore: m.trendingScore ?? undefined,
			running: true,
			type: "model",
			pipeline_tag: m.pipeline_tag,
			curated: m._curated === true,
			featured: m._featured === true
		};
	}

	function rank(s: SpaceResult): number {
		const base = s.trendingScore ?? (s.likes || 0) / 100;
		return s.fallback ? base - 1e6 : base;
	}

	async function fetch_results() {
		if (is_dataset) {
			await fetch_datasets(search_query);
			return;
		}
		const token = ++fetch_token;
		loading = true;
		try {
			const space_tag =
				active_subtab.spaceCategory ?? active_subtab.pipelineTag;
			const model_tag = active_subtab.pipelineTag;
			const kind =
				active_content_tab === "search"
					? "search"
					: active_content_tab === "new"
						? "new"
						: "trending";
			const query = active_content_tab === "search" ? search_query : "";

			const calls: Promise<any>[] = [];
			if (server?.search_spaces) {
				calls.push(
					server.search_spaces([kind, query, space_tag, "", zero_gpu_only])
				);
			} else {
				calls.push(Promise.resolve("[]"));
			}
			if (server?.search_models) {
				calls.push(server.search_models([kind, query, model_tag, ""]));
			} else {
				calls.push(Promise.resolve("[]"));
			}

			const [rawSpaces, rawModels] = await Promise.all(calls);
			if (token !== fetch_token) return;

			const spaceData =
				typeof rawSpaces === "string" ? JSON.parse(rawSpaces) : rawSpaces;
			const modelData =
				typeof rawModels === "string" ? JSON.parse(rawModels) : rawModels;

			const spaces = Array.isArray(spaceData) ? spaceData.map(parse_space) : [];
			const models = Array.isArray(modelData)
				? modelData
						.filter(
							(m: any) => m.pipeline_tag && TASK_SCHEMAS[m.pipeline_tag]
						)
						.map(parse_model)
				: [];

			const merged = [...spaces, ...models].sort((a, b) => rank(b) - rank(a));
			if (token !== fetch_token) return;
			results = merged.slice(0, 30);
		} catch {
			if (token === fetch_token) results = [];
		} finally {
			if (token === fetch_token) loading = false;
		}
	}

	async function fetch_datasets(query: string) {
		if (!server?.search_datasets) {
			results = [];
			loading = false;
			return;
		}
		const token = ++fetch_token;
		loading = true;
		try {
			const raw = await server.search_datasets([query]);
			if (token !== fetch_token) return;
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
				type: "dataset" as const,
				pipeline_tag: undefined
			}));
		} catch {
			if (token === fetch_token) results = [];
		} finally {
			if (token === fetch_token) loading = false;
		}
	}

	$effect(() => {
		active_subtab;
		active_content_tab;
		is_dataset;
		zero_gpu_only;
		if (active_content_tab === "search" && search_query.length < 2) {
			return;
		}
		const captured = active_content_tab;
		void fetch_results().then(() => {
			if (captured === "trending") trending_empty = results.length === 0;
			else if (captured === "new") new_empty = results.length === 0;
		});
	});

	function handle_search_input(e: Event) {
		search_query = (e.currentTarget as HTMLInputElement).value;
		if (search_timeout) clearTimeout(search_timeout);

		if (!is_dataset && looks_like_repo(search_query)) {
			search_timeout = setTimeout(() => void resolve_pinned(search_query), 120);
		} else {
			pinned_result = null;
			pinned_error = null;
			pinned_loading = false;
			pinned_token++;
		}

		if (is_dataset) {
			loading = true;
			search_timeout = setTimeout(() => void fetch_datasets(search_query), 150);
			return;
		}
		if (search_query.length < 2) {
			if (active_content_tab === "search") results = [];
			return;
		}
		active_content_tab = "search";
		loading = true;
		search_timeout = setTimeout(() => void fetch_results(), 150);
	}

	function select_model(item: SpaceResult) {
		if (!item.pipeline_tag) return;
		const schema = TASK_SCHEMAS[item.pipeline_tag];
		const inputHints = active_subtab.inputs;
		const outputHints = active_subtab.outputs;
		const template = {
			label: item.id.split("/").pop() || item.id,
			kind: "transform" as const,
			source: "model" as const,
			model_id: item.id,
			pipeline_tag: item.pipeline_tag,
			inputs: normalizeOperatorPorts(
				modality,
				schema?.inputs ?? [],
				inputHints
			),
			outputs: normalizeOperatorPorts(
				modality,
				schema?.outputs ?? [],
				outputHints
			),
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

	async function select_space(space: SpaceResult) {
		if (loading_space_id) return;
		loading_space_id = space.id;
		try {
			const api_info = await fetchSpaceApi(space.id);
			const inputHints = active_subtab.inputs;
			const outputHints = active_subtab.outputs;
			const template = {
				label: space.title || space.id.split("/").pop() || space.id,
				kind: "transform" as const,
				source: "space" as const,
				space_id: space.id,
				pipeline_tag: space.pipeline_tag,
				endpoint: api_info.endpoint,
				endpoints: api_info.endpoints,
				inputs: normalizeOperatorPorts(modality, api_info.inputs, inputHints),
				outputs: normalizeOperatorPorts(
					modality,
					api_info.outputs,
					outputHints
				),
				width: api_info.width,
				height: 90
			};
			if (mode === "update" && nodeId) {
				onupdate(nodeId, template);
			} else {
				oncreate(template);
			}
			onclose();
		} catch (err) {
			loading_space_id = null;
			const msg = err instanceof Error ? err.message : "Couldn't load space";
			const label = space.title || space.id;
			onerror?.(`${label}: ${msg}`);
		}
	}

	function feature_to_port_type(feature: any): string {
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

	async function select_dataset(dataset: SpaceResult) {
		loading_space_id = dataset.id;
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
						type: feature_to_port_type(f)
					}));
					if (ports.length > 0) outputs = ports;
				}
			}
		} catch {
		} finally {
			loading_space_id = null;
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

	function hub_url(item: SpaceResult): string {
		if (item.type === "dataset")
			return `https://huggingface.co/datasets/${item.id}`;
		if (item.type === "model") return `https://huggingface.co/${item.id}`;
		return `https://huggingface.co/spaces/${item.id}`;
	}

	function handle_row_click(item: SpaceResult) {
		if (item.type === "dataset") {
			void select_dataset(item);
		} else if (item.type === "model") {
			select_model(item);
		} else {
			select_space(item);
		}
	}

	let pinned_result = $state<SpaceResult | null>(null);
	let pinned_loading = $state(false);
	let pinned_error = $state<string | null>(null);
	let pinned_token = 0;

	const REPO_ID_RE = /^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/;
	const HUB_URL_RE = /(?:^|\b)(?:https?:\/\/)?(?:www\.)?(?:huggingface\.co|hf\.co)\//i;
	const HF_SPACE_SUB_RE = /^(?:https?:\/\/)?[a-z0-9-]+\.hf\.space/i;

	function looks_like_repo(input: string): boolean {
		const s = input.trim();
		if (!s) return false;
		return REPO_ID_RE.test(s) || HUB_URL_RE.test(s) || HF_SPACE_SUB_RE.test(s);
	}

	async function resolve_pinned(input: string) {
		if (!server?.resolve_repo) return;
		const myToken = ++pinned_token;
		pinned_loading = true;
		pinned_error = null;
		pinned_result = null;
		try {
			const raw = await server.resolve_repo([input]);
			if (myToken !== pinned_token) return;
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			if (data?.error) {
				pinned_error = data.error === "not_found" ? "Not found" : null;
				return;
			}
			const kind: ResultType = data.kind === "model" ? "model" : "space";
			const rec = data.record ?? {};
			const desc =
				rec.cardData?.short_description || rec.ai_short_description || "";

			let curated = false;
			if (server?.is_curated) {
				try {
					const cRaw = await server.is_curated([data.id, kind]);
					const cData = typeof cRaw === "string" ? JSON.parse(cRaw) : cRaw;
					curated = cData?.curated === true && cData?.status === "ok";
				} catch {
					/* noop */
				}
				if (myToken !== pinned_token) return;
			}

			pinned_result = {
				id: data.id,
				title:
					rec.cardData?.title || rec.title || data.id.split("/").pop() || data.id,
				description: desc,
				likes: rec.likes ?? 0,
				running: rec.runtime?.stage === "RUNNING",
				type: kind,
				pipeline_tag:
					rec.cardData?.pipeline_tag || rec.pipeline_tag || undefined,
				zero_gpu: kind === "space" ? is_zero_gpu_space(rec) : undefined,
				curated
			};
		} catch {
			if (myToken === pinned_token) pinned_error = null;
		} finally {
			if (myToken === pinned_token) pinned_loading = false;
		}
	}

	function format_likes(n: number): string {
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
					placeholder={search_placeholder}
					value={search_query}
					oninput={handle_search_input}
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

		{#if !is_dataset && visible_subtabs.length > 1}
			<div class="picker-subtabs">
				{#each visible_subtabs as st}
					<button
						class="picker-subtab"
						class:active={active_subtab.key === st.key}
						onclick={() => {
							trending_empty = null;
							new_empty = null;
							active_subtab = st;
							if (active_content_tab !== "search" || search_query.length < 2)
								active_content_tab = "trending";
						}}
					>
						{st.label}
					</button>
				{/each}
			</div>
		{/if}

		{#if !is_dataset}
			<div class="picker-mode-row">
				<span class="picker-mode-label">Sort:</span>
				{#if featured_results.length > 0}
					<button
						class="picker-mode-btn"
						class:active={active_content_tab === "featured"}
						title="Curated picks"
						onclick={() => {
							active_content_tab = "featured";
							search_query = "";
						}}>Featured</button
					>
				{/if}
				{#if trending_empty !== true}
					<button
						class="picker-mode-btn"
						class:active={active_content_tab === "trending"}
						onclick={() => {
							active_content_tab = "trending";
							search_query = "";
						}}>Trending</button
					>
				{/if}
				{#if new_empty !== true}
					<button
						class="picker-mode-btn"
						class:active={active_content_tab === "new"}
						onclick={() => {
							active_content_tab = "new";
							search_query = "";
						}}>New ✦</button
					>
				{/if}
				<label
					class="picker-zerogpu-toggle"
					class:active={zero_gpu_only}
					title="Show only ZeroGPU Spaces — they scale with your HF credits, give consistent ETAs, and have the clearest billing story"
				>
					<input type="checkbox" bind:checked={zero_gpu_only} />
					<span>ZeroGPU only</span>
				</label>
			</div>
		{/if}

		<div class="picker-results" class:picker-results-stale={loading}>
			{#if pinned_loading}
				<div class="picker-pinned picker-pinned-loading">
					<span class="spinner small"></span>
					<span>Resolving repo…</span>
				</div>
			{:else if pinned_error}
				<div class="picker-pinned picker-pinned-error">{pinned_error}</div>
			{:else if pinned_result}
				{@const pinned = pinned_result}
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="space-row pinned"
					class:loading={loading_space_id === pinned.id}
					class:uncurated={!pinned.curated}
					onclick={() => handle_row_click(pinned)}
					role="button"
					tabindex="0"
					title={pinned.curated
						? `Use this exact ${pinned.type}`
						: `Use this exact ${pinned.type} — not in our verified catalog`}
				>
					<div
						class="space-avatar"
						style="background:linear-gradient(135deg, {avatar_color(
							pinned.id
						)}, {avatar_color(pinned.id + '_2')})"
					>
						{avatar_initial(pinned.id)}
					</div>
					<div class="space-row-left">
						<div class="space-name-row">
							<span class="space-name"
								>{pinned.title ||
									(pinned.id.split("/").pop() ?? pinned.id)}</span
							>
							<span class="type-chip type-chip-{pinned.type}"
								>{pinned.type === "model" ? "Model" : "Space"}</span
							>
							{#if pinned.curated}
								<span
									class="verified-chip"
									title="Verified by the workflow team — checked daily"
									>✓ Verified</span
								>
							{:else}
								<span
									class="uncurated-chip"
									title="Not in our verified catalog — may not work or may be down"
									>Unverified</span
								>
							{/if}
							{#if pinned.type === "space" && pinned.zero_gpu}
								<span class="space-badge space-badge-zerogpu">ZeroGPU</span>
							{/if}
							{#if pinned.pipeline_tag}
								<span class="space-badge">{pinned.pipeline_tag}</span>
							{/if}
						</div>
						<div class="space-desc">
							{#if pinned.curated}
								Use this exact {pinned.type}
								{#if pinned.description} — {pinned.description}{/if}
							{:else}
								Not in our verified catalog — may not work. {pinned.description ||
									""}
							{/if}
						</div>
					</div>
					<div class="space-row-right">
						{#if loading_space_id === pinned.id}
							<span class="spinner small"></span>
						{/if}
						<a
							class="space-row-link"
							href={hub_url(pinned)}
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
			{/if}

			{#if loading && display_results.length === 0 && active_content_tab !== "featured"}
				<div class="picker-loading">
					<span class="spinner"></span>
				</div>
			{:else if display_results.length === 0 && !pinned_result}
				<div class="picker-empty">
					{active_content_tab === "search"
						? "Nothing found"
						: active_content_tab === "featured"
							? `No featured items for ${modality.label.toLowerCase()} yet`
							: `No ${modality.label.toLowerCase()} results found`}
				</div>
			{:else}
				{#each display_results as space (space.type + "/" + space.id)}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="space-row"
						class:loading={loading_space_id === space.id}
						class:fallback={space.fallback}
						onclick={() => handle_row_click(space)}
						role="button"
						tabindex="0"
					>
						<div
							class="space-avatar"
							style="background:linear-gradient(135deg, {avatar_color(
								space.id
							)}, {avatar_color(space.id + '_2')})"
						>
							{avatar_initial(space.id)}
						</div>
						<div class="space-row-left">
							<div class="space-name-row">
								<span class="space-name"
									>{space.title ||
										(space.id.split("/").pop() ?? space.id)}</span
								>
								{#if !is_dataset}
									<span class="type-chip type-chip-{space.type}"
										>{space.type === "model" ? "Model" : "Space"}</span
									>
								{/if}
								{#if space.curated}
									<span
										class="verified-chip"
										title="Verified by the workflow team — checked daily"
										>✓</span
									>
								{/if}
								{#if space.type === "space" && space.zero_gpu}
									<span class="space-badge space-badge-zerogpu">ZeroGPU</span>
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
							{#if loading_space_id === space.id}
								<span class="spinner small"></span>
							{:else if space.likes > 0}
								<span class="space-likes">♥ {format_likes(space.likes)}</span>
							{/if}
							<a
								class="space-row-link"
								href={hub_url(space)}
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
		flex-wrap: wrap;
		row-gap: 6px;
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

	.picker-zerogpu-toggle {
		margin-left: auto;
		position: relative;
		display: inline-flex;
		align-items: center;
		padding: 3px 10px;
		border-radius: 14px;
		border: 1px solid #2a2b36;
		font-family: "Manrope", sans-serif;
		font-size: 11px;
		font-weight: 600;
		color: #8b8d98;
		cursor: pointer;
		user-select: none;
		transition:
			background 0.12s,
			border-color 0.12s,
			color 0.12s;
	}

	.picker-zerogpu-toggle input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
		pointer-events: none;
	}

	.picker-zerogpu-toggle:hover {
		color: #d5d6de;
		border-color: #3a3b48;
	}

	.picker-zerogpu-toggle.active {
		background: rgba(249, 115, 22, 0.12);
		border-color: rgba(249, 115, 22, 0.35);
		color: #f97316;
	}

	:global(body:not(.dark)) .picker-zerogpu-toggle {
		border-color: #e2e4ea;
		color: #6b6e78;
	}

	:global(body:not(.dark)) .picker-zerogpu-toggle:hover {
		color: #1a1b25;
		border-color: #cdd0d8;
	}

	:global(body:not(.dark)) .picker-zerogpu-toggle.active {
		background: rgba(249, 115, 22, 0.1);
		border-color: rgba(249, 115, 22, 0.35);
		color: #d65500;
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

	.type-chip {
		font-family: "Manrope", sans-serif;
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 1px 6px;
		border-radius: 8px;
		flex-shrink: 0;
	}
	.type-chip-space {
		background: rgba(249, 115, 22, 0.12);
		color: #f97316;
	}
	.type-chip-model {
		background: rgba(139, 92, 246, 0.14);
		color: #8b5cf6;
	}
	:global(body:not(.dark)) .type-chip-space {
		background: rgba(234, 88, 12, 0.1);
		color: #d65500;
	}
	:global(body:not(.dark)) .type-chip-model {
		background: rgba(124, 58, 237, 0.1);
		color: #7c3aed;
	}

	.verified-chip {
		font-family: "Manrope", sans-serif;
		font-size: 10px;
		font-weight: 700;
		color: #10b981;
		flex-shrink: 0;
	}
	:global(body:not(.dark)) .verified-chip {
		color: #059669;
	}

	.uncurated-chip {
		font-family: "Manrope", sans-serif;
		font-size: 9px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		padding: 1px 6px;
		border-radius: 8px;
		background: rgba(245, 158, 11, 0.14);
		color: #f59e0b;
		flex-shrink: 0;
	}
	:global(body:not(.dark)) .uncurated-chip {
		background: rgba(217, 119, 6, 0.1);
		color: #b45309;
	}

	.space-row.pinned.uncurated {
		background: rgba(245, 158, 11, 0.05);
		border-left-color: #f59e0b;
	}
	:global(body:not(.dark)) .space-row.pinned.uncurated {
		background: rgba(245, 158, 11, 0.04);
	}

	.picker-pinned {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		color: #8b8d98;
	}
	.picker-pinned-error {
		color: #ef4444;
	}
	.space-row.pinned {
		background: rgba(249, 115, 22, 0.06);
		border-left: 3px solid #f97316;
	}
	:global(body:not(.dark)) .space-row.pinned {
		background: rgba(249, 115, 22, 0.05);
	}

	.space-row.fallback {
		opacity: 0.65;
	}
	.space-row.fallback:hover {
		opacity: 1;
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

	.picker-results {
		flex: 1;
		overflow-y: auto;
		padding: 6px 8px 10px;
		scrollbar-width: thin;
		scrollbar-color: #2a2b36 transparent;
		transition: opacity 0.12s ease;
	}

	.picker-results-stale {
		opacity: 0.55;
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

	.space-badge-zerogpu {
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

	:global(body:not(.dark)) .space-badge-zerogpu {
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
