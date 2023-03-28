<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel, Empty, IconButton } from "@gradio/atoms";
	import { Download } from "@gradio/icons";

	import { Image } from "@gradio/icons";

	export let value: null | string;
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: string;
	}>();

	$: value && dispatch("change", value);
</script>

<BlockLabel {show_label} Icon={Image} label={label || "Image"} />
{#if value === null}
	<Empty size="large" unpadded_box={true}><Image /></Empty>
{:else}
	<div class="download">
		<a
			href={value}
			target={window.__is_colab__ ? "_blank" : null}
			download={"image"}
		>
			<IconButton Icon={Download} label="Download" />
		</a>
	</div>
	<img src={value} alt="" />
{/if}

<style>
	img {
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
	}

	.download {
		position: absolute;
		top: 6px;
		right: 6px;
	}
</style>
