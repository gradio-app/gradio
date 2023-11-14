<script lang="ts">
	import type { I18nFormatter } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";
	import type { Brush, Eraser, PathData } from "./types";
	import { click_outside } from "./utils";

	import { Toolbar, IconButton } from "@gradio/atoms";
	import ColorSwatch from "./ColorSwatch.svelte";
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
	export let eraser: Eraser | null;
	export let sources: ("clipboard" | "webcam" | "upload")[] = [
		"upload",
		"clipboard",
		"webcam"
	];
	export let layers: PathData[][] = [];
	export let current_layer = 0;
	export let colors: (string | [number, number, number, number])[];
	export let selected_color: number;
	export let sizes: number[];
	export let selected_size: number;

	const dispatch = createEventDispatcher<{
		set_source: "upload" | "webcam" | "clipboard";
		select_transform: "crop" | "rotate";
		new_layer?: never;
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
		"bg" | "transform" | "brush" | "eraser",
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
		},
		eraser: {
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
			} else if (a === "eraser") {
				return !!eraser;
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

	export let category: keyof typeof category_meta = "bg";

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
			case "eraser":
				category = "eraser";
				break;
			default:
				break;
		}
	}

	let show_layers = false;

	const brush_options = ["color", "size"] as const;
	let brush_option: "color" | "size" | null = null;
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
		{#if brush_option === "color"}
			<ColorSwatch
				bind:selected_color
				{colors}
				on:click_outside={() => (brush_option = null)}
			/>
		{:else if brush_option === "size"}
			<!-- <IconButton
        on:click={() => {}}
        Icon={paint_meta[p].icon}
        size="large"
        padded={false}
      /> -->
		{/if}
		{#each brush_options as p}
			<IconButton
				on:click={() => (brush_option = p)}
				Icon={paint_meta[p].icon}
				size="large"
				padded={false}
			/>
		{/each}
	{:else if category === "eraser"}
		{#if brush_option === "color"}
			<ColorSwatch
				bind:selected_color
				{colors}
				on:click_outside={() => (brush_option = null)}
			/>
		{:else if brush_option === "size"}
			<!-- <IconButton
        on:click={() => {}}
        Icon={paint_meta[p].icon}
        size="large"
        padded={false}
      /> -->
		{/if}
		{#each brush_options as p}
			<IconButton
				on:click={() => (brush_option = p)}
				Icon={paint_meta[p].icon}
				size="large"
				padded={false}
			/>
		{/each}
	{/if}
</Toolbar>

<!-- <div class="toolbar-wrap">
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
</div> -->

<style>
	.toolbar-wrap {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
	}
</style>
