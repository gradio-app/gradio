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

	const without_class = ({
		class: _class,
		...props
	}: Record<string, any>): Record<string, any> => props;

	let rest_img_props = $derived(without_class(restProps));
	let direct_img_props = $derived(without_class(imgProps));
	let classes = $derived(
		[class_names.join(" "), restProps.class, imgProps.class]
			.filter(Boolean)
			.join(" ")
	);
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img
	{src}
	class={classes}
	data-testid={data_testid}
	{...rest_img_props}
	{...direct_img_props}
	{onload}
/>

<style>
	img {
		object-fit: cover;
	}
</style>
