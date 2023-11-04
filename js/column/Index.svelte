<script lang="ts">
	export let scale: number | null = null;
	export let gap = true;
	export let min_width = 0;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let variant: "default" | "panel" | "compact" = "default";
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
