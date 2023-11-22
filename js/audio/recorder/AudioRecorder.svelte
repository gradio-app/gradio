<script lang="ts">
	import { onMount } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";
	import WaveSurfer from "wavesurfer.js";
	import { skipAudio, process_audio } from "../shared/utils";
	import WSRecord from "wavesurfer.js/dist/plugins/record.js";
	import WaveformControls from "../shared/WaveformControls.svelte";
	import WaveformRecordControls from "../shared/WaveformRecordControls.svelte";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	import type { WaveformOptions } from "../shared/types";

	export let mode: string;
	export let i18n: I18nFormatter;
	export let dispatch_blob: (
		blobs: Uint8Array[] | Blob[],
		event: "stream" | "change" | "stop_recording"
	) => Promise<void> | undefined;
	export let waveform_settings: Record<string, any>;
	export let waveform_options: WaveformOptions;
	export let handle_reset_value: () => void;

	let micWaveform: WaveSurfer;
	let recordingWaveform: WaveSurfer;
	let playing = false;

	let recordingContainer: HTMLDivElement;
	let microphoneContainer: HTMLDivElement;

	let record: WSRecord;
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

	const dispatch = createEventDispatcher<{
		start_recording: undefined;
		pause_recording: undefined;
		stop_recording: undefined;
		stop: undefined;
		play: undefined;
		pause: undefined;
		end: undefined;
		edit: undefined;
	}>();

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
		let waveformCanvas = microphoneContainer;
		if (waveformCanvas) waveformCanvas.style.display = "block";
	});

	$: record?.on("record-end", async (blob) => {
		seconds = 0;
		timing = false;
		clearInterval(interval);
		const array_buffer = await blob.arrayBuffer();
		const context = new AudioContext();
		const audio_buffer = await context.decodeAudioData(array_buffer);

		if (audio_buffer)
			await process_audio(audio_buffer).then(async (audio: Uint8Array) => {
				await dispatch_blob([audio], "change");
				await dispatch_blob([audio], "stop_recording");
			});
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
		playing = false;
	});

	const create_mic_waveform = (): void => {
		const recorder = microphoneContainer;
		if (recorder) recorder.innerHTML = "";
		if (micWaveform !== undefined) micWaveform.destroy();
		if (!recorder) return;
		micWaveform = WaveSurfer.create({
			...waveform_settings,
			normalize: false,
			container: recorder
		});

		record = micWaveform.registerPlugin(RecordPlugin.create());
		record.startMic();
	};

	const create_recording_waveform = (): void => {
		let recording = recordingContainer;
		if (!recordedAudio || !recording) return;
		recordingWaveform = WaveSurfer.create({
			container: recording,
			url: recordedAudio,
			...waveform_settings
		});
	};

	$: record?.on("record-end", (blob) => {
		recordedAudio = URL.createObjectURL(blob);

		const microphone = microphoneContainer;
		const recording = recordingContainer;

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
			await process_audio(decodedData, start, end).then(
				async (trimmedAudio: Uint8Array) => {
					await dispatch_blob([trimmedAudio], "change");
					await dispatch_blob([trimmedAudio], "stop_recording");
					recordingWaveform.destroy();
					create_recording_waveform();
				}
			);
		dispatch("edit");
	};

	onMount(() => {
		create_mic_waveform();

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
	<div
		class="microphone"
		bind:this={microphoneContainer}
		data-testid="microphone-waveform"
	/>
	<div bind:this={recordingContainer} data-testid="recording-waveform" />

	{#if timing || recordedAudio}
		<div class="timestamps">
			<time bind:this={timeRef} class="time">0:00</time>
			<div>
				{#if mode === "edit" && trimDuration > 0}
					<time class="trim-duration">{format_time(trimDuration)}</time>
				{/if}
				{#if timing}
					<time class="duration">{format_time(seconds)}</time>
				{:else}
					<time bind:this={durationRef} class="duration">0:00</time>
				{/if}
			</div>
		</div>
	{/if}

	{#if micWaveform && !recordedAudio}
		<WaveformRecordControls bind:record {i18n} />
	{/if}

	{#if recordingWaveform && recordedAudio}
		<WaveformControls
			bind:waveform={recordingWaveform}
			container={recordingContainer}
			{playing}
			{audioDuration}
			{i18n}
			interactive={true}
			{handle_trim_audio}
			bind:trimDuration
			bind:mode
			showRedo
			{handle_reset_value}
			{waveform_options}
		/>
	{/if}
</div>

<style>
	.microphone {
		width: 100%;
		display: none;
	}

	.component-wrapper {
		padding: var(--size-3);
	}

	.timestamps {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: var(--size-1) 0;
		margin: var(--spacing-md) 0;
	}

	.time {
		color: var(--neutral-400);
	}

	.duration {
		color: var(--neutral-400);
	}

	.trim-duration {
		color: var(--color-accent);
		margin-right: var(--spacing-sm);
	}
</style>
