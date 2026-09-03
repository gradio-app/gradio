<script lang="ts">
	import { onMount, untrack } from "svelte";
	import {
		asset_url,
		list_bucket_records,
		type HistoryRecord
	} from "@gradio/client";
	import HfAuthControl from "./HfAuthControl.svelte";

	/** Needing to sign in is the next step, not a failure, so it is rendered as
	 * an invitation. Red is reserved for something that actually broke. */
	type PanelError = { kind: "auth" | "failure"; message: string };

	interface HistoryValue {
		value: any;
		type: string;
		label: string;
		port_id?: string;
	}

	let {
		root,
		bucketId,
		auth,
		onSpace = false,
		recordedRun = null,
		isLoadable,
		onsignin,
		onload,
		onclose,
		onchange
	}: {
		root: string;
		bucketId: string;
		auth: any;
		onSpace?: boolean;
		recordedRun?: HistoryRecord | null;
		isLoadable?: (record: HistoryRecord) => boolean;
		onsignin?: () => void;
		onload: (record: {
			record_id: string;
			endpoint: string;
			inputs: Record<string, HistoryValue>;
			outputs: Record<string, HistoryValue>;
		}) => void;
		onclose: () => void;
		onchange: () => void;
	} = $props();

	let records = $state<HistoryRecord[]>([]);
	let loading = $state(true);
	let refreshing = $state(false);
	let error = $state<PanelError | null>(null);
	let selectedEndpoint = $state<string | null>(null);

	const MEDIA_TYPES = new Set(["image", "audio", "video"]);

	// Runs are filed under the API endpoint they ran, the same way the browser-
	// local history groups them, so the chips are the app's endpoints.
	const endpoints = $derived(
		[...new Set(records.map((r) => r.endpoint).filter(Boolean))].sort()
	);

	const filtered = $derived(
		selectedEndpoint
			? records.filter((r) => r.endpoint === selectedEndpoint)
			: records
	);

	function formatRelativeTime(iso: string | undefined): string {
		if (!iso) return "";
		const ts = new Date(iso).getTime();
		if (Number.isNaN(ts)) return iso.slice(0, 10);
		const secs = Math.floor((Date.now() - ts) / 1000);
		if (secs < 60) return "just now";
		const mins = Math.floor(secs / 60);
		if (mins < 60) return `${mins}m ago`;
		const hrs = Math.floor(mins / 60);
		if (hrs < 24) return `${hrs}h ago`;
		return `${Math.floor(hrs / 24)}d ago`;
	}

	function values_of(side: unknown): HistoryValue[] {
		return side && typeof side === "object"
			? (Object.values(side as Record<string, HistoryValue>) as HistoryValue[])
			: [];
	}

	function primaryOutput(record: HistoryRecord): HistoryValue | null {
		return values_of(record.outputs)[0] ?? null;
	}

	function resolveMediaSrc(
		record: HistoryRecord,
		out: HistoryValue | null
	): string | null {
		if (!out) return null;
		const marker = asset_marker(out.value);
		if (marker) {
			return asset_url(
				root,
				bucketId,
				record.endpoint,
				record.record_id,
				marker
			);
		}
		return typeof out.value === "string" ? out.value : null;
	}

	function asset_marker(v: unknown): string | null {
		if (
			v &&
			typeof v === "object" &&
			typeof (v as any).__asset__ === "string"
		) {
			return (v as any).__asset__;
		}
		return null;
	}

	function inputSummary(record: HistoryRecord): string {
		return values_of(record.inputs)
			.filter((i) => i?.type === "text" && typeof i.value === "string")
			.map((i) => i.value as string)
			.join(" / ")
			.slice(0, 80);
	}

	function handleLoad(record: HistoryRecord): void {
		onload({
			record_id: record.record_id,
			endpoint: record.endpoint,
			inputs: (record.inputs ?? {}) as Record<string, HistoryValue>,
			outputs: (record.outputs ?? {}) as Record<string, HistoryValue>
		});
	}

	async function fetchRecords(): Promise<void> {
		// The bucket is named on the request; the server keeps no binding, so
		// there is nothing to re-assert and no way for another tab to have
		// pointed this read somewhere else.
		const result = await list_bucket_records(root, bucketId);
		if (result.ok) {
			records = result.data;
			error = null;
			return;
		}
		error =
			result.status === 401
				? { kind: "auth", message: "" }
				: {
						kind: "failure",
						message: result.detail ?? `Couldn't reach ${bucketId}.`
					};
	}

	async function refresh() {
		refreshing = true;
		try {
			await fetchRecords();
		} catch (e: any) {
			error = { kind: "failure", message: e?.message ?? "Couldn't load runs." };
		} finally {
			refreshing = false;
		}
	}

	onMount(async () => {
		await refresh();
		loading = false;
	});

	let handled_record = "";
	$effect(() => {
		const incoming = recordedRun;
		untrack(() => {
			if (!incoming || incoming.record_id === handled_record) return;
			handled_record = incoming.record_id;
			if (records.some((r) => r.record_id === incoming.record_id)) return;
			records = [incoming, ...records];
			error = null;
		});
	});

	// Signing in from the panel should show the runs, not leave the reader on
	// the prompt they just satisfied.
	let handled_token = "";
	$effect(() => {
		const token = auth?.token ?? "";
		untrack(() => {
			if (!token || token === handled_token) return;
			handled_token = token;
			if (error?.kind === "auth") void refresh();
		});
	});
