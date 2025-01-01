<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";
	import DOMPurify from "dompurify";

	interface Props extends HTMLImgAttributes {
		"data-testid"?: string;
	}
	type $$Props = Props;

	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let src: HTMLImgAttributes["src"] = undefined;

	let resolved_src: typeof src;

	// The `src` prop can be updated before the Promise from `resolve_wasm_src` is resolved.
	// In such a case, the resolved value for the old `src` has to be discarded,
	// This variable `latest_src` is used to pick up only the value resolved for the latest `src` prop.
	let latest_src: typeof src;
	let is_svg = false;
	let svg_content: string | null = null;

	async function handle_src_change(src: string | undefined): Promise<void> {
		if (!src) return;

		is_svg = src.endsWith(".svg") || src.startsWith("data:image/svg+xml");

		if (is_svg) {
			try {
				const response = await fetch(src);
				const raw_svg = await response.text();
				svg_content = DOMPurify.sanitize(raw_svg, {
					USE_PROFILES: { svg: true, svgFilters: true }
				});
			} catch (error) {
				console.error("Error loading SVG:", error);
				is_svg = false;
			}
		}
	}

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
				if (s) {
					handle_src_change(s);
				}
			}
		});
	}
</script>

{#if is_svg && svg_content}
	<div class="svg-container">
		{@html svg_content}
	</div>
{:else}
	<!-- svelte-ignore a11y-missing-attribute -->
	<img src={resolved_src} {...$$restProps} on:load />
{/if}

<style>
	img,
	.svg-container :global(svg) {
		object-fit: cover;
	}

	.svg-container :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
