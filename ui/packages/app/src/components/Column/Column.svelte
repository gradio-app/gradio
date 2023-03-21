<script lang="ts">
	import { create_classes } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let scale: number = 1;
	export let min_width: number = 0;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let variant: "default" | "panel" | "compact" = "default";
	export let style: Styles = {};
</script>

<div
	id={elem_id}
	class={elem_classes.join(" ")}
	class:gap={style.gap !== false}
	class:compact={variant === "compact"}
	class:panel={variant === "panel"}
	class:hide={!visible}
	style={`min-width: min(${min_width}px, 100%); flex-grow: ${scale}`}
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
