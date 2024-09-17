<script lang="ts">
	export let value;

	$: plot = value?.plot;
</script>

<div data-testid={"matplotlib"} class="matplotlib layout">
	<img
		src={plot}
		alt={`${value.chart} plot visualising provided data`}
		on:load
	/>
</div>

<style>
	.layout {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		width: var(--size-full);
		height: var(--size-full);
		color: var(--body-text-color);
	}
	.matplotlib img {
		object-fit: contain;
	}
</style>
