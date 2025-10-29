<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";
    import type { LoadingStatus } from "@gradio/statustracker";

	let props = $props();
	let el;

    let scale: number | null = $state(props.scale || null);
	let min_width = $state(props.min_width || 0);
	let elem_id = $state(props.elem_id || "");
	let elem_classes: string[] = $state(props.elem_classes || []);
	let visible: boolean | "hidden" = $state(props.visible || true);
	let variant: "default" | "panel" | "compact" = $state(props.variant || "default");
	let loading_status: LoadingStatus | undefined = $state(props.loading_status || undefined);
	let show_progress = $state(props.show_progress || false);
</script>

<div
	bind:this={el}
	id={elem_id}
	class="column {elem_classes.join(' ')}"
	class:compact={variant === "compact"}
	class:panel={variant === "panel"}
	class:hide={!visible}
	style:flex-grow={scale}
	style:min-width="calc(min({min_width}px, 100%))"
>
	{#if loading_status && loading_status.show_progress}
		<StatusTracker
			autoscroll={props.autoscroll}
			i18n={props.i18n}
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
