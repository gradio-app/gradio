<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher } from "svelte";
	import WaveSurfer from "wavesurfer.js";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	import { format_time } from "@gradio/utils";
	import { process_audio } from "./utils";
	import type { FileData } from "@gradio/client";

	export let label: string;
	export let waveform_settings: Record<string, any> = {};
	export let recording = false;

	const dispatch = createEventDispatcher<{
		change: FileData;
		stop_recording: undefined;
		clear: undefined;
	}>();

	let container: HTMLDivElement;
	let waveform: WaveSurfer | undefined;
	let record: RecordPlugin | undefined;
	let seconds = 0;
	let interval: NodeJS.Timeout;
	let is_recording = false;
	let has_started = false;

	const start_interval = (): void => {
		clearInterval(interval);
		interval = setInterval(() => {
			seconds++;
		}, 1000);
	};

	const create_waveform = async (): Promise<void> => {
		if (!container) return;

		if (waveform) {
			waveform.destroy();
		}

		const accentColor =
			getComputedStyle(document.documentElement).getPropertyValue(
				"--color-accent"
			) || "#ff7c00";

		waveform = WaveSurfer.create({
			container,
			height: 32,
			waveColor: "rgba(128, 128, 128, 0.5)",
			progressColor: accentColor,
			cursorColor: "transparent",
			barWidth: 2,
			barGap: 2,
			barRadius: 2,
			interact: false,
			hideScrollbar: true,
			...waveform_settings
		});

		record = waveform.registerPlugin(
			RecordPlugin.create({
				scrollingWaveform: true,
				scrollingWaveformWindow: 7,
				renderRecordedAudio: false
			})
		);

		record.on("record-start", () => {
			start_interval();
			is_recording = true;
			has_started = true;
		});

		record.on("record-end", async (blob: Blob) => {
			clearInterval(interval);
			is_recording = false;

			try {
				const array_buffer = await blob.arrayBuffer();
				const context = new AudioContext({
					sampleRate: waveform_settings.sampleRate || 44100
				});
				const audio_buffer = await context.decodeAudioData(array_buffer);

				if (audio_buffer) {
					const audio = await process_audio(audio_buffer);
					const audio_blob = new Blob([audio], { type: "audio/wav" });
					const url = URL.createObjectURL(audio_blob);

					const file_data: FileData = {
						url,
						path: "audio.wav",
						orig_name: "audio.wav",
						size: audio.length,
						mime_type: "audio/wav",
						is_stream: false,
						meta: { _type: "gradio.FileData" }
					};

					dispatch("change", file_data);
					dispatch("stop_recording");
				}
			} catch (e) {
				console.error("Error processing audio:", e);
			}
		});
	};

	onMount(async () => {
		await create_waveform();
	});

	onDestroy(() => {
		clearInterval(interval);
		if (record) {
			record.stopMic();
		}
		if (waveform) {
			waveform.destroy();
		}
	});

	$: if (recording && !is_recording && record && has_started === false) {
		record.startMic().then(() => {
			record?.startRecording();
		});
	} else if (!recording && is_recording && record) {
		record.stopRecording();
		seconds = 0;
	}

	const toggleRecording = (): void => {
		if (!record) return;

		if (is_recording) {
			record.stopRecording();
		} else {
			record.startMic().then(() => {
				record?.startRecording();
			});
		}
	};
</script>

<div
	class="minimal-audio-recorder"
	aria-label={label || "Audio Recorder"}
	data-testid="minimal-audio-recorder"
>
	<div class="waveform-wrapper" bind:this={container}></div>

	<div class="timestamp">{format_time(seconds)}</div>
</div>

<style>
	.minimal-audio-recorder {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		border-radius: var(--radius-sm);
		width: 100%;
		padding: var(--spacing-sm);
	}

	.waveform-wrapper {
		flex: 1 1 auto;
		width: auto;
	}

	.waveform-wrapper :global(::part(wrapper)) {
		margin-bottom: 0;
	}

	.timestamp {
		font-size: 13px;
		font-weight: 500;
		color: var(--body-text-color);
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
		min-width: 40px;
		text-align: center;
	}

	@media (prefers-reduced-motion: reduce) {
		.record-btn {
			transition: none;
		}
		.record-btn.recording {
			animation: none;
		}
	}
</style>
