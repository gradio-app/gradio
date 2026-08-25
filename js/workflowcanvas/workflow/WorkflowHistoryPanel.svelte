<script lang="ts">
	import { onMount, untrack } from "svelte";
	import {
		asset_url,
		connect_bucket,
		delete_record_from_bucket,
		list_bucket_records,
		type HistoryRecord
	} from "@gradio/client";

	interface HistoryInput {
		value: any;
		type: string;
		label: string;
		port_id?: string;
	}

	interface HistoryOutput {
		value: any;
		type: string;
		label: string;
	}

	let {
		root,
		bucketId,
		onload = undefined,
		onclose,
		onchange = undefined,
		triggerRefresh = 0
	}: {
		root: string;
		bucketId: string;
		onload?: (record: {
			record_id: string;
			inputs: Record<string, HistoryInput>;
			outputs: Record<string, HistoryOutput>;
		}) => void;
		onclose: () => void;
		onchange?: () => void;
		triggerRefresh?: number;
	} = $props();

	let records = $state<HistoryRecord[]>([]);
	let loading = $state(true);
	let refreshing = $state(false);
	let error = $state<string | null>(null);
	let selectedSubgraph = $state<string | null>(null);
	let pendingDelete = $state<string | null>(null);
	let repoId = $derived(bucketId);

	const MEDIA_TYPES = new Set(["image", "audio", "video"]);

	const subgraphs = $derived(
		[
			...new Set(records.map((r) => r.subgraph).filter((s): s is string => !!s))
		].sort()
	);

	const filtered = $derived(
		selectedSubgraph
			? records.filter((r) => r.subgraph === selectedSubgraph)
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

	function primaryOutput(record: HistoryRecord): HistoryOutput | null {
		const vals = Object.values(record.outputs) as HistoryOutput[];
		return vals[0] ?? null;
	}

	function resolveMediaSrc(
		record: HistoryRecord,
		out: HistoryOutput | null
	): string | null {
		if (!out) return null;
		// Asset marker: {"__asset__": "a001"} → proxied download URL.
		if (
			out.value &&
			typeof out.value === "object" &&
			typeof (out.value as any).__asset__ === "string"
		) {
			return asset_url(root, record.record_id, (out.value as any).__asset__);
		}
		// Nested FileData with __asset__ marker.
		if (
			out.value &&
			typeof out.value === "object" &&
			(out.value as any).value &&
			typeof (out.value as any).value.__asset__ === "string"
		) {
			return asset_url(
				root,
				record.record_id,
				(out.value as any).value.__asset__
			);
		}
		return typeof out.value === "string" ? out.value : null;
	}

	function inputSummary(record: HistoryRecord): string {
		return Object.values(record.inputs)
			.map((i) => i as Partial<HistoryInput>)
			.filter((i) => i.type === "text" && typeof i.value === "string")
			.map((i) => i.value as string)
			.join(" / ")
			.slice(0, 80);
	}

	function handleLoad(record: HistoryRecord): void {
		if (onload)
			onload({
				record_id: record.record_id,
				inputs: record.inputs as Record<string, HistoryInput>,
				outputs: record.outputs as Record<string, HistoryOutput>
			});
	}

	async function fetchRecords() {
		// The server derives the bucket from the session, which this panel cannot
		// inspect and which a restart clears. Re-assert the binding this canvas
		// holds before listing, so a reload doesn't render an empty history.
		if (bucketId) {
			const connected = await connect_bucket(root, bucketId);
			if (!connected.ok) {
				throw new Error(connected.detail ?? `Could not connect to ${bucketId}`);
			}
		}
		const result = await list_bucket_records(root, 50);
		if (!result.ok) {
			throw new Error(
				result.status === 409
					? "This session is no longer connected to a bucket. Reconnect to see your history."
					: (result.detail ?? "Could not load history")
			);
		}
		// Server order is not guaranteed chronological; sort newest first.
		records = result.records
			.slice()
			.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
	}

	async function refresh() {
		refreshing = true;
		error = null;
		try {
			await fetchRecords();
		} catch (e: any) {
			error = e?.message ?? "Failed to refresh";
		} finally {
			refreshing = false;
		}
	}

	onMount(async () => {
		try {
			await fetchRecords();
		} catch (e: any) {
			error = e?.message ?? "Failed to load history";
		} finally {
			loading = false;
		}
	});

	// plain let: only ever read inside untrack, so it must not be a dependency
	let lastRefreshHandled = 0;
	$effect(() => {
		// Track only `triggerRefresh`. Reading `loading` here made the effect
		// re-run when onMount flipped it, double-fetching on every reopen.
		const trigger = triggerRefresh;
		if (trigger > 0 && trigger !== untrack(() => lastRefreshHandled)) {
			lastRefreshHandled = trigger;
			refresh();
		}
	});
</script>

<div class="history-overlay" role="dialog" aria-label="History">
	<div class="history-panel">
		<div class="history-header">
			<div class="history-title-row">
				<span class="history-title">History</span>
				{#if repoId}
					<div class="history-repo-row">
						<a
							class="history-repo-link"
							href="https://huggingface.co/buckets/{repoId}"
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
							{repoId}
						</a>
						{#if onchange}
							<button
								class="history-change-btn"
								onclick={onchange}
								title="Switch bucket"
							>
								Change
							</button>
						{/if}
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

		{#if subgraphs.length > 1}
			<div class="history-filters">
				<button
					class="filter-chip"
					class:active={selectedSubgraph === null}
					onclick={() => (selectedSubgraph = null)}>All</button
				>
				{#each subgraphs as sg}
					<button
						class="filter-chip"
						class:active={selectedSubgraph === sg}
						onclick={() => (selectedSubgraph = sg)}>{sg}</button
					>
				{/each}
			</div>
		{/if}

		<div class="history-body">
			{#if loading}
				<div class="history-empty">Loading...</div>
			{:else if error}
				<div class="history-empty history-error">{error}</div>
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
									{formatRelativeTime(record.created_at)}
								</div>
								{#if summary}
									<div class="card-inputs">{summary}</div>
								{/if}
								{#if onload}
									<button
										class="card-load-btn"
										onclick={() => handleLoad(record)}
										title="Load inputs and outputs back into the canvas"
									>
										Load
									</button>
								{/if}
								{#if pendingDelete === record.record_id}
									<button
										class="card-delete-confirm"
										onclick={() => {
											pendingDelete = null;
											delete_record_from_bucket(root, {
												record_id: record.record_id
											});
											records = records.filter(
												(r) => r.record_id !== record.record_id
											);
										}}>Delete?</button
									>
									<button
										class="card-delete-cancel"
										onclick={() => (pendingDelete = null)}>Cancel</button
									>
								{:else}
									<button
										class="card-delete-btn"
										onclick={() => (pendingDelete = record.record_id)}
										title="Delete this generation"
										aria-label="Delete"
									>
										&#x2715;
									</button>
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

	.history-error {
		color: #ef4444;
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

	.card-delete-btn {
		background: none;
		border: none;
		color: #4a4b5a;
		font-size: 11px;
		cursor: pointer;
		padding: 2px 4px;
		border-radius: 3px;
		line-height: 1;
		flex-shrink: 0;
	}

	.card-delete-btn:hover {
		color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}

	.card-delete-confirm {
		background: #ef4444;
		border: none;
		color: #fff;
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 3px;
		cursor: pointer;
		flex-shrink: 0;
	}

	.card-delete-cancel {
		background: none;
		border: 1px solid #3a3b4a;
		color: #7c7f99;
		font-size: 10px;
		padding: 2px 6px;
		border-radius: 3px;
		cursor: pointer;
		flex-shrink: 0;
	}
</style>
