<script lang="ts">
	export let visible = true;
	export let scale: number | null = null;
	export let min_width = 0;
</script>

<div
	class="form"
	class:hidden={!visible}
	style:flex-grow={scale}
	style:min-width={`calc(min(${min_width}px, 100%))`}
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
		border: var(--block-border-width) solid var(--border-color-primary);
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
</style>
