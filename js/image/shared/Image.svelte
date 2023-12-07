<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";
	type $$Props = HTMLImgAttributes;

	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let src: HTMLImgAttributes["src"] = undefined;

	// Use `src` to render <img/> immediately without waiting
	// for the asynchronous Wasm src resolving.
	// This is necessary to avoid flickering of the image element.
	let resolved_src = src;
	// The `src` prop can be updated before the Promise from `resolve_wasm_src` is resolved.
	// In such a case, the resolved value for the old `src` has to be discarded,
	// This variable `latest_src` is used to pick up only the value resolved for the latest `src` prop.
	let latest_src: typeof src;
	$: {
		latest_src = src;
		const resolving_src = src;
		resolve_wasm_src(resolving_src).then((s) => {
			if (latest_src === resolving_src) {
				resolved_src = s;
			}
		});
	}
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
