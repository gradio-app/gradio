<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";

	interface Props extends HTMLImgAttributes {
		"data-testid"?: string;
	}

	let { src, restProps }: { src: string; restProps: HTMLImgAttributes } =
		$props();
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img {src} {...restProps} on:load />

<style>
	img {
		object-fit: cover;
	}
</style>
