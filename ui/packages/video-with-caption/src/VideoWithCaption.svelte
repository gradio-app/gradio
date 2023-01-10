<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel } from "@gradio/atoms";
	import type { FileData } from "@gradio/upload";
	import { Video } from "@gradio/icons";

	import PlayerWithCaption from "./PlayerWithCaption.svelte";

	export let value: FileData | null = null;
	export let caption: FileData | null = null;
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

<BlockLabel {show_label} Icon={Video} label={label || "VideoWithCaption"} />
{#if value === null || caption === null}
	<div class="h-full min-h-[15rem] flex justify-center items-center">
		<div class="h-5 dark:text-white opacity-50"><Video /></div>
	</div>
{:else}
	<!-- svelte-ignore a11y-media-has-caption -->
	<PlayerWithCaption
		src={value.data}
		caption={caption.data}
		on:play
		on:pause
		on:ended
		mirror={false}
	/>
{/if}
