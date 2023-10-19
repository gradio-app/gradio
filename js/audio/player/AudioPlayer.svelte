<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";

	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { Music } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import { skipAudio, trimAudioBlob } from "../shared/utils";
	import WaveformControls from "../shared/WaveformControls.svelte";
	import { Empty } from "@gradio/atoms";
	// @ts-ignore
	import audiobufferToBlob from "audiobuffer-to-blob";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let autoplay: boolean;
	export let i18n: I18nFormatter;
	export let dispatch: (event: string, detail?: any) => void;
	export let interactive = false;

	export let waveformColor = "#9ca3af";
	export let waveformProgressColor = "#f97316";
	export let showMediaControls = false;

	let container: HTMLDivElement;
	let waveform: WaveSurfer;
	let playing = false;

	let timeRef: HTMLTimeElement;
	let durationRef: HTMLTimeElement;
	let audioDuration: number;

	let trimmingMode = false;
	let trimDuration = 0;

	let updatedAudio: string | null = null;

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const secondsRemainder = Math.round(seconds) % 60;
		const paddedSeconds = `0${secondsRemainder}`.slice(-2);
		return `${minutes}:${paddedSeconds}`;
	};

	const create_waveform = (): void => {
		waveform = WaveSurfer.create({
			height: 50,
			container: container,
			waveColor: waveformColor || "#9ca3af",
			progressColor: waveformProgressColor || "#f97316",
			url: updatedAudio || value?.data,
			barWidth: 2,
			barGap: 3,
			barHeight: 4,
			cursorWidth: 2,
			cursorColor: "#ddd5e9",
			barRadius: 10,
			dragToSeek: true,
			mediaControls: showMediaControls,
		});
	};

	$: if (container !== undefined) {
		if (waveform !== undefined) waveform.destroy();
		container.innerHTML = "";
		create_waveform();
		playing = false;
	}

	$: if (autoplay) {
		waveform?.play();
		playing = true;
	}

	$: waveform?.on("decode", (duration: any) => {
		audioDuration = duration;
		durationRef && (durationRef.textContent = formatTime(duration));
	});

	$: waveform?.on(
		"timeupdate",
		(currentTime: any) =>
			timeRef && (timeRef.textContent = formatTime(currentTime))
	);

	$: waveform?.on("finish", () => {
		playing = false;
		dispatch("stop");
		dispatch("end");
	});
	$: waveform?.on("pause", () => {
		playing = false;
		dispatch("pause");
	});
	$: waveform?.on("play", () => {
		playing = true;
		dispatch("play");
	});

	const handle_trim_audio = async (
		start: number,
		end: number
	): Promise<void> => {
		trimmingMode = false;
		await trimAudioBlob(
			audiobufferToBlob(waveform.getDecodedData()),
			start,
			end
		).then((trimmedBlob: Blob) => {
			updatedAudio = URL.createObjectURL(trimmedBlob);
			waveform.destroy();
			create_waveform();
		});
	};

	onMount(() => {
		window.addEventListener("keydown", (e) => {
			if (e.key === "ArrowRight") {
				skipAudio(waveform, 0.1);
			} else if (e.key === "ArrowLeft") {
				skipAudio(waveform, -0.1);
			}
		});
	});
</script>

{#if value === null}
	<Empty size="small">
		<Music />
	</Empty>
{:else}
	<div class="component-wrapper" data-testid={`${label || "unlabelled"}-audio`}>
		<div class="waveform-container">
			<div
				id="waveform"
				data-testid={{ label } || "unlabelled" + "-audio"}
				bind:this={container}
			/>
		</div>

		<div class="timestamps">
			<time bind:this={timeRef} id="time">0:00</time>
			<div>
				{#if trimmingMode && trimDuration > 0}
					<time id="trim-duration">{formatTime(trimDuration)}</time>
				{/if}
				<time bind:this={durationRef} id="duration">0:00</time>
			</div>
		</div>

		<WaveformControls
			{waveform}
			{playing}
			{audioDuration}
			{i18n}
			{interactive}
			{handle_trim_audio}
			bind:trimmingMode
			bind:trimDuration
		/>
	</div>
{/if}

<style>
	.component-wrapper {
		padding: var(--size-3);
	}

	.timestamps {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: var(--size-1) 0;
	}

	#time {
		color: var(--neutral-400);
	}

	#duration {
		color: var(--neutral-400);
	}

	#trim-duration {
		color: var(--color-accent);
		margin-right: var(--spacing-sm);
	}
	.waveform-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-full);
	}

	#waveform {
		width: 100%;
		height: 100%;
		position: relative;
	}
</style>
