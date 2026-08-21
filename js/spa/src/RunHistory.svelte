<script lang="ts">
	import { onMount } from "svelte";
	import {
		clear_run_history,
		delete_record_from_bucket,
		delete_run_history,
		get_bucket_sync_config,
		list_bucket_records,
		list_user_buckets,
		merge_runs,
		on_run_history_change,
		push_record_to_bucket,
		read_run_history,
		set_bucket_sync_config,
		stage_run_history_replay,
		type BucketInfo,
		type BucketSyncConfig,
		type RunHistoryScope,
		type StoredRun,
		type StoredRunComponent
	} from "@gradio/client";
	import PageFooter from "@gradio/core/page_footer";
	import { _ } from "svelte-i18n";
	import RunValue from "./RunValue.svelte";
	import { summarize } from "./run_value";

	interface Props {
		root: string;
		scope: RunHistoryScope;
		footer_links?: (string | Record<string, string>)[];
	}

	let { root, scope, footer_links = [] }: Props = $props();

	let app_url = $derived(new URL(root, window.location.href).href);
	let runs: StoredRun[] = $state([]);

	// Optional durable persistence to an HF Hub bucket. Off by default; user
	// opts in via the settings panel below. See gradio/history.py + the
	// /gradio_api/history/* routes for the backend.
	let bucket_config: BucketSyncConfig = $state({
		enabled: false,
		bucket_id: ""
	});
	let bucket_records: StoredRun[] = $state([]);
	let user_buckets: BucketInfo[] = $state([]);
	let bucket_settings_open = $state(false);
	let bucket_draft = $state("");
	// Persisted so remounts + cross-tab storage-event refreshes don't
	// re-push every local run to the bucket on each visit. Keyed by
	// bucket_id so switching buckets starts a fresh dedup set.
	let pushed_ids_key = $derived(
		`gradio:run-history:pushed:v1:${encodeURIComponent(scope?.app_id ?? "")}:${encodeURIComponent(scope?.username ?? "")}:${encodeURIComponent(bucket_config.bucket_id)}`
	);
	function load_pushed_ids(): Set<string> {
		try {
			const raw = window.localStorage.getItem(pushed_ids_key);
			return new Set(raw ? JSON.parse(raw) : []);
		} catch {
			return new Set();
		}
	}
	function persist_pushed_ids(): void {
		try {
			window.localStorage.setItem(
				pushed_ids_key,
				JSON.stringify([...pushed_ids])
			);
		} catch {}
	}
	let pushed_ids = $state<Set<string>>(new Set());
	$effect(() => {
		// Reload whenever the bucket changes.
		void pushed_ids_key;
		pushed_ids = load_pushed_ids();
	});

	let groups = $derived.by(() => {
		const grouped = new Map<string, StoredRun[]>();
		for (const run of runs) {
			const current = grouped.get(run.api_name) || [];
			current.push(run);
			grouped.set(run.api_name, current);
		}
		return Array.from(grouped.entries());
	});

	let sync_error = $state<string | null>(null);

	function refresh(): void {
		const local = read_run_history(scope);
		if (bucket_config.enabled && bucket_config.bucket_id) {
			let touched = false;
			for (const run of local) {
				if (run.status === "running" || pushed_ids.has(run.id)) continue;
				pushed_ids.add(run.id);
				touched = true;
				void push_record_to_bucket(root, bucket_config.bucket_id, run).then(
					(ok) => {
						if (!ok) {
							pushed_ids.delete(run.id);
							persist_pushed_ids();
							sync_error =
								"Some runs failed to sync to the bucket. Check that your OAuth session has the `manage-repos` scope.";
						} else if (sync_error) {
							sync_error = null;
						}
					}
				);
			}
			if (touched) persist_pushed_ids();
			runs = merge_runs(local, bucket_records);
		} else {
			runs = local;
		}
	}

	async function refresh_bucket_records(): Promise<void> {
		if (!bucket_config.enabled || !bucket_config.bucket_id) {
			bucket_records = [];
			return;
		}
		bucket_records = await list_bucket_records(root, bucket_config.bucket_id);
		refresh();
	}

	async function enable_bucket_sync(): Promise<void> {
		const bucket_id = bucket_draft.trim();
		if (!bucket_id) return;
		bucket_config = { enabled: true, bucket_id };
		set_bucket_sync_config(scope, bucket_config);
		bucket_settings_open = false;
		await refresh_bucket_records();
	}

	function disable_bucket_sync(): void {
		bucket_config = { enabled: false, bucket_id: bucket_config.bucket_id };
		set_bucket_sync_config(scope, bucket_config);
		bucket_records = [];
		refresh();
	}

	onMount(() => {
		bucket_config = get_bucket_sync_config(scope);
		bucket_draft = bucket_config.bucket_id;
		void (async () => {
			user_buckets = await list_user_buckets(root);
			if (bucket_config.enabled) {
				bucket_records = await list_bucket_records(
					root,
					bucket_config.bucket_id
				);
			}
			refresh();
		})();
		return on_run_history_change(refresh);
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
		stage_run_history_replay(scope, run);
		const app_url = new URL(root, window.location.href);
		let target = new URL(run.page || app_url.pathname, app_url);
		if (target.origin !== app_url.origin) target = app_url;
		window.location.assign(target);
	}

	function clear_all(): void {
		if (!window.confirm("Clear all saved runs for this app?")) return;
		if (bucket_config.enabled && bucket_config.bucket_id) {
			for (const run of runs) {
				delete_record_from_bucket(root, bucket_config.bucket_id, run);
			}
		}
		bucket_records = [];
		pushed_ids.clear();
		persist_pushed_ids();
		clear_run_history(scope);
		refresh();
	}

	function delete_run(run: StoredRun): void {
		if (!window.confirm("Delete this saved run?")) return;
		if (bucket_config.enabled && bucket_config.bucket_id) {
			delete_record_from_bucket(root, bucket_config.bucket_id, run);
		}
		bucket_records = bucket_records.filter((r) => r.id !== run.id);
		pushed_ids.delete(run.id);
		persist_pushed_ids();
		delete_run_history(scope, run.id);
		refresh();
	}
</script>

<svelte:window onkeydown={close_error} />

<main class="history-page" data-testid="run-history">
	<header class="page-header">
		<div class="title-line">
			<h1>Run history ({runs.length})</h1>
			<div class="storage-copy">
				<span>saved in</span>
				<span>
					<code class="storage-code">Local Storage</code
					>{#if bucket_config.enabled}
						+ <a
							class="bucket-link"
							href="https://huggingface.co/buckets/{bucket_config.bucket_id}"
							target="_blank"
							rel="noopener noreferrer">HF Bucket</a
						>
					{/if}, privately in this browser{#if bucket_config.enabled}
						and mirrored to <code class="storage-code"
							>{bucket_config.bucket_id}</code
						>{/if}.
				</span>
			</div>
		</div>
		<div class="header-actions">
			<button
				class="clear"
				onclick={() => (bucket_settings_open = !bucket_settings_open)}
				aria-expanded={bucket_settings_open}
			>
				{bucket_config.enabled ? "Bucket settings" : "Enable durable sync"}
			</button>
			{#if runs.length}
				<button class="clear" onclick={clear_all}>Clear history</button>
			{/if}
		</div>
	</header>

	{#if sync_error}
		<div class="sync-error" role="alert">
			<span>{sync_error}</span>
			<button
				class="sync-error-dismiss"
				onclick={() => (sync_error = null)}
				aria-label="Dismiss">×</button
			>
		</div>
	{/if}

	{#if bucket_settings_open}
		<section class="bucket-settings">
			<h2>Sync to HF Bucket</h2>
			<p class="bucket-desc">
				Mirror runs from this browser to a private HF Hub bucket so they persist
				across devices. Requires you to be logged in with an HF account that has <code
					>manage-repos</code
				> scope.
			</p>
			<label class="bucket-picker">
				<span>Bucket</span>
				<input
					list="bucket-options"
					placeholder="username/my-run-history"
					bind:value={bucket_draft}
				/>
				{#if user_buckets.length}
					<datalist id="bucket-options">
						{#each user_buckets as bucket}
							<option value={bucket.id}>{bucket.id}</option>
						{/each}
					</datalist>
				{/if}
			</label>
			<div class="bucket-actions">
				<button class="primary" onclick={enable_bucket_sync}
					>{bucket_config.enabled ? "Update" : "Enable sync"}</button
				>
				{#if bucket_config.enabled}
					<button onclick={disable_bucket_sync}>Disable sync</button>
				{/if}
			</div>
		</section>
	{/if}

	{#if groups.length === 0}
		<section class="empty">
			<h2>No runs yet</h2>
			<p>Use the app, then return here to load previous runs.</p>
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
								<button class="load" onclick={() => load(run)}
									><span class="play" aria-hidden="true">▶</span> Load run</button
								>
								<button class="delete" onclick={() => delete_run(run)}
									>Delete</button
								>
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
		width: min(100%, 1080px);
		margin: 0 auto;
		padding: 40px 24px 80px;
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
		gap: 16px;
		padding-bottom: 24px;
		border-bottom: 1px solid var(--border-color-primary, #e4e4e7);
	}
	h1 {
		margin: 0;
		font-size: var(--text-xxl, 26px);
		font-weight: var(--weight-semibold, 600);
		line-height: 1.2;
	}
	.title-line {
		display: flex;
		align-items: baseline;
		gap: 14px;
		white-space: nowrap;
	}
	.storage-copy,
	.empty p {
		margin: 0;
		color: var(--body-text-color-subdued, #71717a);
	}
	.storage-copy {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 5px;
	}
	.storage-code {
		padding: 2px 6px;
		border-radius: var(--radius-sm, 4px);
		background: var(--code-background-fill, #f4f4f5);
		color: var(--body-text-color, #27272a);
		font-family: var(--font-mono, monospace);
		font-size: 0.9em;
		font-weight: 600;
	}
	.clear,
	.delete {
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
	}
	.clear {
		padding: 8px 12px;
	}
	.sync-error {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 8px 0 16px;
		padding: 8px 12px;
		font-size: 13px;
		color: var(--body-text-color, #1f2937);
		background: var(--background-fill-secondary, #fafafa);
		border: 1px solid var(--color-accent, #ea580c);
		border-radius: 6px;
	}
	.sync-error-dismiss {
		margin-left: auto;
		font-size: 18px;
		line-height: 1;
		background: transparent;
		border: 0;
		cursor: pointer;
		color: inherit;
	}
	.header-actions {
		display: flex;
		gap: 8px;
		flex-shrink: 0;
	}
	.bucket-link {
		color: var(--color-accent, #ea580c);
		text-decoration: underline;
	}
	.bucket-settings {
		margin: 16px 0 24px;
		padding: 16px 20px;
		background: var(--background-fill-secondary, #fafafa);
		border: 1px solid var(--border-color-primary, #e5e5e5);
		border-radius: 8px;
	}
	.bucket-settings h2 {
		margin: 0 0 6px;
		font-size: 15px;
		font-weight: 600;
	}
	.bucket-desc {
		margin: 0 0 12px;
		font-size: 13px;
		color: var(--body-text-color-subdued, #71717a);
		line-height: 1.5;
	}
	.bucket-picker {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 12px;
	}
	.bucket-picker span {
		font-size: 13px;
		font-weight: 500;
		min-width: 56px;
	}
	.bucket-picker input {
		flex: 1;
		font-family: var(--font-mono, monospace);
		font-size: 13px;
		padding: 6px 10px;
		border: 1px solid var(--border-color-primary, #e5e5e5);
		border-radius: 6px;
		background: var(--background-fill-primary, #fff);
	}
	.bucket-actions {
		display: flex;
		gap: 8px;
	}
	.bucket-actions button {
		padding: 6px 12px;
		font-size: 13px;
		border-radius: 6px;
		border: 1px solid var(--border-color-primary, #e5e5e5);
		background: var(--background-fill-primary, #fff);
		cursor: pointer;
	}
	.bucket-actions button.primary {
		background: var(--color-accent, #ea580c);
		border-color: var(--color-accent, #ea580c);
		color: #fff;
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
			padding-inline: 16px;
		}
		.page-header,
		.title-line {
			align-items: flex-start;
			flex-direction: column;
		}
		.title-line {
			gap: 6px;
			white-space: normal;
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
	}
</style>
