<script lang="ts">
	export let height: number | undefined = undefined;
	export let width: number | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let variant: "solid" | "dashed" | "none" = "solid";
	export let border_mode: "base" | "focus" = "base";
	export let padding = true;
	export let type: "normal" | "fieldset" = "normal";
	export let test_id: string | undefined = undefined;
	export let explicit_call = false;
	export let container = true;
	export let visible = true;
	export let allow_overflow = true;
	export let scale: number | null = null;
	export let min_width = 0;

	let tag = type === "fieldset" ? "fieldset" : "div";
</script>

<svelte:element
	this={tag}
	data-testid={test_id}
	id={elem_id}
	class:hidden={visible === false}
	class="block {elem_classes.join(' ')}"
	class:padded={padding}
	class:border_focus={border_mode === "focus"}
	class:hide-container={!explicit_call && !container}
	style:height={typeof height === "number" ? height + "px" : undefined}
	style:width={typeof width === "number"
		? `calc(min(${width}px, 100%))`
		: undefined}
	style:border-style={variant}
	style:overflow={allow_overflow ? "visible" : "hidden"}
	style:flex-grow={scale}
	style:min-width={`calc(min(${min_width}px, 100%))`}
	style:border-width="var(--block-border-width)"
>
	<slot />
</svelte:element>

<style>
	.block {
		position: relative;
		margin: 0;
		box-shadow: var(--block-shadow);
		border-width: var(--block-border-width);
		border-color: var(--block-border-color);
		border-radius: var(--block-radius);
		background: var(--block-background-fill);
		width: 100%;
		line-height: var(--line-sm);
	}

	.block.border_focus {
		border-color: var(--color-accent);
	}

	.padded {
		padding: var(--block-padding);
	}

	.hidden {
		display: none;
	}
	.hide-container {
		margin: 0;
		box-shadow: none;
		--block-border-width: 0;
		background: transparent;
		padding: 0;
		overflow: visible;
	}
</style>
