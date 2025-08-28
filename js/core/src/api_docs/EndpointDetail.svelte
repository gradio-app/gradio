<script lang="ts">
	export let api_name: string | null = null;
	export let description: string | null = null;
	export let analytics: Record<string, any>;
	import { format_latency, get_color_from_success_rate } from "./utils";

	const success_rate = api_name ? analytics[api_name]?.success_rate : 0;
	const color = get_color_from_success_rate(success_rate);
</script>

<h3>
	API name:
	<span class="post">{"/" + api_name}</span>
	<span class="desc">{description}</span>
	{#if analytics && api_name && analytics[api_name]}
		<span class="analytics">
			Total requests: {analytics[api_name].total_requests} (<span style={color}>{Math.round(success_rate * 100)}%</span> successful)
			&nbsp;|&nbsp;
			p50/p90/p99:
			{format_latency(analytics[api_name].process_time_percentiles["50th"])}
			/
			{format_latency(analytics[api_name].process_time_percentiles["90th"])}
			/
			{format_latency(analytics[api_name].process_time_percentiles["99th"])}
		</span>
	{/if}
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

	.analytics {
		color: var(--body-text-color-subdued);
		margin-top: var(--size-1);
	}

	.desc {
		color: var(--body-text-color);
		font-size: var(--text-lg);
		margin-top: var(--size-1);
	}
</style>
