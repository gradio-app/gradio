<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";

	interface Props extends HTMLImgAttributes {
		"data-testid"?: string;
		fixed?: boolean;
		transform?: string;
		img_el?: HTMLImageElement;
		hidden?: boolean;
		variant?: "preview" | "slider";
	}
	type $$Props = Props;

	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let src: HTMLImgAttributes["src"] = undefined;

	let resolved_src: typeof src;

	export let fixed = false;
	export let transform = "translate(0px, 0px) scale(1)";
	export let img_el: HTMLImageElement | null = null;
	export let hidden = false;
	export let variant = "slider";
	// The `src` prop can be updated before the Promise from `resolve_wasm_src` is resolved.
	// In such a case, the resolved value for the old `src` has to be discarded,
	// This variable `latest_src` is used to pick up only the value resolved for the latest `src` prop.
	let latest_src: typeof src;
	$: {
		// In normal (non-Wasm) Gradio, the `<img>` element should be rendered with the passed `src` props immediately
		// without waiting for `resolve_wasm_src()` to resolve.
		// If it waits, a blank image is displayed until the async task finishes
		// and it leads to undesirable flickering.
		// So set `src` to `resolved_src` here.
		resolved_src = src;

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
<img
	src={resolved_src}
	{...$$restProps}
	on:load
	class:fixed
	style:transform
	bind:this={img_el}
	class:hidden
/>

<style>
	.slider {
		object-fit: contain;
		max-height: 500px;
		transform-origin: top left;
		margin: auto;
	}
	.preview {
		object-fit: contain;
		max-height: 500px;
	}

	.fixed {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.hidden {
		opacity: 0;
	}
</style>
