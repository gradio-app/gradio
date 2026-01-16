<script lang="ts">
	let {
		visible,
		scale,
		min_width,
		label = undefined
	}: {
		visible: boolean | "hidden";
		scale: number | null;
		min_width: number;
		label?: string;
	} = $props();
</script>

<div
	class="form"
	class:hidden={visible === false}
	class:hidden-css={visible === "hidden"}
	style:flex-grow={scale}
	style:min-width={`calc(min(${min_width}px, 100%))`}
	role={label ? "group" : undefined}
	aria-label={label}
>
	<slot />
</div>

<style>
	div {
		display: flex;
		flex-direction: inherit;
		flex-wrap: wrap;
		gap: var(--form-gap-width);
		box-shadow: var(--block-shadow);
		border: var(--block-border-width) solid var(--block-border-color);
		border-radius: var(--block-radius);
		background: var(--border-color-primary);
		overflow-y: hidden;
	}

	div :global(.block) {
		box-shadow: none !important;
		border-width: 0px !important;
		border-radius: 0px !important;
	}

	.hidden {
		display: none;
	}

	.hidden-css {
		display: none !important;
	}
</style>
