<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";

	interface Props extends HTMLImgAttributes {
		"data-testid"?: string;
	}

	let {
		src,
		restProps,
		data_testid
	}: { src: string; restProps: HTMLImgAttributes; data_testid: string } =
		$props();
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img {src} data-testid={data_testid} {...restProps} on:load />

<style>
	img {
		object-fit: cover;
	}
</style>
