<script lang="ts">
	export let value: {
		label: string;
		confidences?: Array<{ label: string; confidence: number }>;
	};

	export let show_label: boolean = true;
	export let color: string | undefined = undefined;
</script>

<div>
	<div
		class:sr-only={!show_label}
		class="output-class"
		class:no-confidence={!("confidences" in value)}
		style:background-color={color || "transparent"}
	>
		{value.label}
	</div>
	{#if typeof value === "object" && value.confidences}
		{#each value.confidences as confidence_set}
			<div class="confidence-set group">
				<div class="inner-wrap ">
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
	.output-class {
		font-weight: var(--weight-bold);
		font-size: var(--scale-3);
		padding: var(--size-6) var(--size-4);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-text-body);
	}

	.confidence-set {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		font-family: var(--font-mono);
		font-size: var(--scale-00);
		line-height: var(--line-none);
		margin-bottom: var(--size-2);
		color: var(--color-text-body);
	}

	.confidence-set:last-child {
		margin-bottom: 0;
	}

	.inner-wrap {
		flex: 1 1 0%;
	}

	.bar {
		height: var(--size-1);
		margin-bottom: var(--size-1);
		border-radius: var(--radius-md);
		background: linear-gradient(
			to right,
			var(--label-gradient-from),
			var(--label-gradient-to)
		);
	}

	.confidence-set:hover .bar {
		background: linear-gradient(
			to right,
			var(--color-orange-500),
			var(--label-gradient-to)
		);
	}
	.label {
		display: flex;
		align-items: baseline;
	}

	.label > * + * {
		margin-left: var(--size-2);
	}

	.confidence-set:hover .label {
		color: var(--color-orange-500);
	}

	.text {
		line-height: var(--line-md);
	}

	.line {
		flex: 1 1 0%;
		border: 1px dashed var(--color-border-primary);
		padding-left: var(--size-4);
		padding-right: var(--size-4);
	}

	.confidence {
		text-align: right;
		margin-left: auto;
	}
</style>
