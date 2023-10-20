<script lang="ts">
	import { onMount } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import { skipAudio, trimAudioBlob } from "../shared/utils";
	import Record from "wavesurfer.js/dist/plugins/record.js";
	import WaveformControls from "../shared/WaveformControls.svelte";
	import WaveformRecordControls from "../shared/WaveformRecordControls.svelte";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	// @ts-ignore
	import getWaveBlob from "wav-blob-util";

	export let label: string;
	// export let autoplay: boolean;
	export let i18n: I18nFormatter;
	export let dispatch: (event: any, detail?: any) => void;
	export let dispatch_blob: (
		blobs: Uint8Array[] | Blob[],
		event: any
	) => Promise<void> | undefined;
	export let waveformColor = "#9ca3af";
	export let waveformProgressColor = "#f97316";
	export let showMediaControls = false;

	// waveform
	let micWaveform: WaveSurfer;
	let recordingWaveform: WaveSurfer;
	let playing = false;

	// recording
	let record: Record;
	let recordedAudio: string | null = null;

	// timestamps
	let timeRef: HTMLTimeElement;
	let durationRef: HTMLTimeElement;
	let audioDuration: number;

	// trimming
	let trimmingMode = false;
	let trimDuration = 0;

	// timing
	let seconds = 0;
	let interval: NodeJS.Timeout;
	let timing = false;

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
		let waveformCanvas = document.getElementById("mic");
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
		const recording = document.getElementById("recordings");
		recordedAudio = null;
		if (recording) recording.innerHTML = "";
		dispatch("clear");
	};

	const create_mic_waveform = (): void => {
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
			mediaControls: showMediaControls,
		});

		record = micWaveform.registerPlugin(RecordPlugin.create());
	};

	const create_recording_waveform = (): void => {
		if (!recordedAudio) return;
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
	};

	onMount(() => {
		create_mic_waveform();
	});

	$: record &&
		record.on("record-end", (blob) => {
			recordedAudio = URL.createObjectURL(blob);

			const recorder = document.getElementById("mic");
			const recording = document.getElementById("recordings");

			if (recorder) recorder.style.display = "none";

			if (recording) {
				recording.innerHTML = "";
				create_recording_waveform();
			}
		});

	const handle_trim_audio = async (
		start: number,
		end: number
	): Promise<void> => {
		trimmingMode = false;
		const decodedData = recordingWaveform.getDecodedData();
		if (decodedData)
			await trimAudioBlob(decodedData, start, end).then(
				async (trimmedBlob: Blob) => {
					const wavBlob = await getWaveBlob(trimmedBlob);
					await dispatch_blob([wavBlob], "change");
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
	<div id="mic" data-testid={label || "unlabelled" + "-audio"} />
	<div id="recordings" />

	{#if timing || recordedAudio}
		<div id="timestamps">
			<time bind:this={timeRef} id="time">0:00</time>
			<div>
				{#if trimmingMode && trimDuration > 0}
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
			bind:trimmingMode
			{clear_recording}
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

	#trim-duration {
		color: var(--color-accent);
		margin-right: var(--spacing-sm);
	}
</style>
