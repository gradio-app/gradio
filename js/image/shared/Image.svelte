<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";

	let {
		src = "",
		restProps = {},
		data_testid,
		class_names = [],
		onload,
		...imgProps
	}: {
		src?: string;
		restProps?: Record<string, any>;
		data_testid?: string;
		class_names?: string[];
		onload?: HTMLImgAttributes["onload"];
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
	{onload}
/>

<style>
	img {
		object-fit: cover;
	}
</style>
