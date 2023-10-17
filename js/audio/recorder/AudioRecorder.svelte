<script context="module" lang="ts">
	import type { FileData } from "@gradio/upload";

	export interface AudioData extends FileData {
		crop_min?: number;
		crop_max?: number;
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import { skipAudio } from "../shared/utils";
	import Record from "wavesurfer.js/dist/plugins/record.js";
	import WaveformControls from "../shared/WaveformControls.svelte";
	import { Empty } from "@gradio/atoms";
	import WaveformRecordControls from "../shared/WaveformRecordControls.svelte";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";

	// export let value: null | { name: string; data: string } = null;
	export let label: string;
	// export let autoplay: boolean;
	export let i18n: I18nFormatter;
	// export let interactive: boolean;
	export let dispatch: (event: string, detail?: any) => void;

	export let waveformColor = "#9ca3af";
	export let waveformProgressColor = "#f97316";

	let micWaveform: WaveSurfer;

	let recordingWaveform: WaveSurfer;
	let playing = false;

	let record: Record;
	let recordedAudio: string | null = null;
	// let waveformRegions: Regions;

	let timeRef: HTMLTimeElement;
	let durationRef: HTMLTimeElement;
	let audioDuration: number;

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const secondsRemainder = Math.round(seconds) % 60;
		const paddedSeconds = `0${secondsRemainder}`.slice(-2);
		return `${minutes}:${paddedSeconds}`;
	};

	$: record?.on("record-start", () => {
		dispatch("start_recording");
		let waveformCanvas = document.getElementById("mic");
		if (waveformCanvas) waveformCanvas.style.display = "block";
	});

	$: recordingWaveform?.on("decode", (duration: any) => {
		audioDuration = duration;
		durationRef && (durationRef.textContent = formatTime(duration));
	});

	$: recordingWaveform?.on(
		"timeupdate",
		(currentTime: any) =>
			timeRef && (timeRef.textContent = formatTime(currentTime))
	);

	$: recordingWaveform?.on("pause", () => {
		dispatch("pause");
		playing = false;
	});

	$: recordingWaveform?.on("play", () => {
		dispatch("play");
		playing = true;
	});

	$: recordingWaveform?.on("finish", () => {
		dispatch("stop_recording");
		playing = false;
	});

	const clearRecording = (): void => {
		const recording = document.getElementById("recordings");
		recordedAudio = null;

		if (recording) recording.innerHTML = "";

		dispatch("clear");
	};

	const createMicWaveform = (): void => {
		const recorder = document.getElementById("mic");

		if (micWaveform !== undefined) micWaveform.destroy();
		if (recorder) recorder.innerHTML = "";

		micWaveform = WaveSurfer.create({
			height: 50,
			container: "#mic",
			waveColor: waveformColor || "#9ca3af",
			progressColor: waveformProgressColor || "#f97316",
			barWidth: 2,
			barGap: 3,
			barHeight: 4,
			cursorWidth: 2,
			cursorColor: "#ddd5e9",
			barRadius: 10,
			dragToSeek: true,
		});

		record = micWaveform.registerPlugin(RecordPlugin.create());
	};

	onMount(() => {
		createMicWaveform();
	});

	$: record &&
		record.once("record-end", (blob) => {
			recordedAudio = URL.createObjectURL(blob);
			const recorder = document.getElementById("mic");
			const recording = document.getElementById("recordings");

			if (recorder) recorder.style.display = "none";

			if (recording) {
				recording.innerHTML = "";
				recordingWaveform = WaveSurfer.create({
					height: 50,
					container: "#recordings",
					waveColor: waveformColor || "#9ca3af",
					progressColor: waveformProgressColor || "#f97316",
					barWidth: 2,
					barGap: 3,
					barHeight: 4,
					cursorWidth: 2,
					cursorColor: "#ddd5e9",
					barRadius: 10,
					dragToSeek: true,
					url: recordedAudio,
				});

				// Download link
				// const link = container.appendChild(document.createElement("a"));
				// Object.assign(link, {
				// 	href: recordedUrl,
				// 	download:
				// 		"recording." + blob.type.split(";")[0].split("/")[1] || "webm",
				// 	textContent: "Download recording",
				// });
			}
		});

	onMount(() => {
		window.addEventListener("keydown", (e) => {
			if (e.key === "ArrowRight") {
				skipAudio(recordingWaveform, 0.1);
			} else if (e.key === "ArrowLeft") {
				skipAudio(recordingWaveform, -0.1);
			}
		});
	});
</script>

<div class="component-wrapper">
	<div id="mic" data-testid={label || "unlabelled" + "-audio"} />
	<div id="recordings" />

	{#if micWaveform && !recordedAudio}
		<WaveformRecordControls bind:record {i18n} {dispatch} />
	{/if}

	{#if recordedAudio}
		<div id="timestamps">
			<time bind:this={timeRef} id="time">0:00</time>
			<time bind:this={durationRef} id="duration">0:00</time>
		</div>
	{/if}

	{#if recordedAudio}
		<WaveformControls
			bind:waveform={recordingWaveform}
			{playing}
			{audioDuration}
			{i18n}
			{clearRecording}
			showRedo
		/>
	{/if}
</div>

<style>
	#mic {
		width: 100%;
		display: none;
	}

	.component-wrapper {
		padding: var(--size-3);
	}

	#timestamps {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: var(--size-1) 0;
		margin: var(--spacing-md) 0;
	}

	#time {
		color: var(--neutral-400);
	}

	#duration {
		color: var(--neutral-400);
	}
</style>
