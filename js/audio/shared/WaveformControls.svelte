<script lang="ts">
	import {
		Play,
		Pause,
		Forward,
		Backward,
		Undo,
		Settings,
		Trim,
	} from "@gradio/icons";
	import { getSkipRewindAmount } from "../shared/utils";
	import type { I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import RegionsPlugin from "wavesurfer.js/dist/plugins/regions.js";

	export let waveform: WaveSurfer;
	export let audioDuration: number;
	export let i18n: I18nFormatter;
	export let playing: boolean;
	export let clearRecording: () => void = () => {};
	export let showRedo = false;
	export let interactive = false;

	let playbackSpeeds = [0.5, 1, 1.5, 2];
	let playbackSpeed = playbackSpeeds[1];

	let trimRegion: RegionsPlugin;
	let activeRegion: any;
	let trimmingMode = false;

	$: trimRegion &&
		activeRegion &&
		trimRegion.on("region-in", (region) => {
			activeRegion = region;
			playing = true;
		});

	$: trimRegion &&
		activeRegion &&
		trimRegion.on("region-out", () => {
			activeRegion && activeRegion.play();
		});

	const addTrimRegion = (): void => {
		trimRegion = waveform.registerPlugin(RegionsPlugin.create());

		const region = trimRegion.addRegion({
			start: audioDuration / 4,
			end: audioDuration / 2,
			color: "hsla(200, 50%, 70%, 0.5)",
			drag: true,
			resize: true,
		});
		activeRegion = region;
	};

	$: waveform &&
		activeRegion &&
		waveform.on("interaction", (region) => {
			activeRegion = region;
		});

	$: trimRegion &&
		activeRegion &&
		trimRegion.on("region-updated", (region) => {
			activeRegion = region;
		});

	$: trimRegion &&
		activeRegion &&
		trimRegion.on("region-clicked", (region, e) => {
			e.stopPropagation();
			activeRegion = region;
			region.play();
			playing = true;
		});

	const handlePlayPause = (): void => {
		if (activeRegion && !playing) {
			activeRegion.play();
			playing = true;
		} else if (activeRegion && playing) {
			waveform.pause();
			playing = false;
		} else {
			waveform.playPause();
			playing = true;
		}
	};

	const toggleTrimming = (): void => {
		trimmingMode = !trimmingMode;

		if (!trimmingMode) {
			trimRegion.clearRegions();
			trimRegion.destroy();
			activeRegion = null;
		} else {
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
			on:click={handlePlayPause}
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
		{#if showRedo}
			<button class="redo" on:click={clearRecording}>
				<Undo />
			</button>
		{/if}

		{#if interactive}
			{#if !trimmingMode}
				<button
					class="trim"
					on:click={toggleTrimming}
					style="color: {trimmingMode
						? 'var(--primary)'
						: 'var(--neutral-400)'}"
				>
					<Trim />
				</button>
			{:else}
				<button class="text-button" on:click={toggleTrimming}>Trim</button>
				<button class="text-button" on:click={toggleTrimming}>Cancel</button>
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
		width: var(--size-20);
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
