<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import type { FileData } from "@gradio/upload";

	import video_icon from "./video.svg";

	export let value: FileData | null = null;
	export let label: string | undefined = undefined;
	export let style: string = "";

	const dispatch = createEventDispatcher<{
		change: FileData;
		play: undefined;
		pause: undefined;
		ended: undefined;
	}>();

	$: value && dispatch("change", value);

	console.log("static");
</script>

<Block variant={"solid"} color={"grey"} padding={false}>
	<BlockLabel image={video_icon} label={label || "Video"} />
	{#if value === null}
		<div class="min-h-[16rem] flex justify-center items-center">
			<img src={video_icon} alt="" class="h-10 opacity-30" />
		</div>
	{:else}
		<!-- svelte-ignore a11y-media-has-caption -->
		<video
			class="w-full h-full object-contain bg-black"
			controls
			playsInline
			preload="auto"
			src={value.data}
			on:play
			on:pause
			on:ended
		/>
	{/if}
</Block>
