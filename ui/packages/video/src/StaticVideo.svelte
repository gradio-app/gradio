<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { BlockLabel, Empty } from "@gradio/atoms";
	import type { FileData } from "@gradio/upload";
	import { Video } from "@gradio/icons";

	import Player from "./Player.svelte";

	export let value: FileData | null = null;
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
	<Empty size="large"><Video /></Empty>
{:else}
	<!-- svelte-ignore a11y-media-has-caption -->
	<Player src={value.data} on:play on:pause on:ended mirror={false} />
{/if}

<style>
	.empty {
		height: var(--size-full);
		min-height: var(--size-60);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icon {
		height: var(--size-5);
		color: var(--color-text-body);
		opacity: 0.5;
	}
</style>
