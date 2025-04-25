<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";
	import { createEventDispatcher, onMount, tick } from "svelte";
	interface Props extends HTMLImgAttributes {
		"data-testid"?: string;
		fixed?: boolean;
		transform?: string;
		img_el?: HTMLImageElement;
		hidden?: boolean;
		variant?: "preview" | "upload";
		max_height?: number;
		fullscreen?: boolean;
	}
	type $$Props = Props;

	import { resolve_wasm_src } from "@gradio/wasm/svelte";

	export let src: HTMLImgAttributes["src"] = undefined;
	export let fullscreen = false;

	let resolved_src: typeof src;

	export let fixed = false;
	export let transform = "translate(0px, 0px) scale(1)";
	export let img_el: HTMLImageElement | null = null;
	export let hidden = false;
	export let variant = "upload";
	export let max_height = 500;
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

	const dispatch = createEventDispatcher<{
		load: {
			top: number;
			left: number;
			width: number;
			height: number;
		};
	}>();

	function get_image_size(img: HTMLImageElement | null): {
		top: number;
		left: number;
		width: number;
		height: number;
	} {
		if (!img) return { top: 0, left: 0, width: 0, height: 0 };
		const container = img.parentElement?.getBoundingClientRect();

		if (!container) return { top: 0, left: 0, width: 0, height: 0 };

		const naturalAspect = img.naturalWidth / img.naturalHeight;
		const containerAspect = container.width / container.height;
		let displayedWidth, displayedHeight;

		if (naturalAspect > containerAspect) {
			displayedWidth = container.width;
			displayedHeight = container.width / naturalAspect;
		} else {
			displayedHeight = container.height;
			displayedWidth = container.height * naturalAspect;
		}

		const offsetX = (container.width - displayedWidth) / 2;
		const offsetY = (container.height - displayedHeight) / 2;

		return {
			top: offsetY,
			left: offsetX,
			width: displayedWidth,
			height: displayedHeight
		};
	}

	onMount(() => {
		const resizer = new ResizeObserver(async (entries) => {
			for (const entry of entries) {
				await tick();
				dispatch("load", get_image_size(img_el));
			}
		});

		resizer.observe(img_el!);

		return () => {
			resizer.disconnect();
		};
	});
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<img
	src={resolved_src}
	{...$$restProps}
	class:fixed
	style:transform
	bind:this={img_el}
	class:hidden
	class:preview={variant === "preview"}
	class:slider={variant === "upload"}
	style:max-height={max_height && !fullscreen ? `${max_height}px` : null}
	class:fullscreen
	class:small={!fullscreen}
	on:load={() => dispatch("load", get_image_size(img_el))}
/>

<style>
	.preview {
		object-fit: contain;
		width: 100%;
		transform-origin: top left;
		margin: auto;
	}

	.small {
		max-height: 500px;
	}

	.upload {
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

	.fullscreen {
		width: 100%;
		height: 100%;
	}

	:global(.image-container:fullscreen) img {
		width: 100%;
		height: 100%;
		max-height: none;
		max-width: none;
	}

	.hidden {
		opacity: 0;
	}
</style>
