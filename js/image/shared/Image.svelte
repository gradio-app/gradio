<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";

	interface Props extends HTMLImgAttributes {
		"data-testid"?: string;
	}
	type $$Props = Props;

	export let src: HTMLImgAttributes["src"] = undefined;
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img {src} {...$$restProps} on:load />

<style>
	img {
		object-fit: cover;
	}
</style>
