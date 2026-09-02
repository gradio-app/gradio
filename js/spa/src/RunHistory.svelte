<script lang="ts">
	import { onMount } from "svelte";
	import {
		asset_url,
		clear_run_history,
		delete_run_history,
		list_bucket_records,
		on_run_history_change,
		read_run_history,
		read_run_history_storage,
		stage_run_history_replay,
		type HistoryRecord,
		type RunHistoryScope,
		type RunHistoryStorage,
		type StoredRun,
		type StoredRunComponent
	} from "@gradio/client";
	import HistoryStorageControl from "@gradio/core/history_storage_control";
	import PageFooter from "@gradio/core/page_footer";
	import { _ } from "svelte-i18n";
	import RunValue from "./RunValue.svelte";
	import { summarize } from "./run_value";

	interface HistoryConfig extends RunHistoryScope {
		title?: string;
		components: {
			id: number;
			type: string;
			component_class_id: string;
			props: Record<string, unknown>;
		}[];
		dependencies: {
			id: number;
			api_name?: string | null;
			inputs: number[];
			outputs: number[];
		}[];
	}

	interface Props {
		root: string;
		scope: HistoryConfig;
		footer_links?: (string | Record<string, string>)[];
	}

	let { root, scope, footer_links = [] }: Props = $props();

	let app_url = $derived(new URL(root, window.location.href).href);
	let runs: StoredRun[] = $state([]);
	let storage = $state<RunHistoryStorage>({ type: "browser" });
	let loading = $state(false);
	let error: string | null = $state(null);
	let refresh_version = 0;

	const bucket_id = $derived(storage.bucket_id ?? "");
	const using_bucket = $derived(storage.type === "bucket");
	const oauth_available = $derived(
		scope.components.some((component) => component.type === "loginbutton")
	);
	const running_locally = $derived(
		["localhost", "127.0.0.1", "::1", "[::1]"].includes(
			window.location.hostname
		)
	);

	let groups = $derived.by(() => {
		const grouped = new Map<string, StoredRun[]>();
		for (const run of runs) {
			const current = grouped.get(run.api_name) || [];
			current.push(run);
			grouped.set(run.api_name, current);
		}
		return Array.from(grouped.entries());
	});

	function endpoint_key(
		api_name: string | null | undefined,
		id: number
	): string {
		if (!api_name) return `fn-${id}`;
		const slug = api_name
			.replace(/^\//, "")
			.replace(/[^A-Za-z0-9_.-]+/g, "-")
			.replace(/^[-.]+|[-.]+$/g, "")
			.slice(0, 80)
			.replace(/^[-.]+|[-.]+$/g, "");
		return slug || "endpoint";
	}

	function dependency_for(endpoint: string) {
		return scope.dependencies.find(
			(dependency) =>
				endpoint_key(dependency.api_name, dependency.id) === endpoint
		);
	}

	function component_metadata(id: number): StoredRunComponent | null {
		const component = scope.components.find((item) => item.id === id);
		return component
			? {
					type: component.type,
					component_class_id: component.component_class_id,
					props: component.props
				}
			: null;
	}

	function restore_assets(value: unknown, record: HistoryRecord): unknown {
		if (Array.isArray(value)) {
			return value.map((item) => restore_assets(item, record));
		}
		if (!value || typeof value !== "object") return value;
		const marker = (value as { __asset__?: unknown }).__asset__;
		if (typeof marker === "string") {
			const url = asset_url(
				root,
				bucket_id,
				record.endpoint,
				record.record_id,
				marker
			);
			return {
				path: url,
				url,
				orig_name: marker,
				meta: { _type: "gradio.FileData" }
			};
		}
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [
				key,
				restore_assets(item, record)
			])
		);
	}

	function bucket_run(record: HistoryRecord): StoredRun {
		const dependency = dependency_for(record.endpoint);
		return {
			id: record.record_id,
			endpoint: dependency?.id ?? record.endpoint,
			api_name: dependency?.api_name
				? `/${dependency.api_name.replace(/^\//, "")}`
				: `/${record.endpoint}`,
			fn_index: dependency?.id ?? -1,
			page: new URL(root, window.location.href).pathname,
			inputs: restore_assets(record.inputs, record),
			outputs: restore_assets(record.outputs, record),
			input_components: dependency?.inputs.map(component_metadata),
			output_components: dependency?.outputs.map(component_metadata),
			status: "completed",
			started_at: record.started_at
		};
	}

	function authentication_error(): string {
		if (running_locally) {
			return "Log in locally with `hf auth login`, then try again.";
		}
		if (oauth_available) {
			return "Sign in with Hugging Face to connect a bucket.";
		}
		return "This app must enable Hugging Face OAuth before visitors can connect buckets.";
	}

	async function refresh(): Promise<void> {
		const version = ++refresh_version;
		error = null;
		if (storage.type === "browser") {
			loading = false;
			runs = read_run_history(scope);
			return;
		}
		loading = true;
		const result = await list_bucket_records(root, storage.bucket_id);
		if (version !== refresh_version) return;
		loading = false;
		if (!result.ok) {
			runs = [];
			error =
				result.status === 401
					? authentication_error()
					: (result.detail ?? "Could not load bucket history.");
			return;
		}
		runs = result.data.map(bucket_run);
	}

	onMount(() => {
		storage = read_run_history_storage(scope);
		// Embedded on Spaces this page loads inside an iframe the parent has
		// already scrolled past, so it opens mid-list unless we ask for the top.
		if ("parentIFrame" in window) {
			window.parentIFrame?.scrollTo(0, 0);
		}
		void refresh();
		return on_run_history_change(() => {
			storage = read_run_history_storage(scope);
			void refresh();
		});
	});

	function values(value: unknown): unknown[] {
		if (Array.isArray(value)) return value;
		if (value && typeof value === "object") {
			return Object.values(value as Record<string, unknown>);
		}
		return value === null || value === undefined ? [] : [value];
	}

	function label(
		meta: StoredRunComponent | null | undefined,
		index: number
	): string {
		const component_label = meta?.props?.label;
		if (typeof component_label === "string" && component_label) {
			return component_label;
		}
		return meta?.type || `Value ${index + 1}`;
	}

	// `gr.State` lives on the server, so its value is never part of a saved run
	// and there is nothing worth previewing or restoring for it.
	function displayed(
		values_list: unknown[],
		components: (StoredRunComponent | null)[] | undefined
	): { value: unknown; meta: StoredRunComponent | null; index: number }[] {
		return values_list
			.map((value, index) => ({
				value,
				meta: components?.[index] ?? null,
				index
			}))
			.filter((entry) => entry.meta?.type !== "state");
	}

	function format_time(value: string): string {
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: "medium",
			timeStyle: "short"
		}).format(new Date(value));
	}

	function format_duration(ms: number): string {
		if (ms < 1) return "<1ms";
		if (ms < 1000) return `${Math.round(ms)}ms`;
		if (ms < 10000) return `${(ms / 1000).toFixed(2)}s`;
		if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
		// Round the total first: rounding the remainder on its own turns 119.6s
		// into "1m 60s".
		const total_seconds = Math.round(ms / 1000);
		return `${Math.floor(total_seconds / 60)}m ${total_seconds % 60}s`;
	}

	function duration_detail(run: StoredRun): string {
		const parts = [`Ran in ${format_duration(run.duration_ms ?? 0)}`];
		if (run.queued_ms) {
			parts.push(`queued for ${format_duration(run.queued_ms)}`);
		}
		if (run.completed_at) {
			const total = Date.parse(run.completed_at) - Date.parse(run.started_at);
			if (total > 0) parts.push(`${format_duration(total)} in total`);
		}
		return parts.join(" · ");
	}

	function status_label(run: StoredRun): string {
		if (run.status === "completed") return "Completed";
		return run.status === "failed" ? "Failed" : "Running";
	}

	// Hover reveals the error, but tapping has to work too, and a touch device
	// has no hover to offer.
	let open_error: string | null = $state(null);

	function toggle_error(id: string): void {
		open_error = open_error === id ? null : id;
	}

	function close_error(event: KeyboardEvent): void {
		if (event.key !== "Escape") return;
		open_error = null;
		// Pressing a key promotes the trigger to `:focus-visible`, which would
		// keep the message on screen even though it was just dismissed.
		const active = document.activeElement;
		if (active instanceof HTMLElement && active.matches(".error-trigger")) {
			active.blur();
		}
	}

	function load(run: StoredRun): void {
		if (run.fn_index < 0) return;
		stage_run_history_replay(scope, run);
		const app_url = new URL(root, window.location.href);
		let target = new URL(run.page || app_url.pathname, app_url);
		if (target.origin !== app_url.origin) target = app_url;
		window.location.assign(target);
	}

	function clear_all(): void {
		if (!window.confirm("Clear all saved runs for this app?")) return;
		clear_run_history(scope);
		void refresh();
	}

	function delete_run(run: StoredRun): void {
		if (!window.confirm("Delete this saved run?")) return;
		delete_run_history(scope, run.id);
		void refresh();
	}
