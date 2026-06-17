<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";

	let {
		src,
		restProps,
		data_testid,
		class_names,
		onload
	}: {
		src: string;
		restProps?: object;
		data_testid?: string;
		class_names?: string[];
		onload?: HTMLImgAttributes["onload"];
	} = $props();
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img
	{src}
	class={(class_names || []).join(" ")}
	data-testid={data_testid}
	{...restProps}
	{onload}
/>

<style>
	img {
		object-fit: cover;
	}
</style>
