<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import type { SelectData, ShareData } from "@gradio/utils";
	import { uploadToHuggingFace } from "@gradio/utils";
	import { BlockLabel, Empty, IconButton } from "@gradio/atoms";
	import { Download, Community } from "@gradio/icons";
	import { get_coordinates_of_clicked_image } from "./utils";

	import { Image } from "@gradio/icons";

	export let value: null | string;
	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let selectable: boolean = false;
	export let shareable: boolean | Array<string | number> = false;

	const dispatch = createEventDispatcher<{
		change: string;
		select: SelectData;
		share: ShareData;
	}>();

	$: value && dispatch("change", value);

	const handle_click = (evt: MouseEvent) => {
		let coordinates = get_coordinates_of_clicked_image(evt);
		if (coordinates) {
			dispatch("select", { index: coordinates, value: null });
		}
	};
</script>

<BlockLabel {show_label} Icon={Image} label={label || "Image"} />
{#if value === null}
	<Empty unpadded_box={true} size="large"><Image /></Empty>
{:else}
	<div class="icon-buttons">
		<a
			href={value}
			target={window.__is_colab__ ? "_blank" : null}
			download={"image"}
		>
			<IconButton Icon={Download} label="Download" />
		</a>
		{#if shareable}
			<IconButton
				Icon={Community}
				label="Share"
				show_label={true}
				on:click={async () => {
					if (!value) return;
					let url = await uploadToHuggingFace(value, "base64");
					dispatch("share", {
						title: shareable,
						description: `<img src="${url}" />`
					});
				}}
			/>
		{/if}
	</div>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<img src={value} alt="" class:selectable on:click={handle_click} />
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
