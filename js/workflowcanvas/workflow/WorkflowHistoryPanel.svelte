<script lang="ts">
	import { onMount } from "svelte";

	interface HistoryInput {
		value: any;
		type: string;
		label: string;
	}

	interface HistoryOutput {
		value: any;
		type: string;
		label: string;
	}

	interface HistoryRecord {
		id: string;
		timestamp: string;
		subgraph: string;
		subject_ids: string[];
		inputs: Record<string, HistoryInput>;
		outputs: Record<string, HistoryOutput>;
		user: string | null;
	}

	let {
		server = {},
		onload = undefined,
		onclose,
		onchange = undefined
	}: {
		server?: Record<string, any>;
		onload?: (inputs: Record<string, HistoryInput>) => void;
		onclose: () => void;
		onchange?: () => void;
	} = $props();

	let records = $state<HistoryRecord[]>([]);
	let repoId = $state<string | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let selectedSubgraph = $state<string | null>(null);

	const MEDIA_TYPES = new Set(["image", "audio", "video"]);

	const subgraphs = $derived(
		[...new Set(records.map((r) => r.subgraph))].sort()
	);

	const filtered = $derived(
		selectedSubgraph
			? records.filter((r) => r.subgraph === selectedSubgraph)
			: records
	);

	function formatRelativeTime(iso: string): string {
		try {
			const diff = Date.now() - new Date(iso).getTime();
			const secs = Math.floor(diff / 1000);
			if (secs < 60) return "just now";
			const mins = Math.floor(secs / 60);
			if (mins < 60) return `${mins}m ago`;
			const hrs = Math.floor(mins / 60);
			if (hrs < 24) return `${hrs}h ago`;
			const days = Math.floor(hrs / 24);
			return `${days}d ago`;
		} catch {
			return iso.slice(0, 10);
		}
	}

	function primaryOutput(record: HistoryRecord): HistoryOutput | null {
		const vals = Object.values(record.outputs);
		return vals[0] ?? null;
	}

	function inputSummary(record: HistoryRecord): string {
		return Object.values(record.inputs)
			.filter((i) => i.type === "text" && typeof i.value === "string")
			.map((i) => i.value as string)
			.join(" / ")
			.slice(0, 80);
	}

	function handleLoad(record: HistoryRecord): void {
		if (onload) onload(record.inputs);
	}

	onMount(async () => {
		try {
			if (!server?.list_history) {
				error = "History not available";
				return;
			}
			const raw = await server.list_history([null, 50]);
			const data = typeof raw === "string" ? JSON.parse(raw) : raw;
			records = (data.records as HistoryRecord[]) ?? [];
			repoId = data.repo_id ?? null;
		} catch (e: any) {
			error = e?.message ?? "Failed to load history";
		} finally {
			loading = false;
		}
	});
</script>

<div class="history-overlay" role="dialog" aria-label="Generation history">
	<div class="history-panel">
		<div class="history-header">
			<div class="history-title-row">
				<span class="history-title">Generation History</span>
				{#if repoId}
					<div class="history-repo-row">
						<a
							class="history-repo-link"
							href="https://huggingface.co/datasets/{repoId}"
							target="_blank"
							rel="noopener noreferrer"
							title="View dataset on Hugging Face"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
								/>
							</svg>
							{repoId}
						</a>
						{#if onchange}
							<button class="history-change-btn" onclick={onchange} title="Switch dataset repo">
								Change
							</button>
						{/if}
					</div>
				{/if}
			</div>
			<button class="history-close" onclick={onclose} aria-label="Close history">
				&#x2715;
			</button>
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
					{#each filtered as record (record.id)}
						{@const out = primaryOutput(record)}
						<div class="history-card">
							<div class="card-preview">
								{#if out && MEDIA_TYPES.has(out.type) && typeof out.value === "string"}
									{#if out.type === "image"}
										<img
											class="preview-img"
											src={out.value}
											alt={out.label}
											loading="lazy"
										/>
									{:else if out.type === "audio"}
										<div class="preview-icon">audio</div>
									{:else}
										<div class="preview-icon">video</div>
									{/if}
								{:else if out}
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
								<div class="card-subgraph">{record.subgraph}</div>
								<div class="card-time">{formatRelativeTime(record.timestamp)}</div>
								{#if record.user}
									<div class="card-user">{record.user}</div>
								{/if}
							</div>

							{@const summary = inputSummary(record)}
							{#if summary}
								<div class="card-inputs">{summary}</div>
							{/if}

							{#if onload}
								<button
									class="card-load-btn"
									onclick={() => handleLoad(record)}
									title="Load these inputs back into the canvas"
								>
									Load inputs
								</button>
							{/if}
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
		min-height: 120px;
		max-height: 220px;
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
		font-size: 32px;
		opacity: 0.4;
	}

	.preview-text {
		padding: 12px;
		font-size: 12px;
		color: #9a9caa;
		font-family: monospace;
		white-space: pre-wrap;
		word-break: break-word;
		max-height: 120px;
		overflow: hidden;
	}

	:global(body:not(.dark)) .preview-text {
		color: #6b7280;
	}

	.card-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 10px 4px;
	}

	.card-subgraph {
		font-size: 11px;
		font-weight: 600;
		color: #ff7a38;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.card-time {
		font-size: 10px;
		color: #7c7f99;
		flex-shrink: 0;
	}

	.card-user {
		font-size: 10px;
		color: #7c7f99;
		flex-shrink: 0;
	}

	.card-inputs {
		padding: 0 10px 6px;
		font-size: 11px;
		color: #7c7f99;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(body:not(.dark)) .card-inputs {
		color: #9ca3af;
	}

	.card-load-btn {
		display: block;
		width: calc(100% - 20px);
		margin: 0 10px 10px;
		background: #22232f;
		border: 1px solid #3a3b4a;
		color: #9a9caa;
		font-size: 11px;
		padding: 5px 0;
		border-radius: 5px;
		cursor: pointer;
		text-align: center;
	}

	.card-load-btn:hover {
		background: #ff7a38;
		border-color: #ff7a38;
		color: #fff;
	}

	:global(body:not(.dark)) .card-load-btn {
		background: #f3f4f6;
		border: 1px solid #e5e7eb;
		color: #6b7280;
	}

	:global(body:not(.dark)) .card-load-btn:hover {
		background: #ff7a38;
		border-color: #ff7a38;
		color: #fff;
	}
</style>
