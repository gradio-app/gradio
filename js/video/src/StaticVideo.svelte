<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel, Empty, IconButton } from "@gradio/atoms";
	import type { FileData } from "@gradio/upload";
	import { Video, Download } from "@gradio/icons";

	import Player from "./Player.svelte";

	export let value: FileData | null = null;
	export let subtitle: FileData | null = null;
	export let label: string | undefined = undefined;
	export let show_label: boolean = true;

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
	<Empty size="large" unpadded_box={true}><Video /></Empty>
{:else}
	<!-- svelte-ignore a11y-media-has-caption -->
	<Player
		src={value.data}
		subtitle={subtitle?.data}
		on:play
		on:pause
		on:ended
		mirror={false}
	/>
	<div class="download" data-testid="download-div">
		<a
			href={value.data}
			target={window.__is_colab__ ? "_blank" : null}
			download={value.orig_name || value.name}
		>
			<IconButton Icon={Download} label="Download" />
		</a>
	</div>
{/if}

<style>
	.download {
		position: absolute;
		top: 6px;
		right: 6px;
	}
</style>
