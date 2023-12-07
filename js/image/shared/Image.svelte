<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";
	type $$Props = HTMLImgAttributes;

	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let src: HTMLImgAttributes["src"] = undefined;

	// Use `src` to render <img/> immediately without waiting
	// for the asynchronous Wasm src resolving.
	// This is necessary to avoid flickering of the image element.
	let resolved_src = src;
	$: resolve_wasm_src(src).then(s => {
		resolved_src = s;
	});
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img src={resolved_src} {...$$restProps} />

<style>
	img {
		width: 100%;
		height: 100%;
		border-radius: var(--radius-lg);
	}
</style>
