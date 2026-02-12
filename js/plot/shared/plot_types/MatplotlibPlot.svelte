<script lang="ts">
	let { value }: { value: any } = $props();

	let plot = $derived(value?.plot);
</script>

<div data-testid={"matplotlib"} class="matplotlib layout">
	<img src={plot} alt={`${value.chart} plot visualising provided data`} />
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
