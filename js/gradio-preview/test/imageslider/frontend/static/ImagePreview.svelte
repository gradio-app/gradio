<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { SelectData } from "@gradio/utils";
	import { uploadToHuggingFace } from "@gradio/utils";
	import SplitPane from "../shared/SplitPane.svelte";
	import {
		BlockLabel,
		Empty,
		IconButton,
		ShareButton,
		Block
	} from "@gradio/atoms";
	import { Download } from "@gradio/icons";
	import { get_coordinates_of_clicked_image } from "../shared/utils";
	import { _ } from "svelte-i18n";

	import { Image } from "@gradio/icons";
	import { type FileData, normalise_file } from "@gradio/upload";

	export let value: null | FileData;
	let value_: null | FileData;
	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let show_download_button = true;
	export let selectable = false;
	export let show_share_button = false;
	export let root: string;

	const dispatch = createEventDispatcher<{
		change: string;
		select: SelectData;
	}>();

	$: value && dispatch("change", value.data);

	$: if (value !== value_) {
		value_ = value;
		normalise_file(value_, root, null);
	}

	const handle_click = (evt: MouseEvent): void => {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	};
</script>

<BlockLabel {show_label} Icon={Image} label={label || $_("image.image")} />
{#if value_ === null}
	<Empty unpadded_box={true} size="large"><Image /></Empty>
{:else}
	<div style="position: relative;"></div>
	<SplitPane pos="50">
		<img slot="a" src={value[0].data} alt="" />
		<img slot="b" src={value[1].data} alt="" />
	</SplitPane>
	<img src={value_.data} alt="" class:selectable on:click={handle_click} />
{/if}

<style>
	img {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
	}

	.selectable {
		cursor: crosshair;
	}

	.icon-buttons {
		display: flex;
		position: absolute;
		top: 6px;
		right: 6px;
		gap: var(--size-1);
	}
</style>
