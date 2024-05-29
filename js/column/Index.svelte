<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Gradio } from "@gradio/utils";

	export let scale: number | null = null;
	export let gap = true;
	export let min_width = 0;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let variant: "default" | "panel" | "compact" = "default";
	export let loading_status: LoadingStatus | undefined = undefined;
	export let gradio: Gradio | undefined = undefined;
	export let show_progress = false;
</script>

<div
	id={elem_id}
	class={elem_classes.join(" ")}
	class:gap
	class:compact={variant === "compact"}
	class:panel={variant === "panel"}
	class:hide={!visible}
	style:flex-grow={scale}
	style:min-width="calc(min({min_width}px, 100%))"
>
	{#if loading_status && show_progress && gradio}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			status={loading_status
				? loading_status.status == "pending"
					? "generating"
					: loading_status.status
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
	}

	div > :global(*),
	div > :global(.form > *) {
		width: var(--size-full);
	}

	.gap {
		gap: var(--layout-gap);
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
