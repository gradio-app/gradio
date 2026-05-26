<script lang="ts">
	import { SPACE_CATEGORIES } from "./node-library";
	import type { NodeTemplate } from "./node-library";

	interface TrendingSpace {
		id: string;
		title: string;
		description: string;
		likes: number;
		running: boolean;
		category: string | null;
	}

	interface Template {
		name: string;
		desc: string;
		build: () => any;
	}

	interface Props {
		templates: Template[];
		trendingSpaces: TrendingSpace[];
		trendingLoading: boolean;
		onloadtemplate: (t: Template) => void;
		onadd: (t: NodeTemplate) => void;
	}

	let { templates, trendingSpaces, trendingLoading, onloadtemplate, onadd }: Props = $props();

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
</script>

<div class="empty-state">
	<div class="empty-title">Start building</div>
	<div class="empty-hint">
		Drag components from the sidebar, or try a template
	</div>
	<div class="template-grid">
		{#each templates as t}
			<button class="template-card" onclick={() => onloadtemplate(t)}>
				<span class="template-name">{t.name}</span>
				<span class="template-desc">{t.desc}</span>
			</button>
		{/each}
	</div>

	<div class="trending-section">
		<div class="trending-header">Trending Spaces</div>
		{#if trendingLoading}
			<div class="trending-loading-row">
				<span class="trending-spinner"></span>
				<span class="trending-loading-text">Loading...</span>
			</div>
		{:else if trendingSpaces.length > 0}
			{#each SPACE_CATEGORIES as cat}
				{@const spaces = trendingSpaces.filter(s => s.category === cat.key)}
				{#if spaces.length > 0}
					<div class="trending-cat-label">{cat.label}</div>
					<div class="trending-grid">
						{#each spaces.slice(0, 4) as space}
							<button
								class="trending-card"
								onclick={() => onadd(trendingToTemplate(space))}
							>
								<div class="trending-card-top">
									<span class="trending-dot" class:trending-dot-running={space.running}></span>
									<span class="trending-card-title">{space.title}</span>
									<span class="trending-card-likes">&hearts; {space.likes}</span>
								</div>
								{#if space.description}
									<div class="trending-card-desc">{space.description}</div>
								{/if}
								<div class="trending-card-id">{space.id}</div>
							</button>
						{/each}
					</div>
				{/if}
			{/each}
		{/if}
	</div>
</div>

<style>
	.empty-state {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		overflow-y: auto;
		padding: 40px 80px;
	}

	.empty-title {
		font-size: 16px;
		font-weight: 700;
		color: #3e3f4d;
		margin-bottom: 6px;
	}

	.empty-hint {
		font-size: 12px;
		color: #5c5e6a;
		margin-bottom: 20px;
	}

	.template-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		width: 100%;
		max-width: 900px;
	}

	.template-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 4px;
		padding: 10px 14px;
		border: 1px solid #1e1f2a;
		border-radius: 8px;
		background: #101118;
		cursor: pointer;
		text-align: left;
		white-space: nowrap;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.template-card:hover {
		border-color: #f97316;
		background: #16171f;
	}

	.template-name {
		font-size: 12px;
		font-weight: 700;
		color: #c8c9d2;
	}

	.template-desc {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #5c5e6a;
		line-height: 1.4;
	}

	.trending-section {
		margin-top: 28px;
		text-align: left;
		width: 100%;
		max-width: 900px;
	}

	.trending-header {
		font-size: 13px;
		font-weight: 700;
		color: #3e3f4d;
		margin-bottom: 12px;
		text-align: center;
	}

	.trending-cat-label {
		font-size: 10px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: #5c5e6a;
		margin: 12px 0 6px;
	}

	.trending-cat-label:first-of-type {
		margin-top: 0;
	}

	.trending-grid {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		gap: 6px;
	}

	.trending-card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
		padding: 10px 12px;
		border: 1px solid #1e1f2a;
		border-radius: 8px;
		background: #101118;
		cursor: pointer;
		text-align: left;
		transition: border-color 0.15s, background 0.15s;
	}

	.trending-card:hover {
		border-color: #3e3f4d;
		background: #16171f;
	}

	.trending-card-top {
		display: flex;
		align-items: center;
		gap: 6px;
		width: 100%;
	}

	.trending-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #5c5e6a;
		flex-shrink: 0;
	}

	.trending-dot-running {
		background: #34d399;
		box-shadow: 0 0 4px #34d39960;
	}

	.trending-card-title {
		font-size: 11.5px;
		font-weight: 600;
		color: #c8c9d2;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.trending-card-likes {
		font-family: "JetBrains Mono", monospace;
		font-size: 9px;
		color: #5c5e6a;
		flex-shrink: 0;
	}

	.trending-card-desc {
		font-size: 10px;
		color: #5c5e6a;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;
		line-height: 1.3;
	}

	.trending-card-id {
		font-family: "JetBrains Mono", monospace;
		font-size: 8.5px;
		color: #3e3f4d;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		width: 100%;
	}

	.trending-loading-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 12px;
	}

	.trending-spinner {
		width: 12px;
		height: 12px;
		border: 2px solid transparent;
		border-top-color: #f5a623;
		border-radius: 50%;
		animation: trending-spin 0.7s linear infinite;
	}

	@keyframes trending-spin {
		to { transform: rotate(360deg); }
	}

	.trending-loading-text {
		font-family: "JetBrains Mono", monospace;
		font-size: 10px;
		color: #5c5e6a;
	}
</style>
