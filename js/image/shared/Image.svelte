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
	// In such a case, the promise dispatched for the old `src` has to be ignored,
	// This variable `latest_promise` is used for that purpose.
	let latest_promise: ReturnType<typeof resolve_wasm_src>;
	$: {
		const current_promise = resolve_wasm_src(src);
		latest_promise = current_promise;

		current_promise.then((s) => {
			if (latest_promise === current_promise) {
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
