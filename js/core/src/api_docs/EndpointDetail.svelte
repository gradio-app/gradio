<script lang="ts">
	import type { Payload } from "../types";
	export let api_name: string | null = null;
	export let description: string | null = null;
	export let analytics: Record<string, any>;
	export let last_api_call: Payload | null = null;
	export let dependency_id: number | null = null;
	import { format_latency, get_color_from_success_rate } from "./utils";
	import PercentileChart from "./PercentileChart.svelte";

	const success_rate = api_name ? analytics[api_name]?.success_rate : 0;
	const color = get_color_from_success_rate(success_rate);
	$: is_most_recently_used = last_api_call?.fn_index === dependency_id;
</script>

<h3>
	API name:
	<span class="post">{"/" + api_name}</span>
	<span class="desc">
		{description}
		{#if analytics && api_name && analytics[api_name]}
			{@const endpoint_analytics = analytics[api_name]}
			{@const p50 = endpoint_analytics.process_time_percentiles["50th"]}
			{@const p90 = endpoint_analytics.process_time_percentiles["90th"]}
			{@const p99 = endpoint_analytics.process_time_percentiles["99th"]}
			<span class="analytics-inline">
				<span class="analytics-content">
					<span class="analytics-text-wrapper">
						{endpoint_analytics.total_requests} requests ({Math.round(
							success_rate * 100
						)}% successful, p50: {format_latency(p50)})
					</span>
					<div class="analytics-tooltip">
						<PercentileChart {p50} {p90} {p99} />
					</div>
				</span>
				{#if is_most_recently_used}
					<span class="most-recently-used">Most recently used</span>
				{/if}
			</span>
		{/if}
	</span>
</h3>

<style>
	h3 {
		color: var(--body-text-color);
		font-weight: var(--section-header-text-weight);
		font-size: var(--text-lg);
	}

	.post {
		margin-right: var(--size-2);
		border: 1px solid var(--border-color-accent);
		border-radius: var(--radius-sm);
		background: var(--color-accent-soft);
		padding-right: var(--size-1);
		padding-bottom: var(--size-1);
		padding-left: var(--size-1);
		color: var(--color-accent);
		font-weight: var(--weight-semibold);
	}

	.analytics-inline {
		display: inline-flex;
		align-items: center;
		gap: var(--size-2);
		margin-left: var(--size-2);
		color: var(--body-text-color-subdued);
	}

	.analytics-content {
		position: relative;
		display: inline-block;
	}

	.analytics-text-wrapper {
		cursor: help;
	}

	.analytics-tooltip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: var(--size-2);
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
		z-index: 1000;
	}

	.analytics-content:hover .analytics-tooltip {
		opacity: 1;
		pointer-events: auto;
	}

	.most-recently-used {
		display: inline-block;
		color: #fd7b00;
		background: #fff4e6;
		border: 1px solid #ffd9b3;
		border-radius: var(--radius-sm);
		padding: var(--size-1) var(--size-2);
		font-size: var(--text-sm);
		font-weight: var(--weight-medium);
		white-space: nowrap;
	}

	.desc {
		color: var(--body-text-color);
		font-size: var(--text-lg);
		margin-left: var(--size-2);
	}
</style>
