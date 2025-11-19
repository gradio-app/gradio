<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher, tick } from "svelte";
	import WaveSurfer from "wavesurfer.js";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	import { format_time } from "@gradio/utils";
	import { process_audio } from "./utils";
	import { prepare_files, type FileData, type Client } from "@gradio/client";
	import { Square } from "@gradio/icons";

	export let label: string;
	export let waveform_settings: Record<string, any> = {};
	export let recording = false;
	export let upload: Client["upload"];
	export let root: string;
	export let max_file_size: number | null = null;
	export let upload_promise: Promise<any> | null = null;

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
	let mic_devices: MediaDeviceInfo[] = [];
	let selected_device_id: string = "";
	let show_device_selection = false;

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

			upload_promise = (async () => {
				try {
					const array_buffer = await blob.arrayBuffer();
					const context = new AudioContext({
						sampleRate: waveform_settings.sampleRate || 44100
					});
					const audio_buffer = await context.decodeAudioData(array_buffer);

					if (audio_buffer) {
						const audio = await process_audio(audio_buffer);
						const audio_blob = new File([audio], "audio.wav", {
							type: "audio/wav"
						});

						const prepared_files = await prepare_files([audio_blob], false);
						const uploaded_files = await upload(
							prepared_files,
							root,
							undefined,
							max_file_size || undefined
						);
						const file_data = uploaded_files?.[0];

						if (file_data) {
							dispatch("change", file_data);
						}
					}
				} catch (e) {
					console.error("Error processing audio:", e);
				} finally {
					dispatch("stop_recording");
					upload_promise = null;
				}
			})();

			await upload_promise;
		});
	};

	onMount(async () => {
		try {
			const devices = await RecordPlugin.getAvailableAudioDevices();
			mic_devices = devices.filter((device) => device.deviceId);
			if (mic_devices.length > 0) {
				selected_device_id = mic_devices[0].deviceId;
			}

			if (mic_devices.length > 1) {
				show_device_selection = true;
			} else {
				await create_waveform();
			}
		} catch (err) {
			await create_waveform();
		}
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

	$: if (
		recording &&
		!is_recording &&
		record &&
		has_started === false &&
		mic_devices.length <= 1
	) {
		record.startMic({ deviceId: selected_device_id }).then(() => {
			record?.startRecording();
		});
	} else if (!recording && is_recording && record) {
		record.stopRecording();
		seconds = 0;
	}

	async function startRecording(): Promise<void> {
		show_device_selection = false;
		has_started = true;

		await tick();
		await create_waveform();

		if (!record) return;

		try {
			await record.startMic({ deviceId: selected_device_id });
			record.startRecording();
		} catch (err) {
			console.error("Error starting recording:", err);
			show_device_selection = mic_devices.length > 1;
			has_started = false;
			recording = false;
		}
	}
</script>

<div
	class="minimal-audio-recorder"
	aria-label={label || "Audio Recorder"}
	data-testid="minimal-audio-recorder"
>
	{#if show_device_selection}
		<div class="device-selection-wrapper">
			{#if mic_devices.length > 1}
				<select
					bind:value={selected_device_id}
					class="device-select-large"
					aria-label="Select input device"
				>
					{#each mic_devices as device}
						<option value={device.deviceId}>{device.label}</option>
					{/each}
				</select>
			{/if}
			<button
				class="record-button"
				on:click={startRecording}
				aria-label="Start recording"
			>
			</button>
		</div>
	{:else}
		<div class="waveform-wrapper" bind:this={container}></div>
		<div class="timestamp">{format_time(seconds)}</div>
		<button
			class="stop-button"
			on:click={() => {
				recording = false;
			}}
			aria-label="Stop recording"
		>
			<Square />
		</button>
	{/if}
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

	.device-selection-wrapper {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		width: 100%;
	}

	.waveform-wrapper {
		flex: 1 1 auto;
		min-width: 0;
		width: 100%;
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

	.device-select-large {
		max-width: var(--size-60);
		font-size: var(--text-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		background: var(--background-fill-secondary);
		color: var(--body-text-color);
		cursor: pointer;
		height: var(--size-9);
	}

	.record-button {
		display: flex;
		align-items: center;
		justify-content: center;
		height: var(--size-9);
		width: var(--size-9);
		padding: 0;
		flex-shrink: 0;
		background-color: var(--block-background-fill);
		color: var(--body-text-color);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		cursor: pointer;
	}

	.record-button::before {
		content: "";
		height: var(--size-4);
		width: var(--size-4);
		border-radius: var(--radius-full);
		background: var(--primary-600);
		flex-shrink: 0;
	}

	.record-button:hover {
		background-color: var(--block-background-fill);
		border-color: var(--border-color-accent);
	}

	.record-button:active {
		transform: scale(0.98);
	}

	.stop-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-9);
		height: var(--size-9);
		padding: 0;
		border: var(--size-px) solid var(--border-color-primary);
		border-radius: var(--radius-md);
		background: var(--button-secondary-background-fill);
		color: var(--error-500);
		cursor: pointer;
		flex-shrink: 0;
	}

	.stop-button:hover {
		background: var(--button-secondary-background-fill-hover);
		color: var(--error-600);
	}

	.stop-button:active {
		transform: scale(0.95);
	}

	.stop-button :global(svg) {
		width: var(--size-5);
		height: var(--size-5);
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
