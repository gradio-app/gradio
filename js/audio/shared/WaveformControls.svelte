<script lang="ts">
	import {
		Play,
		Pause,
		Forward,
		Backward,
		ClosedCaption,
		Undo,
		Trim
	} from "@gradio/icons";
	import { get_skip_rewind_amount } from "../shared/utils";
	import type { I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import RegionsPlugin, {
		type Region
	} from "wavesurfer.js/dist/plugins/regions.js";
	import type { WaveformOptions } from "./types";
	import VolumeLevels from "./VolumeLevels.svelte";
	import VolumeControl from "./VolumeControl.svelte";

	let {
		waveform,
		audio_duration,
		i18n,
		playing,
		show_redo = false,
		interactive = false,
		handle_trim_audio,
		mode = $bindable(),
		container,
		handle_reset_value,
		waveform_options = {},
		trim_region_settings = {},
		show_volume_slider = $bindable(),
		editable = true,
		subtitles_toggle = $bindable(),
		show_subtitles = false,
		trimDuration = $bindable()
	}: {
		waveform: WaveSurfer | undefined;
		audio_duration: number;
		i18n: I18nFormatter;
		playing: boolean;
		show_redo?: boolean;
		interactive?: boolean;
		handle_trim_audio: (start: number, end: number) => void;
		mode?: string;
		container: HTMLDivElement;
		handle_reset_value: () => void;
		waveform_options?: WaveformOptions;
		trim_region_settings?: WaveformOptions;
		show_volume_slider?: boolean;
		editable?: boolean;
		subtitles_toggle?: boolean;
		show_subtitles?: boolean;
		trimDuration?: number;
	} = $props();

	let playbackSpeeds = [0.5, 1, 1.5, 2];
	let playbackSpeed = $state(playbackSpeeds[1]);

	let trimRegion: RegionsPlugin | null = $state(null);
	let activeRegion: Region | null = $state(null);

	let leftRegionHandle: HTMLDivElement | null = $state(null);
	let rightRegionHandle: HTMLDivElement | null = $state(null);
	let activeHandle = $state("");

	let currentVolume = $state(1);

	$effect(() => {
		if (container && waveform) {
			trimRegion = waveform.registerPlugin(RegionsPlugin.create());
		} else {
			trimRegion = null;
		}
	});

	$effect(() => {
		trimRegion?.on("region-out", (region) => {
			region.play();
		});
	});

	$effect(() => {
		trimRegion?.on("region-updated", (region) => {
			trimDuration = region.end - region.start;
		});
	});

	$effect(() => {
		trimRegion?.on("region-clicked", (region, e) => {
			e.stopPropagation(); // prevent triggering a click on the waveform
			activeRegion = region;
			region.play();
		});
	});

	const addTrimRegion = (): void => {
		if (!trimRegion) return;
		activeRegion = trimRegion?.addRegion({
			start: audio_duration / 4,
			end: audio_duration / 2,
			...trim_region_settings
		});

		trimDuration = activeRegion.end - activeRegion.start;
	};

	$effect(() => {
		if (activeRegion) {
			const shadowRoot = container.children[0]!.shadowRoot!;

			rightRegionHandle = shadowRoot.querySelector('[data-resize="right"]');
			leftRegionHandle = shadowRoot.querySelector('[data-resize="left"]');

			if (leftRegionHandle && rightRegionHandle) {
				leftRegionHandle.setAttribute("role", "button");
				rightRegionHandle.setAttribute("role", "button");
				leftRegionHandle?.setAttribute(
					"aria-label",
					"Drag to adjust start time"
				);
				rightRegionHandle?.setAttribute("aria-label", "Drag to adjust end time");
				leftRegionHandle?.setAttribute("tabindex", "0");
				rightRegionHandle?.setAttribute("tabindex", "0");

				leftRegionHandle.addEventListener("focus", () => {
					if (trimRegion) activeHandle = "left";
				});

				rightRegionHandle.addEventListener("focus", () => {
					if (trimRegion) activeHandle = "right";
				});
			}
		}
	});

	const trimAudio = (): void => {
		if (waveform && trimRegion) {
			if (activeRegion) {
				const start = activeRegion.start;
				const end = activeRegion.end;
				handle_trim_audio(start, end);
				mode = "";
				activeRegion = null;
			}
		}
	};

	const clearRegions = (): void => {
		trimRegion?.getRegions().forEach((region) => {
			region.remove();
		});
		trimRegion?.clearRegions();
	};

	const toggleTrimmingMode = (): void => {
		clearRegions();
		if (mode === "edit") {
			mode = "";
		} else {
			mode = "edit";
			addTrimRegion();
		}
	};

	const toggleSubtitles = (): void => {
		subtitles_toggle = !subtitles_toggle;
	};

	const adjustRegionHandles = (handle: string, key: string): void => {
		let newStart;
		let newEnd;

		if (!activeRegion) return;
		if (handle === "left") {
			if (key === "ArrowLeft") {
				newStart = activeRegion.start - 0.05;
				newEnd = activeRegion.end;
			} else {
				newStart = activeRegion.start + 0.05;
				newEnd = activeRegion.end;
			}
		} else {
			if (key === "ArrowLeft") {
				newStart = activeRegion.start;
				newEnd = activeRegion.end - 0.05;
			} else {
				newStart = activeRegion.start;
				newEnd = activeRegion.end + 0.05;
			}
		}

		activeRegion.setOptions({
			start: newStart,
			end: newEnd
		});

		trimDuration = activeRegion.end - activeRegion.start;
	};

	$effect(() => {
		if (trimRegion) {
			const handleKeydown = (e: KeyboardEvent): void => {
				if (e.key === "ArrowLeft") {
					adjustRegionHandles(activeHandle, "ArrowLeft");
				} else if (e.key === "ArrowRight") {
					adjustRegionHandles(activeHandle, "ArrowRight");
				}
			};
			window.addEventListener("keydown", handleKeydown);
			return () => {
				window.removeEventListener("keydown", handleKeydown);
			};
		}
	});
</script>

<div class="controls" data-testid="waveform-controls">
	<div class="control-wrapper">
		<button
			class="action icon volume"
			style:color={show_volume_slider
				? "var(--color-accent)"
				: "var(--neutral-400)"}
			aria-label="Adjust volume"
			on:click={() => (show_volume_slider = !show_volume_slider)}
		>
			<VolumeLevels {currentVolume} />
		</button>

		{#if show_volume_slider}
			<VolumeControl bind:currentVolume bind:show_volume_slider {waveform} />
		{/if}

		<button
			class:hidden={show_volume_slider}
			class="playback icon"
			aria-label={`Adjust playback speed to ${
				playbackSpeeds[
					(playbackSpeeds.indexOf(playbackSpeed) + 1) % playbackSpeeds.length
				]
			}x`}
			on:click={() => {
				playbackSpeed =
					playbackSpeeds[
						(playbackSpeeds.indexOf(playbackSpeed) + 1) % playbackSpeeds.length
					];

				waveform?.setPlaybackRate(playbackSpeed);
			}}
		>
			<span>{playbackSpeed}x</span>
		</button>
	</div>

	<div class="play-pause-wrapper">
		<button
			class="rewind icon"
			aria-label={`Skip backwards by ${get_skip_rewind_amount(
				audio_duration,
				waveform_options.skip_length
			)} seconds`}
			on:click={() =>
				waveform?.skip(
					get_skip_rewind_amount(audio_duration, waveform_options.skip_length) *
						-1
				)}
		>
			<Backward />
		</button>
		<button
			class="play-pause-button icon"
			on:click={() => waveform?.playPause()}
			aria-label={playing ? i18n("audio.pause") : i18n("audio.play")}
		>
			{#if playing}
				<Pause />
			{:else}
				<Play />
			{/if}
		</button>
		<button
			class="skip icon"
			aria-label="Skip forward by {get_skip_rewind_amount(
				audio_duration,
				waveform_options.skip_length
			)} seconds"
			on:click={() =>
				waveform?.skip(
					get_skip_rewind_amount(audio_duration, waveform_options.skip_length)
				)}
		>
			<Forward />
		</button>
	</div>

	<div class="settings-wrapper">
		{#if show_subtitles}
			<button
				class="action icon cc-button"
				data-testid="subtitles-toggle"
				style="color: {subtitles_toggle
					? 'var(--color-accent)'
					: 'var(--neutral-400)'}"
				on:click={toggleSubtitles}
			>
				<ClosedCaption /></button
			>
		{/if}
		{#if editable && interactive}
			{#if show_redo && mode === ""}
				<button
					class="action icon"
					aria-label="Reset audio"
					on:click={() => {
						handle_reset_value();
						clearRegions();
						mode = "";
					}}
				>
					<Undo />
				</button>
			{/if}

			{#if mode === ""}
				<button
					class="action icon"
					aria-label="Trim audio to selection"
					on:click={toggleTrimmingMode}
				>
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
		align-items: center;
		grid-area: editing;
	}
	.text-button {
		border: 1px solid var(--neutral-400);
		border-radius: var(--radius-sm);
		font-weight: 300;
		font-size: var(--size-3);
		text-align: center;
		color: var(--neutral-400);
		height: var(--size-5);
		font-weight: bold;
		padding: 0 5px;
		margin-left: 5px;
	}

	.text-button:hover,
	.text-button:focus {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.controls {
		display: grid;
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-areas: "controls playback editing";
		margin-top: 5px;
		align-items: center;
		position: relative;
		flex-wrap: wrap;
		justify-content: space-between;
	}
	.controls div {
		margin: var(--size-1) 0;
	}

	@media (max-width: 600px) {
		.controls {
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto auto;
			grid-template-areas:
				"playback playback"
				"controls editing";
		}
	}

	@media (max-width: 319px) {
		.controls {
			overflow-x: scroll;
		}
	}

	.hidden {
		display: none;
	}

	.control-wrapper {
		display: flex;
		justify-self: self-start;
		align-items: center;
		justify-content: space-between;
		grid-area: controls;
	}

	.action {
		width: var(--size-5);
		color: var(--neutral-400);
		margin-left: var(--spacing-md);
	}
	.icon:hover,
	.icon:focus {
		color: var(--color-accent);
	}
	.play-pause-wrapper {
		display: flex;
		justify-self: center;
		grid-area: playback;
	}
	.cc-button {
		width: var(--size-8);
	}

	@media (max-width: 600px) {
		.play-pause-wrapper {
			margin: var(--spacing-md);
		}
	}
	.playback {
		border: 1px solid var(--neutral-400);
		border-radius: var(--radius-sm);
		width: 5.5ch;
		font-weight: 300;
		font-size: var(--size-3);
		text-align: center;
		color: var(--neutral-400);
		height: var(--size-5);
		font-weight: bold;
	}

	.playback:hover,
	.playback:focus {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.rewind,
	.skip {
		margin: 0 10px;
		color: var(--neutral-400);
	}

	.play-pause-button {
		width: var(--size-8);
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--neutral-400);
		fill: var(--neutral-400);
	}

	.volume {
		position: relative;
		display: flex;
		justify-content: center;
		margin-right: var(--spacing-xl);
		width: var(--size-5);
	}
</style>
