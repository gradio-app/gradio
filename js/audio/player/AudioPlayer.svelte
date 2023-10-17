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
	import { skipAudio } from "../shared/utils";
	import WaveformControls from "../shared/WaveformControls.svelte";
	import { Empty } from "@gradio/atoms";

	export let value: null | { name: string; data: string } = null;
	export let label: string;
	export let autoplay: boolean;
	export let i18n: I18nFormatter;
	export let dispatch: (event: string, detail?: any) => void;
	export let interactive = false;

	export let waveformColor = "#9ca3af";
	export let waveformProgressColor = "#f97316";

	let container: HTMLDivElement;
	let waveform: WaveSurfer;
	let playing = false;

	let timeRef: HTMLTimeElement;
	let durationRef: HTMLTimeElement;
	let audioDuration: number;

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const secondsRemainder = Math.round(seconds) % 60;
		const paddedSeconds = `0${secondsRemainder}`.slice(-2);
		return `${minutes}:${paddedSeconds}`;
	};

	function handle_ended(): void {
		dispatch("stop");
		dispatch("end");
	}

	$: if (container !== undefined) {
		if (waveform !== undefined) waveform.destroy();
		container.innerHTML = "";
		waveform = WaveSurfer.create({
			height: 50,
			container: container,
			waveColor: waveformColor || "#9ca3af",
			progressColor: waveformProgressColor || "#f97316",
			url: value?.data,
			barWidth: 2,
			barGap: 3,
			barHeight: 4,
			cursorWidth: 2,
			cursorColor: "#ddd5e9",
			barRadius: 10,
			dragToSeek: true,
		});

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
		handle_ended();
		playing = false;
	});
	$: waveform?.on("pause", () => {
		dispatch("pause");
		playing = false;
	});
	$: waveform?.on("play", () => {
		dispatch("play");
		playing = true;
	});

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
			<time bind:this={durationRef} id="duration">0:00</time>
		</div>

		<WaveformControls
			{waveform}
			{playing}
			{audioDuration}
			{i18n}
			{interactive}
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
