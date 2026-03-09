<svelte:options accessors={true} />

<script context="module" lang="ts">
</script>

<script lang="ts">
	import DF from "@gradio/dataframe-npm";
</script>

<div class="gradio-dataframe-interim">
	<DF {...$$props} />
</div>

<style>
	:global(.gradio-dataframe-interim .cell-menu[role="menu"]) {
		z-index: var(--layer-3);
	}

	:global(.gradio-dataframe-interim .background) {
		z-index: var(--layer-4);
	}

	:global(.gradio-dataframe-interim .filter-menu) {
		z-index: var(--layer-5);
	}
</style>
