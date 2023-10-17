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
	<h2
		class="output-class"
		data-testid="label-output-value"
		class:no-confidence={!("confidences" in value)}
		style:background-color={color || "transparent"}
	>
		{value.label}
	</h2>

	{#if typeof value === "object" && value.confidences}
		{#each value.confidences as confidence_set, i}
			<button
				class="confidence-set group"
				data-testid={`${confidence_set.label}-confidence-set`}
				class:selectable
				on:click={() => {
					dispatch("select", { index: i, value: confidence_set.label });
				}}
			>
				<div class="inner-wrap">
					<meter
						aria-labelledby="meter-text"
						class="bar"
						min="0"
						max="100"
						style="width: {confidence_set.confidence *
							100}%; background: var(--stat-background-fill);
						"
						value={confidence_set.confidence * 100}
						aria-label={Math.round(confidence_set.confidence * 100) + "%"}
					/>

					<dl class="label">
						<dt id={`meter-text-${confidence_set.label}`} class="text">
							{confidence_set.label}
						</dt>
						{#if value.confidences}
							<div class="line" />
							<dd class="confidence">
								{Math.round(confidence_set.confidence * 100)}%
							</dd>
						{/if}
					</dl>
				</div>
			</button>
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
		width: 100%;
	}

	.confidence-set:last-child {
		margin-bottom: 0;
	}

	.inner-wrap {
		flex: 1 1 0%;
		display: flex;
		flex-direction: column;
	}

	.bar {
		appearance: none;
		align-self: flex-start;
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

	.confidence-set:focus .label {
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
</style>
