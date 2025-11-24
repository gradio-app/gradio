<script lang="ts">
	import { format_latency } from "./utils";

	export let p50: number;
	export let p90: number;
	export let p99: number;

	$: max_latency = Math.max(p50, p90, p99);
</script>

<div class="tooltip-chart">
	<div class="tooltip-arrow"></div>
	<div class="chart-bars">
		<div class="chart-bar-container">
			<div class="chart-bar-label">p50</div>
			<div class="chart-bar-wrapper">
				<div
					class="chart-bar"
					style="width: {(p50 / max_latency) * 100}%"
				></div>
			</div>
			<div class="chart-bar-value">{format_latency(p50)}</div>
		</div>
		<div class="chart-bar-container">
			<div class="chart-bar-label">p90</div>
			<div class="chart-bar-wrapper">
				<div
					class="chart-bar"
					style="width: {(p90 / max_latency) * 100}%"
				></div>
			</div>
			<div class="chart-bar-value">{format_latency(p90)}</div>
		</div>
		<div class="chart-bar-container">
			<div class="chart-bar-label">p99</div>
			<div class="chart-bar-wrapper">
				<div
					class="chart-bar"
					style="width: {(p99 / max_latency) * 100}%"
				></div>
			</div>
			<div class="chart-bar-value">{format_latency(p99)}</div>
		</div>
	</div>
</div>

<style>
	.tooltip-chart {
		background: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		padding: var(--size-3);
		box-shadow: var(--shadow-drop-lg);
		min-width: 200px;
		position: relative;
	}

	.tooltip-arrow {
		position: absolute;
		bottom: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 8px solid transparent;
		border-right: 8px solid transparent;
		border-top: 8px solid var(--border-color-primary);
	}

	.tooltip-arrow::after {
		content: "";
		position: absolute;
		bottom: 1px;
		left: 50%;
		transform: translateX(-50%);
		width: 0;
		height: 0;
		border-left: 7px solid transparent;
		border-right: 7px solid transparent;
		border-top: 7px solid var(--background-fill-primary);
	}

	.chart-bars {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
	}

	.chart-bar-container {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.chart-bar-label {
		font-size: var(--text-sm);
		font-weight: var(--weight-semibold);
		color: var(--body-text-color);
		min-width: 30px;
	}

	.chart-bar-wrapper {
		flex: 1;
		height: 16px;
		background: var(--background-fill-secondary);
		border-radius: var(--radius-sm);
		overflow: hidden;
		position: relative;
	}

	.chart-bar {
		height: 100%;
		background: var(--color-accent);
		border-radius: var(--radius-sm);
		transition: width 0.3s ease;
	}

	.chart-bar-value {
		font-size: var(--text-sm);
		color: var(--body-text-color);
		min-width: 50px;
		text-align: right;
		font-family: var(--font-mono);
	}
</style>
