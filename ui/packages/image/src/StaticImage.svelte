<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Block, BlockLabel } from "@gradio/atoms";

	import image_icon from "./image.svg";

	export let value: null | string;
	export let label: string | undefined = undefined;
	export let style: string = "";
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: string;
	}>();

	$: value && dispatch("change", value);
</script>

<BlockLabel {show_label} image={image_icon} label={label || "Image"} />
{#if value === null}
	<div class="min-h-[16rem] flex justify-center items-center">
		<img src={image_icon} alt="" class="h-6 opacity-20" />
	</div>
{:else}
	<img class="w-full h-full object-contain" src={value} alt="" />
{/if}
