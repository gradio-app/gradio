<script lang="ts">
	import { createEventDispatcher, afterUpdate, tick } from "svelte";
	import { BlockLabel, Empty, IconButton } from "@gradio/atoms";
	import type { FileData } from "@gradio/upload";
	import { Video, Download } from "@gradio/icons";

	import Player from "./Player.svelte";

	export let value: FileData | null = null;
	export let subtitle: FileData | null = null;
	export let label: string | undefined = undefined;
	export let show_label: boolean = true;
	let old_value: FileData | null = null;
	let old_subtitle: FileData | null = null;

	const dispatch = createEventDispatcher<{
		change: FileData;
		play: undefined;
		pause: undefined;
		end: undefined;
		stop: undefined;
	}>();

	$: value && dispatch("change", value);

	afterUpdate(async () => {
		// needed to bust subtitle caching issues on Chrome
		if (
			value !== old_value &&
			subtitle !== old_subtitle &&
			old_subtitle !== null
		) {
			old_value = value;
			value = null;
			await tick();
			value = old_value;
		}
		old_value = value;
		old_subtitle = subtitle;
	});
</script>

<BlockLabel {show_label} Icon={Video} label={label || "Video"} />
{#if value === null}
	<Empty unpadded_box={true} size="large"><Video /></Empty>
{:else}
	<!-- svelte-ignore a11y-media-has-caption -->
	{#key value.data}
		<Player
			src={value.data}
			subtitle={subtitle?.data}
			on:play
			on:pause
			on:ended
			mirror={false}
		/>
	{/key}
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
