<script lang="ts">
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	let props = $props();
	let el;

	let scale: number | null = $derived(props.scale ?? null);
	let min_width: number = $derived(props.min_width ?? 0);
	let elem_id: string = $derived(props.elem_id ?? "");
	let elem_classes: string[] = $derived(props.elem_classes ?? []);
	let visible: boolean | "hidden" = $derived(props.visible ?? true);
	let variant: "default" | "panel" | "compact" = $derived(
		props.variant ?? "default"
	);
	let loading_status: LoadingStatus | undefined = $derived(
		props.loading_status
	);
	let show_progress = $derived(props.show_progress ?? false);
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
