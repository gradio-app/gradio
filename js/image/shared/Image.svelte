<script lang="ts">
	let {
		src,
		restProps,
		data_testid,
		class_names
	}: {
		src: string;
		restProps: object;
		data_testid: string;
		class_names: string[];
	} = $props();
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img
	{src}
	class={class_names.join(" ")}
	data-testid={data_testid}
	{...restProps}
	on:load
/>

<style>
	img {
		object-fit: cover;
	}
</style>
