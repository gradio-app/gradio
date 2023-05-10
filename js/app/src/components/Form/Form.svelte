<script lang="ts">
	export let visible = true;
</script>

<div class="form" class:hidden={!visible}>
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
		overflow: hidden;
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
