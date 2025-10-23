<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";
	import { Gradio } from "@gradio/utils";

	let props = $props();

	const gradio = new Gradio<{}, { variant: "default" | "panel" | "compact" }>(
		props,
	);

	let el;
</script>

<div
	bind:this={el}
	id={gradio.shared.elem_id}
	class="column {(gradio.shared.elem_classes || []).join(' ')}"
	class:compact={gradio.props.variant === "compact"}
	class:panel={gradio.props.variant === "panel"}
	class:hide={!gradio.shared.visible}
	style:flex-grow={gradio.shared.scale}
	style:min-width="calc(min({gradio.shared.min_width}px, 100%))"
>
	{#if gradio.shared.loading_status && gradio.shared.loading_status.show_progress && gradio}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			status={gradio.shared.loading_status
				? gradio.shared.loading_status.status == "pending"
					? "generating"
					: gradio.shared.loading_status.status
				: null}
		/>
	{/if}
	<slot />
</div>

<style>
	div {
		display: flex;
		position: relative;
		flex-direction: column;
		gap: var(--layout-gap);
	}

	div > :global(*),
	div > :global(.form > *) {
		width: var(--size-full);
	}

	.hide {
		display: none;
	}

	.compact > :global(*),
	.compact :global(.box) {
		border-radius: 0;
	}

	.compact,
	.panel {
		border: solid var(--panel-border-width) var(--panel-border-color);
		border-radius: var(--container-radius);
		background: var(--panel-background-fill);
		padding: var(--spacing-lg);
	}
</style>
