<script lang="ts">
	let {
		src = "",
		restProps = {},
		data_testid,
		class_names = [],
		...imgProps
	}: {
		src?: string;
		restProps?: Record<string, any>;
		data_testid?: string;
		class_names?: string[];
		[key: string]: any;
	} = $props();
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img
	{src}
	class={class_names.join(" ")}
	data-testid={data_testid}
	{...restProps}
	{...imgProps}
	on:load
/>

<style>
	img {
		object-fit: cover;
	}
</style>
