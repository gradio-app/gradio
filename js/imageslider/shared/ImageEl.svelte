<script lang="ts">
	import type { HTMLImgAttributes } from "svelte/elements";
	import { onMount, tick } from "svelte";
	interface Props extends Omit<HTMLImgAttributes, "onload"> {
		"data-testid"?: string;
		fixed?: boolean;
		transform?: string;
		img_el?: HTMLImageElement | null;
		hidden?: boolean;
		variant?: "preview" | "upload";
		max_height?: number;
		fullscreen?: boolean;
		onload?: (size: {
			top: number;
			left: number;
			width: number;
			height: number;
		}) => void;
	}

	let {
		src = undefined,
		fullscreen = false,
		fixed = false,
		transform = "translate(0px, 0px) scale(1)",
		img_el = $bindable<HTMLImageElement | null>(),
		hidden = false,
		variant = "upload",
		max_height = 500,
		onload,
		...restProps
	}: Props = $props();

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
				onload?.(get_image_size(img_el));
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
	{src}
	data-testid="imageslider-image"
	{...restProps}
	class:fixed
	style:transform
	bind:this={img_el}
	class:hidden
	class:preview={variant === "preview"}
	class:slider={variant === "upload"}
	style:max-height={max_height && !fullscreen ? `${max_height}px` : null}
	class:fullscreen
	class:small={!fullscreen}
	onload={() => onload?.(get_image_size(img_el))}
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
