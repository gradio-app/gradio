<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";
	import type { Brush } from "./types";
	import { Toolbar, IconButton } from "@gradio/atoms";
	import {
		Image,
		Brush as BrushIcon,
		Crop,
		Webcam as WebcamIcon,
		ImagePaste,
		Upload as UploadIcon,
		DropdownArrow,
		Rotate,
		Palette,
		Color
	} from "@gradio/icons";

	export let i18n: I18nFormatter;
	export let transforms: ("crop" | "rotate")[];
	export let brush: Brush | null;
	export let sources: ("clipboard" | "webcam" | "upload")[] = [
		"upload",
		"clipboard",
		"webcam"
	];
	export let layers: [][] = [];

	const dispatch = createEventDispatcher<{
		set_source: "upload" | "webcam" | "clipboard";
		select_transform: "crop" | "rotate";
	}>();

	const sources_meta = {
		upload: {
			icon: UploadIcon,
			label: i18n("Upload"),
			order: 0
		},
		webcam: {
			icon: WebcamIcon,
			label: i18n("Webcam"),
			order: 1
		},
		clipboard: {
			icon: ImagePaste,
			label: i18n("Paste"),
			order: 2
		}
	};

	const transform_meta = {
		rotate: {
			icon: Rotate,
			label: i18n("Rotate"),
			order: 0
		},
		crop: {
			icon: Crop,
			label: i18n("Crop"),
			order: 1
		}
	};

	const paint_meta = {
		color: {
			icon: Palette,
			label: i18n("Upload"),
			order: 0
		},
		size: {
			icon: BrushIcon,
			label: i18n("Webcam"),
			order: 1
		}
	};

	const category_meta: Record<
		"bg" | "transform" | "brush",
		{
			order: number;
			label: string;
			icon: typeof Image;
		}
	> = {
		bg: {
			order: 0,
			label: i18n("Image"),
			icon: Image
		},
		transform: {
			order: 1,
			label: i18n("Transform"),
			icon: Crop
		},
		brush: {
			order: 2,
			label: i18n("Draw"),
			icon: BrushIcon
		}
	} as const;

	$: _transforms = transforms.sort(
		(a, b) => transform_meta[a].order - transform_meta[b].order
	);

	$: categories = (Object.keys(category_meta) as (keyof typeof category_meta)[])
		.filter((a) => {
			if (a === "brush") {
				return !!brush;
			} else if (a === "transform") {
				return transforms.length > 0;
			} else if (a === "bg") {
				return sources.length > 1;
			}

			return false;
		})
		.sort((a, b) => category_meta[a].order - category_meta[b].order);

	$: sources_list = sources.sort(
		(a, b) => sources_meta[a].order - sources_meta[b].order
	);

	let category = "bg";

	function select_category(type: keyof typeof category_meta): void {
		switch (type) {
			case "bg":
				category = "bg";
				break;
			case "transform":
				category = "transform";
				break;
			case "brush":
				category = "brush";
				break;
			default:
				break;
		}
	}

	let show_layers = false;
	let current_layer = 0;

	const brush_options = ["color", "size"] as const;
</script>

<Toolbar show_border={false}>
	{#if category === "bg"}
		{#each sources_list as src}
			<IconButton
				on:click={() => dispatch("set_source", src)}
				Icon={sources_meta[src].icon}
				size="large"
				padded={false}
			/>
		{/each}
	{:else if category === "transform"}
		{#each _transforms as t}
			<IconButton
				on:click={() => dispatch("select_transform", t)}
				Icon={transform_meta[t].icon}
				size="large"
				padded={false}
			/>
		{/each}
	{:else if category === "brush"}
		{#each brush_options as p}
			<IconButton
				on:click={() => {}}
				Icon={paint_meta[p].icon}
				size="large"
				padded={false}
			/>
		{/each}
	{/if}
</Toolbar>
<div class="toolbar-wrap">
	<div class="layer-wrap" class:closed={!show_layers}>
		<button on:click={() => (show_layers = !show_layers)}
			>Layers <span class="layer-toggle"><DropdownArrow /></span></button
		>
		{#if show_layers}
			<ul>
				{#each layers as layer, i (i)}
					<li>
						<button on:click={() => (current_layer = i)}>Layer {i + 1}</button>
					</li>
				{/each}
				<li>
					<button on:click={() => (layers = [...layers, []])}> +</button>
				</li>
			</ul>
		{/if}
	</div>
	<Toolbar show_border={false}>
		{#each categories as cat}
			<IconButton
				highlight={category === cat}
				on:click={() => select_category(cat)}
				Icon={category_meta[cat].icon}
				size="large"
				padded={false}
			/>
		{/each}
	</Toolbar>
</div>

<style>
	.layer-toggle {
		width: 20px;
		transform: rotate(0deg);

		/* transform-origin: 50% 50%; */
	}

	.closed .layer-toggle {
		transform: rotate(-90deg);
	}
	.toolbar-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}

	.layer-wrap {
		position: absolute;
		bottom: 0;
		left: 0;
		display: inline-block;
		border: 1px solid var(--block-border-color);
		border-radius: var(--radius-md);

		transition: var(--button-transition);
		box-shadow: var(--button-shadow);

		text-align: left;
		border-bottom: none;
		border-left: none;
		border-bottom-right-radius: 0;
		border-top-left-radius: 0;
		background-color: var(--background-fill-primary);
		overflow: hidden;
	}

	.layer-wrap button {
		display: inline-flex;
		justify-content: flex-start;
		align-items: flex-start;
		padding: var(--size-2) var(--size-4);
		width: 100%;
		border-bottom: 1px solid var(--block-border-color);
	}

	.layer-wrap li:last-child button {
		border-bottom: none;
		text-align: center;
	}

	.closed > button {
		border-bottom: none;
	}

	.layer-wrap button:hover {
		background-color: var(--background-fill-secondary);
	}
</style>
