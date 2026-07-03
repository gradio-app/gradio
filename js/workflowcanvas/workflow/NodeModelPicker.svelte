<script lang="ts">
	import { TASK_SCHEMAS } from "./node-library";
	import {
		fetchSpaceApi,
		is_zero_gpu_space,
		normalize_space_id,
		normalizeOperatorPorts
	} from "./space-api";
	import { PIPELINE_TAG_TO_ENDPOINT } from "./model-api";
	import { MODALITIES } from "./workflow-modalities";
	import type { ModalityConfig, SubTab } from "./workflow-modalities";
	import SearchIcon from "./icons/SearchIcon.svelte";
	import CloseIcon from "./icons/CloseIcon.svelte";
	import OpenLinkIcon from "./icons/OpenLinkIcon.svelte";
	import ImageIcon from "./icons/ImageIcon.svelte";
	import AudioIcon from "./icons/AudioIcon.svelte";
	import VideoIcon from "./icons/VideoIcon.svelte";
	import Model3DIcon from "./icons/Model3DIcon.svelte";
	import TextIcon from "./icons/TextIcon.svelte";
	import DatasetIcon from "./icons/DatasetIcon.svelte";
	import TaskIcon from "./icons/tasks/TaskIcon.svelte";

	type ResultType = "space" | "model" | "dataset";

	interface SpaceResult {
		id: string;
		title: string;
		description: string;
		likes: number;
		type: ResultType;
		pipeline_tag?: string;
		zero_gpu?: boolean;
		curated?: boolean;
		thumbnail?: string;
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
		oncleared?: () => void;
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
		oncleared,
		onerror
	}: Props = $props();

	const is_all = $derived(modality.key === "all");

	const is_dataset = $derived(modality.key === "data");

	const search_placeholder = $derived.by(() => {
		if (is_dataset) return "Search datasets, paste a Hub URL...";
		if (is_all) return "Search spaces & models, paste a Hub URL...";
		return `Search ${modality.label.toLowerCase()} spaces & models, paste a Hub URL...`;
	});

	let available_tasks = $state<Set<string> | null>(null);

	$effect(() => {
		const m = modality.key;
		available_tasks = null;
		if (m === "data") return;
		if (!server?.curated_modality_tasks) return;
		void server
			.curated_modality_tasks([m === "all" ? "" : m])
			.then((raw: any) => {
				try {
					const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
					available_tasks = new Set(Array.isArray(parsed) ? parsed : []);
				} catch {
					available_tasks = new Set();
				}
			});
	});

	function subtab_available(st: SubTab): boolean {
		if (available_tasks === null) return true;
		if (st.key === "all") return true;
		if (st.pipelineTag && available_tasks.has(st.pipelineTag)) return true;
		if (st.spaceCategory && available_tasks.has(st.spaceCategory)) return true;
		return false;
	}

	const sidebar_groups = $derived.by(() => {
		if (is_dataset) return [];
		available_tasks;
		const mods = is_all ? MODALITIES : [modality];
		return mods
			.map((m) => ({
				modality: m,
				subtabs: m.subtabs.filter(
					(st) => (!is_all || st.key !== "all") && subtab_available(st)
				)
			}))
			.filter((g) => g.subtabs.length > 0);
	});

	const all_visible_subtabs = $derived.by(() => {
		const flat = sidebar_groups.flatMap((g) => g.subtabs);
		return is_all ? [modality.subtabs[0], ...flat] : flat;
	});

	let active_subtab = $state<SubTab>(
		(initialSubtab && modality.subtabs.find((s) => s.key === initialSubtab)) ||
			modality.subtabs[0]
	);
	let active_task_modality = $state<string | null>(null);

	$effect(() => {
		if (all_visible_subtabs.length === 0) return;
		if (!all_visible_subtabs.some((st) => st.key === active_subtab.key)) {
			active_subtab = all_visible_subtabs[0];
			active_task_modality = null;
		}
	});

	function select_task(st: SubTab, mod_key: string | null): void {
		active_subtab = st;
		active_task_modality = mod_key;
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
	function avatar_color(id: string): string {
		let h = 5381;
		for (let i = 0; i < id.length; i++) h = ((h << 5) + h) ^ id.charCodeAt(i);
		return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
	}
	function avatar_initial(id: string): string {
		return (id.split("/").pop() || id)[0].toUpperCase();
	}

	const SPACE_IMAGES: Record<string, string> = {};

	let search_query = $state("");
	let space_results = $state<SpaceResult[]>([]);
	let model_results = $state<SpaceResult[]>([]);
	let dataset_results = $state<SpaceResult[]>([]);
	let loading = $state(false);
	let zero_gpu_only = $state(false);
	let loading_space_id = $state<string | null>(null);

	const has_results = $derived(
		is_dataset
			? dataset_results.length > 0
			: space_results.length + model_results.length > 0
	);

	let search_timeout: ReturnType<typeof setTimeout> | null = null;
	let resolve_timeout: ReturnType<typeof setTimeout> | null = null;
	let fetch_token = 0;

	function parse_space(s: any): SpaceResult {
		const desc = s.cardData?.short_description || s.ai_short_description || "";
		return {
			id: s.id,
			title: s.cardData?.title || s.title || s.id.split("/").pop() || s.id,
			description: desc,
			likes: s.likes ?? 0,
			type: "space",
			pipeline_tag: s.cardData?.pipeline_tag || s.pipeline_tag || undefined,
			zero_gpu: is_zero_gpu_space(s),
			curated: s._curated === true,
			thumbnail: s._thumbnail || undefined
		};
	}

	function parse_model(m: any): SpaceResult {
		return {
			id: m.id,
			title: m.id.split("/").pop() || m.id,
			description: m.pipeline_tag || "",
			likes: m.likes ?? 0,
			type: "model",
			pipeline_tag: m.pipeline_tag,
			curated: m._curated === true,
			thumbnail: m._thumbnail || undefined
		};
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
			const kind = search_query.length >= 2 ? "search" : "trending";
			const query = search_query.length >= 2 ? search_query : "";

			const backend_modality = is_all
				? (active_task_modality ?? "")
				: modality.key;
			const calls: Promise<any>[] = [];
			if (server?.search_spaces) {
				calls.push(
					server.search_spaces([
						kind,
						query,
						space_tag,
						backend_modality,
						zero_gpu_only
					])
				);
			} else {
				calls.push(Promise.resolve("[]"));
			}
			if (server?.search_models) {
				calls.push(
					server.search_models([kind, query, model_tag, backend_modality])
				);
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
						.filter((m: any) => m.pipeline_tag && TASK_SCHEMAS[m.pipeline_tag])
						.map(parse_model)
				: [];

			if (token !== fetch_token) return;
			space_results = spaces.slice(0, 24);
			model_results = models.slice(0, 20);
		} catch {
			if (token === fetch_token) {
				space_results = [];
				model_results = [];
			}
		} finally {
			if (token === fetch_token) loading = false;
		}
	}

	async function fetch_datasets(query: string) {
		if (!server?.search_datasets) {
			dataset_results = [];
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
				dataset_results = [];
				return;
			}
			dataset_results = data.slice(0, 20).map((d: any) => ({
				id: d.id,
				title: d.id.split("/").pop() || d.id,
				description: d.description || d.cardData?.summary || "",
				likes: d.likes ?? 0,
				type: "dataset" as const,
				pipeline_tag: undefined
			}));
		} catch {
			if (token === fetch_token) dataset_results = [];
		} finally {
			if (token === fetch_token) loading = false;
		}
	}

	$effect(() => {
		active_subtab;
		active_task_modality;
		is_dataset;
		modality.key;
		zero_gpu_only;
		void fetch_results();
	});

	function handle_search_input(e: Event) {
		search_query = (e.currentTarget as HTMLInputElement).value;
		if (search_timeout) clearTimeout(search_timeout);
		if (resolve_timeout) clearTimeout(resolve_timeout);

		if (!is_dataset && looks_like_repo(search_query)) {
			resolve_timeout = setTimeout(
				() => void resolve_pinned(search_query),
				120
			);
		} else {
			pinned_result = null;
			pinned_error = null;
			pinned_loading = false;
			pinned_token++;
		}

		loading = true;
		const fetcher = is_dataset
			? () => fetch_datasets(search_query)
			: () => fetch_results();
		search_timeout = setTimeout(() => void fetcher(), 150);
	}

	function select_model(item: SpaceResult) {
		const endpointName = item.pipeline_tag
			? PIPELINE_TAG_TO_ENDPOINT[item.pipeline_tag]
			: undefined;
		const schema = item.pipeline_tag ? TASK_SCHEMAS[item.pipeline_tag] : null;
		const inputHints = active_subtab.inputs;
		const outputHints = active_subtab.outputs;
		const template = {
			label: item.id.split("/").pop() || item.id,
			kind: "transform" as const,
			source: "model" as const,
			model_id: item.id,
			pipeline_tag: item.pipeline_tag,
			endpoint: endpointName,
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
			pinned_error = msg;
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
		let outputs: { id: string; label: string; type: string }[] = [
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
			void select_model(item);
		} else {
			select_space(item);
		}
	}

	let pinned_result = $state<SpaceResult | null>(null);
	let pinned_loading = $state(false);
	let pinned_error = $state<string | null>(null);
	let pinned_token = 0;

	function looks_like_repo(input: string): boolean {
		return normalize_space_id(input) !== null;
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
			const kind: ResultType =
				data.kind === "model"
					? "model"
					: data.kind === "dataset"
						? "dataset"
						: "space";
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
					rec.cardData?.title ||
					rec.title ||
					data.id.split("/").pop() ||
					data.id,
				description: desc,
				likes: rec.likes ?? 0,
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

{#snippet modality_icon(key: string)}
	{#if key === "image"}
		<ImageIcon />
	{:else if key === "audio"}
		<AudioIcon />
	{:else if key === "video"}
		<VideoIcon />
	{:else if key === "3d"}
		<Model3DIcon />
	{:else if key === "text"}
		<TextIcon />
	{:else if key === "data"}
		<DatasetIcon />
	{/if}
{/snippet}

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
		{#if is_dataset}
			<div class="picker-filter-pill" role="status">
				<span class="picker-filter-label">Filter</span>
				<span class="picker-filter-modality">
					<span class="picker-filter-icon">
						<DatasetIcon />
					</span>
					{modality.label}
				</span>
				<button
					class="picker-filter-close"
					onclick={() => (oncleared ? oncleared() : onclose())}
					aria-label="Clear modality filter"
					title="Clear filter — show all spaces & models"
				>
					<CloseIcon />
				</button>
			</div>
		{/if}

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
				{#if !is_dataset}
					<button
						class="picker-zerogpu-toggle"
						class:active={zero_gpu_only}
						onclick={() => (zero_gpu_only = !zero_gpu_only)}
						aria-pressed={zero_gpu_only}
						title={zero_gpu_only
							? "Showing only ZeroGPU spaces"
							: "Show only ZeroGPU spaces"}
					>
						⚡ ZeroGPU
					</button>
				{/if}
				<button
					class="picker-close-inline"
					onclick={onclose}
					aria-label="Close picker"
					title="Close"
				>
					<CloseIcon />
				</button>
			</div>
		</div>

		<div class="picker-body">
			{#if !is_dataset}
				<div class="picker-sidebar">
					{#if is_all}
						<div class="picker-sidebar-heading">
							<span>All tasks</span>
						</div>
						<button
							class="picker-task-item"
							class:active={active_subtab.key === "all"}
							onclick={() => select_task(modality.subtabs[0], null)}
						>
							<span class="picker-task-icon">
								<TaskIcon pipeline="all" />
							</span>
							<span class="picker-task-label">All</span>
						</button>
						{#each sidebar_groups as group (group.modality.key)}
							<div class="picker-sidebar-group-heading">
								<span class="picker-sidebar-icon">
									{@render modality_icon(group.modality.key)}
								</span>
								<span>{group.modality.label}</span>
							</div>
							{#each group.subtabs as st (st.key)}
								<button
									class="picker-task-item"
									class:active={active_subtab.key === st.key}
									onclick={() => select_task(st, group.modality.key)}
								>
									<span class="picker-task-icon">
										<TaskIcon pipeline={st.pipelineTag || st.key} />
									</span>
									<span class="picker-task-label">{st.label}</span>
								</button>
							{/each}
						{/each}
					{:else}
						<div class="picker-sidebar-heading">
							<span class="picker-sidebar-icon">
								{@render modality_icon(modality.key)}
							</span>
							<span>{modality.label} tasks</span>
						</div>
						<button
							class="picker-sidebar-clear"
							onclick={() => (oncleared ? oncleared() : onclose())}
							aria-label="Clear modality filter"
							title="Show all spaces & models"
						>
							← All tasks
						</button>
						{#each sidebar_groups[0]?.subtabs ?? [] as st (st.key)}
							<button
								class="picker-task-item"
								class:active={active_subtab.key === st.key}
								onclick={() => select_task(st, null)}
							>
								<span class="picker-task-icon">
									<TaskIcon pipeline={st.pipelineTag || st.key} />
								</span>
								<span class="picker-task-label">{st.label}</span>
							</button>
						{/each}
					{/if}
				</div>
			{/if}

			<div class="picker-results" class:picker-results-stale={loading}>
				{#if pinned_loading}
					<div class="picker-pinned picker-pinned-loading">
						<span class="spinner small"></span>
						<span>Resolving repo…</span>
					</div>
				{:else if pinned_error && !pinned_result}
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
									<span class="space-badge space-badge-zerogpu">⚡ ZeroGPU</span
									>
								{/if}
								{#if pinned.pipeline_tag}
									<span class="space-badge">{pinned.pipeline_tag}</span>
								{/if}
							</div>
							<div class="space-desc">
								{#if pinned.curated}
									Use this exact {pinned.type}
									{#if pinned.description}
										— {pinned.description}{/if}
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
					{#if pinned_error}
						<div class="picker-pinned picker-pinned-error">{pinned_error}</div>
					{/if}
				{/if}

				{#if loading && !has_results}
					<div class="picker-loading">
						<span class="spinner"></span>
					</div>
				{:else if !has_results && !pinned_result}
					<div class="picker-empty">
						{search_query.length >= 2
							? "Nothing found"
							: is_all
								? "No results found"
								: `No ${modality.label.toLowerCase()} results found`}
					</div>
				{:else if is_dataset}
					{#each dataset_results as dataset (dataset.id)}
						<!-- svelte-ignore a11y_no_static_element_interactions -->
						<div
							class="space-row"
							class:loading={loading_space_id === dataset.id}
							onclick={() => handle_row_click(dataset)}
							role="button"
							tabindex="0"
						>
							<div
								class="space-avatar"
								style="background:linear-gradient(135deg, {avatar_color(
									dataset.id
								)}, {avatar_color(dataset.id + '_2')})"
							>
								{avatar_initial(dataset.id)}
							</div>
							<div class="space-row-left">
								<div class="space-name-row">
									<span class="space-name"
										>{dataset.title ||
											(dataset.id.split("/").pop() ?? dataset.id)}</span
									>
								</div>
								{#if dataset.description}
									<div class="space-desc">{dataset.description}</div>
								{/if}
							</div>
							<div class="space-row-right">
								{#if loading_space_id === dataset.id}
									<span class="spinner small"></span>
								{:else if dataset.likes > 0}
									<span class="space-likes"
										>♥ {format_likes(dataset.likes)}</span
									>
								{/if}
								<a
									class="space-row-link"
									href={hub_url(dataset)}
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
				{:else}
					{#if space_results.length > 0}
						<div class="picker-section-header">Curated Spaces</div>
						<div class="picker-space-grid">
							{#each space_results as space (space.id)}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="space-card"
									class:loading={loading_space_id === space.id}
									onclick={() => handle_row_click(space)}
									role="button"
									tabindex="0"
									title={space.title || space.id}
								>
									<div class="space-card-thumb">
										{#if space.thumbnail || SPACE_IMAGES[space.id]}
											<img
												src={space.thumbnail || SPACE_IMAGES[space.id]}
												alt={space.title || space.id}
												loading="lazy"
											/>
										{:else}
											<div
												class="space-card-avatar"
												style="background:linear-gradient(135deg, {avatar_color(
													space.id
												)}, {avatar_color(space.id + '_2')})"
											>
												{avatar_initial(space.id)}
											</div>
										{/if}
										{#if space.zero_gpu}
											<span
												class="space-card-zerogpu"
												title="ZeroGPU — always running">⚡ ZeroGPU</span
											>
										{/if}
										{#if loading_space_id === space.id}
											<div class="space-card-loading">
												<span class="spinner"></span>
											</div>
										{/if}
									</div>
									<div class="space-card-body">
										<div class="space-card-title">
											{space.title || (space.id.split("/").pop() ?? space.id)}
										</div>
										<div class="space-card-meta">
											{#if space.likes > 0}
												<span class="space-likes"
													>♥ {format_likes(space.likes)}</span
												>
											{/if}
											{#if space.pipeline_tag}
												<span class="space-card-tag">{space.pipeline_tag}</span>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}

					{#if model_results.length > 0}
						<div class="picker-section-header">Curated Models</div>
						<div class="picker-space-grid">
							{#each model_results as model (model.id)}
								<!-- svelte-ignore a11y_no_static_element_interactions -->
								<div
									class="space-card"
									onclick={() => handle_row_click(model)}
									role="button"
									tabindex="0"
									title={model.id}
								>
									<div class="space-card-thumb">
										{#if model.thumbnail || SPACE_IMAGES[model.id]}
											<img
												src={model.thumbnail || SPACE_IMAGES[model.id]}
												alt={model.title || model.id}
												loading="lazy"
											/>
										{:else}
											<div
												class="space-card-avatar"
												style="background:linear-gradient(135deg, {avatar_color(
													model.id
												)}, {avatar_color(model.id + '_2')})"
											>
												{avatar_initial(model.id)}
											</div>
										{/if}
									</div>
									<div class="space-card-body">
										<div class="space-card-title">
											{model.title || (model.id.split("/").pop() ?? model.id)}
										</div>
										<div class="space-card-meta">
											<span class="space-card-owner"
												>{model.id.split("/")[0]}</span
											>
											{#if model.likes > 0}
												<span class="space-likes"
													>♥ {format_likes(model.likes)}</span
												>
											{/if}
											{#if model.pipeline_tag}
												<span class="space-card-tag">{model.pipeline_tag}</span>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				{/if}
			</div>
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
		width: min(940px, calc(100vw - 64px));
		/* Lock the panel to a fixed height so switching tasks doesn't make
		 * the modal jump up and down. The results list scrolls inside; on
		 * short viewports we cap to leave room for the toolbar and bottom
		 * bar. */
		height: min(720px, calc(100vh - 160px));
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

	.picker-zerogpu-toggle {
		position: absolute;
		right: 38px;
		top: 50%;
		transform: translateY(-50%);
		display: inline-flex;
		align-items: center;
		gap: 4px;
		height: 22px;
		padding: 0 8px;
		border: 1px solid rgba(249, 115, 22, 0.4);
		border-radius: 11px;
		background: transparent;
		color: rgba(249, 115, 22, 0.85);
		font-family: "Manrope", sans-serif;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition:
			background 0.15s,
			color 0.15s,
			border-color 0.15s;
	}

	.picker-zerogpu-toggle:hover {
		background: rgba(249, 115, 22, 0.12);
	}

	.picker-zerogpu-toggle.active {
		background: rgba(249, 115, 22, 0.85);
		border-color: rgba(249, 115, 22, 0.85);
		color: #fff;
	}

	.picker-filter-pill {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 12px 14px 0;
		padding: 6px 8px 6px 12px;
		border-radius: 28px;
		background: rgba(249, 115, 22, 0.12);
		box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.32);
		font-family: "Manrope", sans-serif;
		flex-shrink: 0;
	}

	.picker-filter-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #f97316;
		opacity: 0.75;
	}

	.picker-filter-modality {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 13px;
		font-weight: 700;
		color: #f97316;
		letter-spacing: -0.01em;
	}

	.picker-filter-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 16px;
		height: 16px;
	}

	.picker-filter-close {
		margin-left: auto;
		width: 22px;
		height: 22px;
		border: none;
		border-radius: 50%;
		background: transparent;
		color: rgba(249, 115, 22, 0.7);
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition:
			background 0.12s,
			color 0.12s;
	}

	.picker-filter-close:hover {
		background: rgba(249, 115, 22, 0.18);
		color: #f97316;
	}

	:global(body:not(.dark)) .picker-filter-pill {
		background: rgba(249, 115, 22, 0.1);
		box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.3);
	}

	:global(body:not(.dark)) .picker-filter-label,
	:global(body:not(.dark)) .picker-filter-modality {
		color: #d65500;
	}

	:global(body:not(.dark)) .picker-filter-close {
		color: rgba(214, 85, 0, 0.7);
	}

	:global(body:not(.dark)) .picker-filter-close:hover {
		background: rgba(214, 85, 0, 0.14);
		color: #d65500;
	}

	.picker-search-row {
		padding: 14px 16px 10px;
		flex-shrink: 0;
	}

	.picker-search-wrap {
		position: relative;
		display: flex;
		align-items: center;
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
		padding: 11px 130px 11px 36px;
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

	.picker-body {
		display: flex;
		flex: 1;
		min-height: 0;
	}

	.picker-sidebar {
		width: 200px;
		flex-shrink: 0;
		overflow-y: auto;
		border-right: 1px solid #2a2b36;
		padding: 4px 8px 14px;
		scrollbar-width: thin;
		scrollbar-color: #2a2b36 transparent;
	}

	.picker-sidebar-heading,
	.picker-sidebar-group-heading {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 8px 6px;
		font-family: "Manrope", sans-serif;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #4a4d57;
	}

	.picker-sidebar-group-heading {
		margin-top: 14px;
	}

	.picker-sidebar-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
	}

	.picker-sidebar-clear {
		display: block;
		width: calc(100% - 16px);
		margin: 2px 8px 8px;
		padding: 6px 10px;
		border: 1px solid #2a2b36;
		border-radius: 8px;
		background: transparent;
		color: #8b8d98;
		font-family: "Manrope", sans-serif;
		font-size: 11px;
		font-weight: 600;
		text-align: left;
		cursor: pointer;
		transition:
			background 0.12s,
			border-color 0.12s,
			color 0.12s;
	}

	.picker-sidebar-clear:hover {
		background: rgba(255, 255, 255, 0.04);
		border-color: #3a3b48;
		color: #d5d6de;
	}

	.picker-task-item {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 7px 10px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: #8b8d98;
		font-family: "Manrope", sans-serif;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: -0.01em;
		text-align: left;
		cursor: pointer;
		transition:
			background 0.12s,
			color 0.12s;
	}

	.picker-task-item:hover {
		background: rgba(255, 255, 255, 0.04);
		color: #e8e9f0;
	}

	.picker-task-item.active {
		background: rgba(249, 115, 22, 0.08);
		color: #f97316;
	}

	.picker-task-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-size: 16px;
		line-height: 1;
		opacity: 0.85;
		flex-shrink: 0;
	}

	.picker-task-item:hover .picker-task-icon,
	.picker-task-item.active .picker-task-icon {
		opacity: 1;
	}

	.picker-task-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	:global(body:not(.dark)) .picker-sidebar {
		border-right-color: #e2e4ea;
		scrollbar-color: #e2e4ea transparent;
	}

	:global(body:not(.dark)) .picker-sidebar-heading,
	:global(body:not(.dark)) .picker-sidebar-group-heading {
		color: #8b8d98;
	}

	:global(body:not(.dark)) .picker-sidebar-clear {
		border-color: #e2e4ea;
		color: #6b6e78;
	}

	:global(body:not(.dark)) .picker-sidebar-clear:hover {
		background: rgba(0, 0, 0, 0.04);
		border-color: #cdd0d8;
		color: #1a1b25;
	}

	:global(body:not(.dark)) .picker-task-item {
		color: #6b6e78;
	}

	:global(body:not(.dark)) .picker-task-item:hover {
		background: rgba(0, 0, 0, 0.04);
		color: #1a1b25;
	}

	:global(body:not(.dark)) .picker-task-item.active {
		background: rgba(249, 115, 22, 0.1);
		color: #d65500;
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
		background: rgba(239, 68, 68, 0.08);
		border-radius: 8px;
		margin: 4px 0;
		font-size: 12.5px;
	}
	.space-row.pinned {
		background: rgba(249, 115, 22, 0.06);
	}
	:global(body:not(.dark)) .space-row.pinned {
		background: rgba(249, 115, 22, 0.05);
	}

	.picker-results {
		position: relative;
		flex: 1;
		min-width: 0;
		overflow-y: auto;
		padding: 6px 10px 12px;
		scrollbar-width: thin;
		scrollbar-color: #2a2b36 transparent;
		transition: opacity 0.12s ease;
	}

	.picker-results-stale {
		opacity: 0.55;
	}

	.picker-section-header {
		font-family: "Manrope", sans-serif;
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #4a4d57;
		padding: 10px 6px 6px;
	}

	:global(body:not(.dark)) .picker-section-header {
		color: #8b8d98;
	}

	.picker-space-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 12px;
		padding: 2px 4px 8px;
	}

	.space-card {
		display: block;
		min-height: 180px;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.025);
		border: 1px solid rgba(255, 255, 255, 0.05);
		cursor: pointer;
		overflow: hidden;
		transition:
			background 0.12s,
			border-color 0.12s,
			transform 0.12s;
	}

	.space-card:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(249, 115, 22, 0.35);
		transform: translateY(-1px);
	}

	.space-card.loading {
		opacity: 0.6;
		pointer-events: none;
	}

	.space-card-thumb {
		position: relative;
		display: block;
		width: 100%;
		height: 120px;
		min-height: 120px;
		max-height: 120px;
		overflow: hidden;
		background: #0c0d10;
		flex-shrink: 0;
	}

	.space-card-thumb img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.space-card-avatar {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: "Manrope", sans-serif;
		font-size: 48px;
		font-weight: 800;
		color: rgba(0, 0, 0, 0.55);
		text-shadow: 0 1px 2px rgba(255, 255, 255, 0.18);
	}

	.space-card-zerogpu {
		position: absolute;
		top: 6px;
		right: 6px;
		font-family: "Manrope", sans-serif;
		font-size: 9px;
		font-weight: 700;
		padding: 2px 6px;
		border-radius: 6px;
		background: rgba(249, 115, 22, 0.85);
		color: #fff;
		letter-spacing: 0.02em;
	}

	.space-card-loading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(12, 13, 16, 0.55);
	}

	.space-card-body {
		padding: 8px 10px 10px;
		min-width: 0;
	}

	.space-card-title {
		display: flex;
		align-items: center;
		gap: 4px;
		font-family: "Manrope", sans-serif;
		font-size: 13px;
		font-weight: 700;
		color: #e8e9f0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.space-card-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 3px;
		font-family: "Manrope", sans-serif;
		font-size: 10px;
		color: #6b6e78;
		white-space: nowrap;
		overflow: hidden;
	}

	.space-card-tag {
		color: #8b8d98;
		text-overflow: ellipsis;
		overflow: hidden;
	}

	:global(body:not(.dark)) .space-card {
		background: #fafbfc;
		border-color: #e8eaef;
	}

	:global(body:not(.dark)) .space-card:hover {
		background: #f4f5f8;
		border-color: rgba(249, 115, 22, 0.35);
	}

	:global(body:not(.dark)) .space-card-thumb {
		background: #f0f1f5;
	}

	:global(body:not(.dark)) .space-card-title {
		color: #1a1b25;
	}

	:global(body:not(.dark)) .space-card-meta {
		color: #8b8d98;
	}

	:global(body:not(.dark)) .space-card-tag {
		color: #6b6e78;
	}

	.space-card-owner {
		color: #6b6e78;
		flex-shrink: 0;
	}

	:global(body:not(.dark)) .space-card-owner {
		color: #8b8d98;
	}

	.picker-loading {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
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

	.space-badge-providers {
		background: rgba(56, 189, 248, 0.14);
		color: #38bdf8;
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
		flex-shrink: 0;
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
		flex-shrink: 0;
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

	:global(body:not(.dark)) .space-badge-providers {
		background: rgba(56, 189, 248, 0.14);
		color: #0369a1;
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
