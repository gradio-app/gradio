<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import type { FileData } from "@gradio/upload";
	import { Video } from "@gradio/icons";

	export let value: FileData | null = null;
	export let label: string | undefined = undefined;
	export let show_label: boolean;

	const dispatch = createEventDispatcher<{
		change: FileData;
		play: undefined;
		pause: undefined;
		ended: undefined;
	}>();

	$: value && dispatch("change", value);
</script>

<BlockLabel {show_label} Icon={Video} label={label || "Video"} />
{#if value === null}
	<div class="h-full min-h-[15rem] flex justify-center items-center">
		<div class="h-5 dark:text-white opacity-50"><Video /></div>
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
