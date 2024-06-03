<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { Gradio } from "@gradio/utils";

	export let equal_height = true;
	export let elem_id: string;
	export let elem_classes: string[] = [];
	export let visible = true;
	export let variant: "default" | "panel" | "compact" = "default";
	export let loading_status: LoadingStatus | undefined = undefined;
	export let gradio: Gradio | undefined = undefined;
	export let show_progress = false;
</script>

<div
	class:compact={variant === "compact"}
	class:panel={variant === "panel"}
	class:unequal-height={equal_height === false}
	class:stretch={equal_height}
	class:hide={!visible}
	id={elem_id}
	class={elem_classes.join(" ")}
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
		flex-wrap: wrap;
		gap: var(--layout-gap);
		width: var(--size-full);
		position: relative;
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
		border-radius: var(--container-radius);
		background: var(--background-fill-secondary);
		padding: var(--size-2);
	}
	.unequal-height {
		align-items: flex-start;
	}

	.stretch {
		align-items: stretch;
	}

	div > :global(*),
	div > :global(.form > *) {
		flex: 1 1 0%;
		flex-wrap: wrap;
		min-width: min(160px, 100%);
	}
</style>