</script>

<div class="history-overlay" role="dialog" aria-label="History">
	<div class="history-panel">
		<div class="history-header">
			<div class="history-title-row">
				<span class="history-title">History</span>
				{#if bucketId}
					<div class="history-repo-row">
						<a
							class="history-repo-link"
							href="https://huggingface.co/buckets/{bucketId}"
							target="_blank"
							rel="noopener noreferrer"
							title="View bucket on Hugging Face"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path
									d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
								/>
							</svg>
							{bucketId}
						</a>
						<button
							class="history-change-btn"
							onclick={onchange}
							title="Switch bucket"
						>
							Change
						</button>
					</div>
				{/if}
			</div>
			<div class="history-header-actions">
				<button
					class="history-refresh"
					onclick={refresh}
					disabled={refreshing}
					aria-label="Refresh history"
					title="Refresh"
				>
					{#if refreshing}
						…
					{:else}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
							<path d="M21 3v5h-5" />
							<path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
							<path d="M8 16H3v5" />
						</svg>
					{/if}
				</button>
				<button
					class="history-close"
					onclick={onclose}
					aria-label="Close history"
				>
					&#x2715;
				</button>
			</div>
		</div>

		{#if endpoints.length > 1}
			<div class="history-filters">
				<button
					class="filter-chip"
					class:active={selectedEndpoint === null}
					onclick={() => (selectedEndpoint = null)}>All</button
				>
				{#each endpoints as ep}
					<button
						class="filter-chip"
						class:active={selectedEndpoint === ep}
						onclick={() => (selectedEndpoint = ep)}>{ep}</button
					>
				{/each}
			</div>
		{/if}

		<div class="history-body">
			{#if loading}
				<div class="history-empty">Loading…</div>
			{:else if error?.kind === "auth"}
				<div class="history-cta">
					<div class="history-cta-title">Sign in to see your runs</div>
					<p class="history-cta-sub">
						Runs are saved to <code>{bucketId}</code>.
					</p>
					<div class="history-cta-action">
						<HfAuthControl {auth} {onSpace} {onsignin} variant="panel" />
					</div>
				</div>
			{:else if error?.kind === "failure"}
				<div class="history-notice" role="alert">
					<p class="history-notice-body">{error.message}</p>
					<button class="history-retry" onclick={refresh} disabled={refreshing}>
						{refreshing ? "Trying…" : "Try again"}
					</button>
				</div>
			{:else if filtered.length === 0}
				<div class="history-empty">
					No generations yet. Run the workflow to start building history.
				</div>
			{:else}
				<div class="history-grid">
					{#each filtered as record (record.record_id)}
						{@const out = primaryOutput(record)}
						{@const summary = inputSummary(record)}
						{@const media_src = resolveMediaSrc(record, out)}
						<div class="history-card">
							<div class="card-preview">
								{#if out && MEDIA_TYPES.has(out.type) && media_src}
									{#if out.type === "image"}
										<img
											class="preview-img"
											src={media_src}
											alt={out.label}
											loading="lazy"
										/>
									{:else if out.type === "audio"}
										<div class="preview-icon">audio</div>
									{:else}
										<div class="preview-icon">video</div>
									{/if}
								{:else if out && out.value !== null && out.value !== undefined}
									<div class="preview-text">
										{typeof out.value === "string"
											? out.value.slice(0, 120)
											: JSON.stringify(out.value).slice(0, 80)}
									</div>
								{:else}
									<div class="preview-icon">-</div>
								{/if}
							</div>

							<div class="card-meta">
								<div class="card-time">
									{formatRelativeTime(record.started_at)}
								</div>
								{#if summary}
									<div class="card-inputs">{summary}</div>
								{/if}
								{#if !isLoadable || isLoadable(record)}
									<button
										class="card-load-btn"
										onclick={() => handleLoad(record)}
										title="Load inputs and outputs back into the canvas"
									>
										Load
									</button>
								{:else}
									<span
										class="card-stale"
										title="This run's nodes are no longer in the workflow"
									>
										Different workflow
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.history-overlay {
		position: fixed;
		inset: 0;
		z-index: 300;
		display: flex;
		align-items: stretch;
		justify-content: flex-end;
		pointer-events: none;
	}

	.history-panel {
		pointer-events: all;
		width: 380px;
		max-width: 95vw;
		background: #16171f;
		border-left: 1px solid #2a2b38;
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
	}

	:global(body:not(.dark)) .history-panel {
		background: #ffffff;
		border-left: 1px solid #e5e7eb;
	}

	.history-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 14px 16px 10px;
		border-bottom: 1px solid #2a2b38;
		flex-shrink: 0;
	}

	:global(body:not(.dark)) .history-header {
		border-bottom: 1px solid #e5e7eb;
	}

	.history-title-row {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.history-header-actions {
		display: flex;
		align-items: center;
		gap: 2px;
		flex-shrink: 0;
	}

	.history-title {
		font-size: 13px;
		font-weight: 600;
		color: #e8e9f0;
		letter-spacing: 0.01em;
	}

	:global(body:not(.dark)) .history-title {
		color: #1a1b25;
	}

	.history-repo-row {
		display: flex;
		align-items: center;
		gap: 6px;
	}

	.history-repo-link {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 10px;
		color: #7c7f99;
		text-decoration: none;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.history-repo-link:hover {
		color: #ff7a38;
	}

	.history-change-btn {
		background: none;
		border: none;
		font-size: 10px;
		color: #4a4b5a;
		cursor: pointer;
		padding: 0;
		flex-shrink: 0;
		text-decoration: underline;
	}

	.history-change-btn:hover {
		color: #ff7a38;
	}

	.history-refresh {
		background: none;
		border: none;
		color: #7c7f99;
		font-size: 14px;
		cursor: pointer;
		padding: 4px;
		line-height: 1;
		border-radius: 4px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.history-refresh:hover:not(:disabled) {
		background: #2a2b38;
		color: #e8e9f0;
	}

	.history-refresh:disabled {
		opacity: 0.4;
		cursor: default;
	}

	:global(body:not(.dark)) .history-refresh:hover:not(:disabled) {
		background: #f3f4f6;
		color: #1a1b25;
	}

	.history-close {
		background: none;
		border: none;
		color: #7c7f99;
		font-size: 14px;
		cursor: pointer;
		padding: 4px;
		line-height: 1;
		border-radius: 4px;
	}

	.history-close:hover {
		background: #2a2b38;
		color: #e8e9f0;
	}

	:global(body:not(.dark)) .history-close:hover {
		background: #f3f4f6;
		color: #1a1b25;
	}

	.history-filters {
		display: flex;
		gap: 6px;
		padding: 8px 16px;
		flex-wrap: wrap;
		border-bottom: 1px solid #2a2b38;
		flex-shrink: 0;
	}

	:global(body:not(.dark)) .history-filters {
		border-bottom: 1px solid #e5e7eb;
	}

	.filter-chip {
		background: #22232f;
		border: 1px solid #3a3b4a;
		color: #9a9caa;
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 10px;
		cursor: pointer;
	}

	.filter-chip:hover,
	.filter-chip.active {
		background: #ff7a38;
		border-color: #ff7a38;
		color: #fff;
	}

	.history-body {
		flex: 1;
		overflow-y: auto;
		padding: 12px;
	}

	.history-empty {
		color: #7c7f99;
		font-size: 13px;
		text-align: center;
		padding: 48px 16px;
	}

	.history-cta {
		padding: 48px 16px;
		text-align: center;
	}

	.history-cta-title {
		color: #e8e9f0;
		font-size: 13px;
		font-weight: 600;
	}

	.history-cta-sub {
		color: #7c7f99;
		font-size: 12px;
		line-height: 1.5;
		margin: 6px 0 14px;
	}

	.history-cta-sub code {
		font-family: "JetBrains Mono", monospace;
		font-size: 11.5px;
		color: #c8cad8;
		word-break: break-all;
	}

	.history-cta-action {
		display: flex;
		justify-content: center;
	}

	/* Red carries the alarm as a single edge, not as body text, so a genuine
	   failure still reads as one without shouting. */
	.history-notice {
		margin: 32px 12px;
		padding: 12px;
		background: #1e1f2a;
		border: 1px solid #2a2b38;
		border-left: 2px solid #ef4444;
		border-radius: 6px;
		text-align: left;
	}

	.history-notice-body {
		color: #c8cad8;
		font-size: 12px;
		line-height: 1.5;
		margin: 0;
		word-break: break-word;
	}

	.history-retry {
		margin-top: 10px;
		background: #22232f;
		border: 1px solid #3a3b4a;
		border-radius: 6px;
		color: #c8cad8;
		font-size: 12px;
		font-weight: 500;
		padding: 6px 12px;
		cursor: pointer;
	}

	.history-retry:hover:not(:disabled) {
		background: #2a2b38;
		color: #e8e9f0;
	}

	.history-retry:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(body:not(.dark)) .history-cta-title {
		color: #1a1b25;
	}

	:global(body:not(.dark)) .history-cta-sub {
		color: #6b7280;
	}

	:global(body:not(.dark)) .history-cta-sub code {
		color: #374151;
	}

	:global(body:not(.dark)) .history-notice {
		background: #f9fafb;
		border-color: #e5e7eb;
		border-left-color: #ef4444;
	}

	:global(body:not(.dark)) .history-notice-body {
		color: #374151;
	}

	:global(body:not(.dark)) .history-retry {
		background: #f3f4f6;
		border-color: #e5e7eb;
		color: #374151;
	}

	.history-grid {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.history-card {
		background: #1e1f2a;
		border: 1px solid #2a2b38;
		border-radius: 8px;
		overflow: hidden;
	}

	:global(body:not(.dark)) .history-card {
		background: #f9fafb;
		border: 1px solid #e5e7eb;
	}

	.card-preview {
		width: 100%;
		height: 160px;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #13141c;
	}

	:global(body:not(.dark)) .card-preview {
		background: #f3f4f6;
	}

	.preview-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.preview-icon {
		font-size: 24px;
		opacity: 0.3;
	}

	.preview-text {
		padding: 10px 12px;
		font-size: 11px;
		color: #9a9caa;
		line-height: 1.5;
		word-break: break-word;
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 6;
		-webkit-box-orient: vertical;
	}

	:global(body:not(.dark)) .preview-text {
		color: #6b7280;
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border-top: 1px solid #2a2b38;
	}

	:global(body:not(.dark)) .card-meta {
		border-top-color: #e5e7eb;
	}

	.card-time {
		font-size: 10px;
		color: #7c7f99;
		flex: 1;
	}

	.card-inputs {
		font-size: 10px;
		color: #7c7f99;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		max-width: 130px;
	}

	:global(body:not(.dark)) .card-inputs {
		color: #9ca3af;
	}

	.card-stale {
		font-size: 10px;
		padding: 3px 8px;
		color: #5a5c6b;
		font-style: italic;
	}

	:global(body:not(.dark)) .card-stale {
		color: #9ca3af;
	}

	.card-load-btn {
		background: none;
		border: 1px solid #3a3b4a;
		color: #7c7f99;
		font-size: 10px;
		padding: 3px 8px;
		border-radius: 4px;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.card-load-btn:hover {
		border-color: #ff7a38;
		color: #ff7a38;
	}

	:global(body:not(.dark)) .card-load-btn {
		border-color: #e5e7eb;
		color: #6b7280;
	}

	:global(body:not(.dark)) .card-load-btn:hover {
		border-color: #ff7a38;
		color: #ff7a38;
	}
</style>
