<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";
	import DOMPurify from 'dompurify';

	interface Props extends HTMLImgAttributes {
		"data-testid"?: string;
	}
	type $$Props = Props;

	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let src: HTMLImgAttributes["src"] = undefined;

	let resolved_src: typeof src;
	let is_svg = false;
	let sanitized_svg = '';

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

		is_svg = typeof src === 'string' && (
			src.startsWith('data:image/svg+xml') || 
			src.startsWith('<svg') ||
				src.toLowerCase().endsWith('.svg')
		);

		if (is_svg && typeof src === 'string') {
			sanitized_svg = DOMPurify.sanitize(src);
		}

		resolve_wasm_src(resolving_src).then((s) => {
			if (latest_src === resolving_src) {
				resolved_src = s;
			}
		});
	}
</script>

{#if is_svg}
	<div class="svg-container" {...$$restProps} on:load>
		{@html sanitized_svg}
	</div>
{:else}
	<!-- svelte-ignore a11y-missing-attribute -->
	<img src={resolved_src} {...$$restProps} on:load />
{/if}

<style>
	img, .svg-container :global(svg) {
		object-fit: cover;
	}

	.svg-container {
		display: inline-block;
		width: 100%;
		height: 100%;
	}
</style>
