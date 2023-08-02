<script lang="ts">
	import type { SelectData } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";

	export let value: {
		label?: string;
		confidences?: { label: string; confidence: number }[];
	};

	const dispatch = createEventDispatcher<{ select: SelectData }>();

	export let color: string | undefined = undefined;
	export let selectable = false;
</script>

<div class="container">
	<div
		class="output-class"
		data-testid="label-output-value"
		class:no-confidence={!("confidences" in value)}
		style:background-color={color || "transparent"}
	>
		{value.label}
	</div>

	<!-- TODO: fix -->
	<!-- svelte-ignore a11y-click-events-have-key-events-->
	<!-- svelte-ignore a11y-no-static-element-interactions-->
	{#if typeof value === "object" && value.confidences}
		{#each value.confidences as confidence_set, i}
			<div
				class="confidence-set group"
				data-testid={`${confidence_set.label}-confidence-set`}
				class:selectable
				on:click={() => {
					dispatch("select", { index: i, value: confidence_set.label });
				}}
			>
				<div class="inner-wrap">
					<div class="bar" style="width: {confidence_set.confidence * 100}%" />
					<div class="label">
						<div class="text">{confidence_set.label}</div>
						{#if value.confidences}
							<div class="line" />
							<div class="confidence">
								{Math.round(confidence_set.confidence * 100)}%
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.container {
		padding: var(--block-padding);
	}
	.output-class {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--size-6) var(--size-4);
		color: var(--body-text-color);
		font-weight: var(--weight-bold);
		font-size: var(--text-xxl);
	}

	.confidence-set {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: var(--size-2);
		color: var(--body-text-color);
		line-height: var(--line-none);
		font-family: var(--font-mono);
	}

	.confidence-set:last-child {
		margin-bottom: 0;
	}

	.inner-wrap {
		flex: 1 1 0%;
	}

	.bar {
		margin-bottom: var(--size-1);
		border-radius: var(--radius-md);
		background: var(--stat-background-fill);
		height: var(--size-1);
	}

	.label {
		display: flex;
		align-items: baseline;
	}

	.label > * + * {
		margin-left: var(--size-2);
	}

	.confidence-set:hover .label {
		color: var(--color-accent);
	}

	.text {
		line-height: var(--line-md);
	}

	.line {
		flex: 1 1 0%;
		border: 1px dashed var(--border-color-primary);
		padding-right: var(--size-4);
		padding-left: var(--size-4);
	}

	.confidence {
		margin-left: auto;
		text-align: right;
	}
	.selectable {
		cursor: pointer;
	}
</style>
