<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";
	import { Empty } from "@gradio/atoms";
	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import type { ActionReturn } from "svelte/action";
	import { BlockLabel } from "@gradio/atoms";

	import { Music } from "@gradio/icons";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let name: string;
	export let show_label = true;
	export let autoplay: boolean;

	const dispatch = createEventDispatcher<{
		change: AudioData;
		play: undefined;
		pause: undefined;
		end: undefined;
		stop: undefined;
	}>();

	$: value &&
		dispatch("change", {
			name: name,
			data: value?.data
		});

	let player: HTMLAudioElement;

	let _value: typeof value;

	$: handle_value_change(value);

	async function handle_value_change(media_value: typeof value): Promise<void> {
		if (value && value.data) {
			if (player) {
				player.pause();
				player.currentTime = 0;
			}
			await tick();
			_value = media_value;
		}
	}

	function loaded(node: HTMLAudioElement): ActionReturn {
		async function handle_playback(): Promise<void> {
			if (autoplay) {
				await node.play();
			}
		}

		node.addEventListener("loadeddata", handle_playback);

		return {
			destroy: () => node.removeEventListener("loadeddata", handle_playback)
		};
	}

	function handle_ended(): void {
		dispatch("stop");
		dispatch("end");
	}
</script>

<BlockLabel {show_label} Icon={Music} float={false} label={label || "Audio"} />
{#if value === null}
	<Empty size="small">
		<Music />
	</Empty>
{:else}
	<audio
		use:loaded
		bind:this={player}
		controls
		preload="metadata"
		src={_value?.data}
		on:play
		on:pause
		on:ended={handle_ended}
		data-testid={`${label}-static-audio`}
	/>
{/if}

<style>
	audio {
		padding: var(--size-2);
		width: var(--size-full);
		height: var(--size-14);
	}
</style>
