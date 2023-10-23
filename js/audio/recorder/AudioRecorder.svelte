<script lang="ts">
	import { onMount } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import { skipAudio, trimAudioBlob } from "../shared/utils";
	import Record from "wavesurfer.js/dist/plugins/record.js";
	import WaveformControls from "../shared/WaveformControls.svelte";
	import WaveformRecordControls from "../shared/WaveformRecordControls.svelte";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	import type { WaveformOptions } from "../shared/types";

	export let label: string;
	export let mode: string;
	export let i18n: I18nFormatter;
	export let dispatch: (event: any, detail?: any) => void;
	export let dispatch_blob: (
		blobs: Uint8Array[] | Blob[],
		event: string
	) => Promise<void> | undefined;
	export let waveformOptions: WaveformOptions;

	let micWaveform: WaveSurfer;
	let recordingWaveform: WaveSurfer;
	let playing = false;

	let record: Record;
	let recordedAudio: string | null = null;

	// timestamps
	let timeRef: HTMLTimeElement;
	let durationRef: HTMLTimeElement;
	let audioDuration: number;
	let seconds = 0;
	let interval: NodeJS.Timeout;
	let timing = false;
	// trimming
	let trimDuration = 0;

	const start_interval = (): void => {
		clearInterval(interval);
		interval = setInterval(() => {
			seconds++;
		}, 1000);
	};

	const format_time = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const secondsRemainder = Math.round(seconds) % 60;
		const paddedSeconds = `0${secondsRemainder}`.slice(-2);
		return `${minutes}:${paddedSeconds}`;
	};

	$: record?.on("record-start", () => {
		start_interval();
		timing = true;
		dispatch("start_recording");
		let waveformCanvas = document.getElementById("microphone");
		if (waveformCanvas) waveformCanvas.style.display = "block";
	});

	$: record?.on("record-end", () => {
		seconds = 0;
		timing = false;
		clearInterval(interval);
		dispatch("stop_recording");
	});

	$: record?.on("record-pause", () => {
		dispatch("pause_recording");
		clearInterval(interval);
	});

	$: record?.on("record-resume", () => {
		start_interval();
	});

	$: recordingWaveform?.on("decode", (duration: any) => {
		audioDuration = duration;
		durationRef && (durationRef.textContent = format_time(duration));
	});

	$: recordingWaveform?.on(
		"timeupdate",
		(currentTime: any) =>
			timeRef && (timeRef.textContent = format_time(currentTime))
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
		dispatch("stop");
		dispatch("end");
		playing = false;
	});

	const clear_recording = (): void => {
		const recording = document.getElementById("recording");
		recordedAudio = null;
		recording.innerHTML = "";
		dispatch("clear");
	};

	const waveformSettings = {
		height: 50,
		waveColor: waveformOptions.waveformColor || "#9ca3af",
		progressColor: waveformOptions.waveformProgressColor || "#f97316",
		barWidth: 2,
		barGap: 3,
		barHeight: 4,
		cursorWidth: 2,
		cursorColor: "#ddd5e9",
		barRadius: 10,
		dragToSeek: true,
		mediaControls: waveformOptions.showMediaControls,
	};

	const create_mic_waveform = (): void => {
		const recorder = document.getElementById("mic");
		if (micWaveform !== undefined) micWaveform.destroy();
		if (recorder) recorder.innerHTML = "";

		micWaveform = WaveSurfer.create({
			waveColor: waveformOptions.waveformColor || "#9ca3af",
			progressColor: waveformOptions.waveformProgressColor || "#f97316",
			container: "#microphone",
			...waveformSettings,
		});

		record = micWaveform.registerPlugin(RecordPlugin.create());
	};

	const create_recording_waveform = (): void => {
		let recording = document.getElementById("recording");
		if (!recordedAudio || !recording) return;
		recordingWaveform = WaveSurfer.create({
			container: recording,
			url: recordedAudio,
			...waveformSettings,
		});
	};

	onMount(() => {
		create_mic_waveform();
	});

	$: record?.on("record-end", (blob) => {
		recordedAudio = URL.createObjectURL(blob);

		const microphone = document.getElementById("microphone");
		const recording = document.getElementById("recording");

		if (microphone) microphone.style.display = "none";
		if (recording && recordedAudio) {
			recording.innerHTML = "";
			create_recording_waveform();
		}
	});

	const handle_trim_audio = async (
		start: number,
		end: number
	): Promise<void> => {
		mode = "edit";
		const decodedData = recordingWaveform.getDecodedData();
		if (decodedData)
			await trimAudioBlob(decodedData, start, end).then(
				async (trimmedBlob: Blob) => {
					await dispatch_blob([trimmedBlob], "change");
					recordingWaveform.destroy();
					create_recording_waveform();
				}
			);
		dispatch("edit");
	};

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
	<div id="microphone" data-testid={label || "unlabelled" + "-audio"} />
	<div id="recording" />

	{#if timing || recordedAudio}
		<div id="timestamps">
			<time bind:this={timeRef} id="time">0:00</time>
			<div>
				{#if mode === "edit" && trimDuration > 0}
					<time id="trim-duration">{format_time(trimDuration)}</time>
				{/if}
				{#if timing}
					<time id="duration">{format_time(seconds)}</time>
				{:else}
					<time bind:this={durationRef} id="duration">0:00</time>
				{/if}
			</div>
		</div>
	{/if}

	{#if micWaveform && !recordedAudio}
		<WaveformRecordControls bind:record {i18n} {dispatch} />
	{/if}

	{#if recordedAudio}
		<WaveformControls
			bind:waveform={recordingWaveform}
			{playing}
			{audioDuration}
			{i18n}
			interactive={true}
			{handle_trim_audio}
			bind:trimDuration
			bind:mode
			{clear_recording}
			showRedo
		/>
	{/if}
</div>

<style>
	#microphone {
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

	#trim-duration {
		color: var(--color-accent);
		margin-right: var(--spacing-sm);
	}
</style>
