<script lang="ts">
	import { Play, Pause, Forward, Backward, Undo, Trim } from "@gradio/icons";
	import { getSkipRewindAmount } from "../shared/utils";
	import type { I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";

	export let waveform: WaveSurfer;
	export let audioDuration: number;
	export let i18n: I18nFormatter;
	export let playing: boolean;
	export let clear_recording = (): void => {};
	export let showRedo = false;
	export let interactive = false;
	export let handle_trim_audio: (start: number, end: number) => void;
	export let mode = "";

	export let trimDuration = 0;

	let playbackSpeeds = [0.5, 1, 1.5, 2];
	let playbackSpeed = playbackSpeeds[1];

	let trimRegion: RegionsPlugin;
	let activeRegion: any;

	$: trimRegion &&
		activeRegion &&
		trimRegion.on("region-in", (region) => {
			activeRegion = region;
		});

	$: trimRegion &&
		activeRegion &&
		trimRegion.on("region-out", () => {
			activeRegion && activeRegion.play();
		});

	$: trimRegion &&
		trimRegion.on("region-updated", (region) => {
			activeRegion = region;
			trimDuration = activeRegion.end - activeRegion.start;
		});

	const addTrimRegion = (): void => {
		if (mode !== "edit") return;
		trimRegion = waveform.registerPlugin(RegionsPlugin.create());
		const newRegion = trimRegion.addRegion({
			start: audioDuration / 4,
			end: audioDuration / 2,
			color: "hsla(15, 85%, 40%, 0.4)",
			drag: true,
			resize: true,
		});

		activeRegion = newRegion;
		trimDuration = activeRegion.end - activeRegion.start;
	};

	const trimAudio = (): void => {
		if (waveform && trimRegion) {
			const region = activeRegion;

			if (region) {
				const start = region.start;
				const end = region.end;
				handle_trim_audio(start, end);
				mode = "";
			}
		}
	};

	$: trimRegion &&
		activeRegion &&
		trimRegion.on("region-clicked", (region, e) => {
			e.stopPropagation();
			activeRegion = region;
			activeRegion.play();
		});

	const toggleTrimmingMode = (): void => {
		if (mode === "edit") {
			mode = "";
		} else {
			mode = "edit";
		}

		trimRegion?.getRegions().forEach((region) => {
			region.remove();
		});
		trimRegion?.destroy();
		trimRegion?.clearRegions();

		if (mode === "edit") {
			addTrimRegion();
		}
	};
</script>

<div class="controls">
	<button
		class="playback"
		aria-label="playback speed"
		on:click={() => {
			playbackSpeed =
				playbackSpeeds[
					(playbackSpeeds.indexOf(playbackSpeed) + 1) % playbackSpeeds.length
				];

			waveform.setPlaybackRate(playbackSpeed);
		}}
	>
		<span>{playbackSpeed}x</span>
	</button>

	<div class="play-pause-wrapper">
		<button
			class="rewind"
			on:click={() => waveform.skip(getSkipRewindAmount(audioDuration) * -1)}
		>
			<Backward />
		</button>
		<button
			class="play-pause-button"
			on:click={() => waveform.playPause()}
			aria-label={playing ? i18n("common.play") : i18n("common.pause")}
		>
			{#if playing}
				<Pause />
			{:else}
				<span style:right="-1px" style:position="relative">
					<Play />
				</span>
			{/if}
		</button>
		<button
			class="skip"
			on:click={() => waveform.skip(getSkipRewindAmount(audioDuration))}
		>
			<Forward />
		</button>
	</div>

	<div class="settings-wrapper">
		{#if showRedo && mode === ""}
			<button class="redo" on:click={clear_recording}>
				<Undo />
			</button>
		{/if}

		{#if interactive}
			{#if mode === ""}
				<button class="trim" on:click={toggleTrimmingMode}>
					<Trim />
				</button>
			{:else}
				<button class="text-button" on:click={trimAudio}>Trim</button>
				<button class="text-button" on:click={toggleTrimmingMode}>Cancel</button
				>
			{/if}
		{/if}
	</div>
</div>

<style>
	.settings-wrapper {
		display: flex;
		justify-self: self-end;
	}

	.text-button {
		width: min-content;
		border: 1px solid var(--neutral-400);
		border-radius: var(--radius-3xl);
		padding: var(--spacing-xl);
		line-height: 1px;
		font-size: var(--text-md);
		margin-left: 5px;
		font-size: var(--text-sm);
	}

	.controls {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		margin-top: 5px;
	}
	.redo {
		width: 20px;
		color: var(--neutral-400);
	}

	.trim {
		color: var(--neutral-400);
		margin-left: var(--spacing-md);
	}

	.play-pause-wrapper {
		display: flex;
		justify-self: center;
	}
	.playback {
		border: 1px solid var(--neutral-400);
		color: var(--neutral-400);
		border-radius: var(--radius-sm);
		width: 5.5ch;
		font-weight: 300;
		font-size: var(--size-3);
		text-align: center;
	}

	.rewind,
	.skip {
		margin: 0 10px;
		color: var(--neutral-400);
	}

	.play-pause-button {
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.play-pause-button :global(svg) {
		width: 30px;
		height: 30px;
		color: var(--neutral-400);
		fill: var(--neutral-400);
		position: relative;
	}
</style>