</script>

<svelte:window onkeydown={close_error} />

<main class="history-page" data-testid="run-history">
	<header class="page-header">
		<div class="title-block">
			<h1>Run history ({runs.length})</h1>
			<HistoryStorageControl {root} {scope} bind:storage />
		</div>
		{#if using_bucket}
			<a
				class="view-bucket"
				href="https://huggingface.co/buckets/{bucket_id}"
				target="_blank"
				rel="noopener noreferrer">View bucket ↗</a
			>
		{:else if runs.length}
			<button class="clear" onclick={clear_all}>Clear history</button>
		{/if}
	</header>

	{#if loading}
		<section class="empty loading-state">
			<div class="spinner" aria-hidden="true"></div>
			<h2>Loading history</h2>
			<p>Fetching runs from {bucket_id}…</p>
		</section>
	{:else if error}
		<section class="empty error-state">
			<h2>History unavailable</h2>
			<p>{error}</p>
			<button class="retry" onclick={() => refresh()}>Try again</button>
		</section>
	{:else if groups.length === 0}
		<section class="empty">
			<h2>No runs yet</h2>
			<p>
				{using_bucket
					? `New runs will be saved to ${bucket_id}.`
					: "Use the app, then return here to load previous runs."}
			</p>
		</section>
	{:else}
		{#each groups as [api_name, endpoint_runs]}
			<section class="group">
				<header class="group-header">
					<code>{api_name}</code>
					<span class="count"
						>{endpoint_runs.length}
						{endpoint_runs.length === 1 ? "run" : "runs"}</span
					>
				</header>
				<div class="table-header" aria-hidden="true">
					<span>Inputs</span><span>Outputs</span>
				</div>
				{#each endpoint_runs as run (run.id)}
					{@const input_cells = displayed(
						values(run.inputs),
						run.input_components
					)}
					{@const output_cells = displayed(
						values(run.outputs),
						run.output_components
					)}
					<article class="run">
						<section class="run-values">
							<h3>Inputs</h3>
							{#each input_cells as cell (cell.index)}
								<div class="example-cell">
									<span class="value-label">{label(cell.meta, cell.index)}</span
									>
									{#if cell.meta}
										<RunValue component={cell.meta} value={cell.value} {root} />
									{:else}
										<span class="fallback" title={summarize(cell.value)}
											>{summarize(cell.value)}</span
										>
									{/if}
								</div>
							{/each}
						</section>
						<section class="run-values">
							<h3>Outputs</h3>
							{#if output_cells.length}
								{#each output_cells as cell (cell.index)}
									<div class="example-cell">
										<span class="value-label"
											>{label(cell.meta, cell.index)}</span
										>
										{#if cell.meta}
											<RunValue
												component={cell.meta}
												value={cell.value}
												{root}
											/>
										{:else}
											<span class="fallback" title={summarize(cell.value)}
												>{summarize(cell.value)}</span
											>
										{/if}
									</div>
								{/each}
							{:else}
								<div class="empty-output">No saved output</div>
							{/if}
						</section>
						<footer class="metadata">
							<span
								class="status"
								class:completed={run.status === "completed"}
								class:failed={run.status === "failed"}
								class:running={run.status === "running"}
							>
								<span class="dot" aria-hidden="true"></span>
								{#if run.error}
									<!-- The message is long and only matters for the run that
									     failed, so it is revealed from the status itself. -->
									<span class="error-anchor" class:open={open_error === run.id}>
										<button
											type="button"
											class="error-trigger"
											onclick={() => toggle_error(run.id)}
										>
											{status_label(run)}
										</button>
										<span class="error-bubble" aria-hidden="true"
											>{run.error}</span
										>
										<span class="visually-hidden">: {run.error}</span>
									</span>
								{:else}
									{status_label(run)}
								{/if}
								{#if run.duration_ms !== undefined}
									<span class="duration" title={duration_detail(run)}
										>in {format_duration(run.duration_ms)}</span
									>
								{/if}
							</span>
							<span class="separator" aria-hidden="true">·</span>
							<time datetime={run.started_at}
								>{format_time(run.started_at)}</time
							>
							<div class="actions">
								<button
									class="load"
									disabled={run.fn_index < 0}
									title={run.fn_index < 0
										? "This endpoint is not available in the current app version"
										: "Load this run into the app"}
									onclick={() => load(run)}
									><span class="play" aria-hidden="true">▶</span> Load run</button
								>
								{#if !using_bucket}
									<button class="delete" onclick={() => delete_run(run)}
										>Delete</button
									>
								{/if}
							</div>
						</footer>
					</article>
				{/each}
			</section>
		{/each}
	{/if}

	<PageFooter {app_url} {footer_links} i18n={$_} />
</main>

<style>
	.history-page {
		box-sizing: border-box;
		width: min(100%, 1120px);
		margin: 0 auto;
		padding: 44px 24px 80px;
		color: var(--body-text-color);
	}
	.page-header,
	.group-header,
	.metadata {
		display: flex;
		align-items: center;
	}
	.page-header {
		justify-content: space-between;
		gap: 24px;
		padding: 0 2px 26px;
		border-bottom: 1px solid var(--border-color-primary, #e4e4e7);
	}
	h1 {
		margin: 0;
		font-size: var(--text-xxl, 26px);
		font-weight: var(--weight-semibold, 600);
		line-height: 1.2;
	}
	.title-block {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 10px;
	}
	.empty p {
		margin: 0;
		color: var(--body-text-color-subdued, #71717a);
	}
	.clear,
	.delete,
	.retry,
	.view-bucket {
		border: var(--button-border-width, 1px) solid
			var(--button-secondary-border-color, #d4d4d8);
		border-radius: var(--button-medium-radius, 8px);
		background: var(
			--button-secondary-background-fill,
			linear-gradient(#fff, #f4f4f5)
		);
		color: var(--button-secondary-text-color, #27272a);
		font-size: var(--button-medium-text-size, 14px);
		font-weight: var(--button-medium-text-weight, 600);
		cursor: pointer;
		box-shadow: var(--button-secondary-shadow, 0 1px 2px rgb(0 0 0 / 8%));
		transition: var(--button-transition, 0.1s ease);
		text-decoration: none;
	}
	.clear,
	.view-bucket,
	.retry {
		padding: 8px 12px;
	}
	.load {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 5px 10px;
		border: var(--button-border-width, 1px) solid transparent;
		border-radius: var(--button-medium-radius, 8px);
		background: var(--color-accent-soft, #ffedd5);
		color: var(--color-accent, #ea580c);
		font-size: 13px;
		font-weight: var(--button-medium-text-weight, 600);
		cursor: pointer;
		transition: var(--button-transition, 0.1s ease);
	}
	.load .play {
		font-size: 8px;
		line-height: 1;
	}
	.delete {
		padding: 5px 10px;
		border-color: transparent;
		background: transparent;
		box-shadow: none;
		color: var(--body-text-color-subdued, #71717a);
	}
	.clear:hover,
	.delete:hover {
		border-color: var(--button-secondary-border-color-hover, #a1a1aa);
		background: var(--button-secondary-background-fill-hover, #f4f4f5);
		color: var(--button-secondary-text-color-hover, #18181b);
	}
	.load:hover {
		border-color: var(--color-accent, #ea580c);
	}
	.load:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
	.group {
		/* Not `overflow: hidden`, so an error bubble is never clipped. The
		   header rounds its own corners instead. */
		margin-top: 24px;
		border: 1px solid var(--border-color-primary, #e4e4e7);
		border-radius: var(--radius-xl, 12px);
		background: var(--block-background-fill, #fff);
		box-shadow: var(--block-shadow, 0 1px 3px rgb(0 0 0 / 6%));
	}
	.group-header {
		gap: 12px;
		padding: 14px 18px;
		border-bottom: 1px solid var(--border-color-primary, #e4e4e7);
		border-radius: var(--radius-xl, 12px) var(--radius-xl, 12px) 0 0;
		background: var(--background-fill-secondary, #fafafa);
		font-size: var(--text-lg, 18px);
		font-weight: var(--weight-semibold, 600);
	}
	.group-header code {
		color: var(--color-accent, #f97316);
		font-family: var(--font-mono, monospace);
	}
	.count {
		margin-left: auto;
		padding: 3px 9px;
		border-radius: 999px;
		background: var(--background-fill-primary, #fff);
		box-shadow: inset 0 0 0 1px var(--border-color-primary, #e4e4e7);
		color: var(--body-text-color, #27272a);
		font-size: var(--text-sm, 14px);
		font-weight: var(--weight-semibold, 600);
		font-variant-numeric: tabular-nums;
	}
	.table-header,
	.run {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
	}
	.table-header {
		gap: 16px;
		padding: 8px 18px;
		border-bottom: 1px solid var(--border-color-primary, #e4e4e7);
		color: var(--block-label-text-color, #52525b);
		font-size: var(--block-label-text-size, 12px);
		font-weight: var(--block-label-text-weight, 600);
		text-transform: uppercase;
	}
	.run {
		gap: 16px;
		padding: 16px 18px 12px;
	}
	.run + .run {
		border-top: 1px solid var(--border-color-primary, #e4e4e7);
	}
	.run-values {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 8px;
	}
	/* The column headings above are decorative duplicates hidden from assistive
	   technology, so these have to stay in the accessibility tree even though
	   they are redundant on screen. The mobile breakpoint, which drops the
	   columns, reveals them. */
	.run-values h3 {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: 0;
		overflow: hidden;
		clip-path: inset(50%);
		color: var(--block-label-text-color, #52525b);
		font-size: 12px;
		text-transform: uppercase;
		white-space: nowrap;
	}
	.example-cell {
		min-width: 0;
		padding: 10px;
		border: 1px solid var(--border-color-primary, #e4e4e7);
		border-radius: var(--radius-lg, 8px);
		background: var(--background-fill-secondary, #fafafa);
	}
	.value-label {
		display: block;
		margin-bottom: 5px;
		color: var(--body-text-color-subdued, #71717a);
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
	}
	.fallback,
	.empty-output {
		display: block;
		overflow: hidden;
		color: var(--body-text-color, #27272a);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.empty-output {
		padding: 12px;
		color: var(--body-text-color-subdued, #71717a);
		font-style: italic;
	}
	.metadata {
		grid-column: 1 / -1;
		gap: 10px;
		min-width: 0;
		margin-top: 10px;
		color: var(--body-text-color-subdued, #71717a);
		font-size: 13px;
	}
	.status {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-weight: 600;
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: currentColor;
	}
	.error-anchor {
		display: inline-flex;
		position: relative;
	}
	.error-trigger {
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-weight: 600;
		cursor: help;
		/* Signals that there is a message to reveal. */
		text-decoration: underline dotted;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}
	.error-bubble {
		display: none;
		position: absolute;
		bottom: calc(100% + 7px);
		left: 0;
		z-index: 5;
		box-sizing: border-box;
		width: max-content;
		max-width: min(320px, 60vw);
		padding: 6px 9px;
		border-radius: var(--radius-md, 6px);
		background: var(--body-text-color, #27272a);
		color: var(--background-fill-primary, #fff);
		font-weight: 400;
		font-size: 12px;
		line-height: 1.4;
		white-space: normal;
		box-shadow: 0 2px 8px rgb(0 0 0 / 18%);
	}
	.error-anchor:hover .error-bubble,
	.error-trigger:focus-visible ~ .error-bubble,
	.error-anchor.open .error-bubble {
		display: block;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.duration {
		color: var(--body-text-color-subdued, #71717a);
		font-weight: 400;
		font-variant-numeric: tabular-nums;
	}
	.separator {
		color: var(--border-color-primary, #e4e4e7);
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 4px;
		margin-left: auto;
	}
	.completed {
		color: #15803d;
	}
	.failed {
		color: #b91c1c;
	}
	.running {
		color: #b45309;
	}
	.empty {
		margin-top: 32px;
		padding: 64px 24px;
		border: 1px solid var(--border-color-primary, #e4e4e7);
		border-radius: var(--radius-xl, 12px);
		background: var(--block-background-fill, #fff);
		text-align: center;
	}
	.empty h2 {
		margin: 0;
	}
	.loading-state,
	.error-state {
		display: flex;
		align-items: center;
		flex-direction: column;
		gap: 10px;
	}
	.spinner {
		width: 20px;
		height: 20px;
		border: 2px solid var(--border-color-primary, #e4e4e7);
		border-top-color: var(--color-accent, #f97316);
		border-radius: 50%;
		animation: spin 700ms linear infinite;
	}
	.retry:hover,
	.view-bucket:hover {
		border-color: var(--button-secondary-border-color-hover, #a1a1aa);
		background: var(--button-secondary-background-fill-hover, #f4f4f5);
		color: var(--button-secondary-text-color-hover, #18181b);
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	:global(.dark) .completed {
		color: #4ade80;
	}
	:global(.dark) .failed {
		color: #f87171;
	}
	:global(.dark) .running {
		color: #fbbf24;
	}
	@media (max-width: 700px) {
		.history-page {
			padding: 28px 16px 60px;
		}
		.page-header {
			align-items: flex-start;
			flex-direction: column;
		}
		.clear,
		.view-bucket {
			align-self: stretch;
			text-align: center;
		}
		.table-header {
			display: none;
		}
		.run {
			grid-template-columns: 1fr;
		}
		.run-values h3 {
			position: static;
			width: auto;
			height: auto;
			overflow: visible;
			clip-path: none;
		}
		.metadata {
			grid-column: 1;
			align-items: flex-start;
			flex-wrap: wrap;
		}
		/* The row wraps here, so the separator would dangle at a line end. */
		.separator {
			display: none;
		}
		.actions {
			width: 100%;
			margin-left: 0;
			justify-content: flex-end;
		}
	}
</style>
