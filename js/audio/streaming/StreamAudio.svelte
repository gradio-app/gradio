<script lang="ts">
	import { onMount } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import { Clear, Spinner } from "@gradio/icons";
	import WaveSurfer from "wavesurfer.js";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	import type { WaveformOptions, MicrophoneOptions } from "../shared/types";
	import DeviceSelect from "../shared/DeviceSelect.svelte";

	let {
		recording = false,
		paused_recording = false,
		stop,
		record,
		i18n,
		waveform_settings,
		waveform_options = { show_recording_waveform: true },
		microphone_options = {},
		waiting = false,
		queue_detail = null
	}: {
		recording?: boolean;
		paused_recording?: boolean;
		stop: () => void;
		record: () => void;
		i18n: I18nFormatter;
		waveform_settings: Record<string, any>;
		waveform_options?: WaveformOptions;
		microphone_options?: MicrophoneOptions;
		waiting?: boolean;
		queue_detail?: string | null;
	} = $props();

	let micWaveform: WaveSurfer;
	let waveformRecord: RecordPlugin;

	let microphoneContainer: HTMLDivElement;

	let micDevices: MediaDeviceInfo[] = $state([]);
	let mic_request = 0;

	onMount(() => {
		create_mic_waveform();
		return () => {
			mic_request++;
			micWaveform?.destroy();
		};
	});

	// Whether the waveform's microphone is on (started, not stopped)
	let mic_on = false;

	const start_mic = (): void => {
		const plugin = waveformRecord;
		if (!plugin) return;
		mic_on = true;
		const request = ++mic_request;
		plugin.startMic(microphone_options.constraints ?? undefined).then(
			(stream) => {
				// stopMic() is a no-op until startMic() resolves, so a Stop or
				// unmount while mic access was pending has to be applied here.
				if (request === mic_request) return;
				plugin.stopMic();
				stream.getTracks().forEach((track) => track.stop());
			},
			// InteractiveAudio requests the mic too and reports the error.
			() => {}
		);
	};

	const stop_mic = (): void => {
		mic_on = false;
		mic_request++;
		waveformRecord?.stopMic();
	};

	// Recording can also end from outside (a stream that ended on the
	// server); the waveform's own microphone then closes too
	$effect(() => {
		if (!recording && mic_on) stop_mic();
	});

	const create_mic_waveform = (): void => {
		if (micWaveform !== undefined) micWaveform.destroy();
		if (!microphoneContainer) return;
		micWaveform = WaveSurfer.create({
			...waveform_settings,
			normalize: false,
			container: microphoneContainer
		});

		waveformRecord = micWaveform.registerPlugin(RecordPlugin.create());
	};
</script>

<div class="mic-wrap">
	{#if waveform_options.show_recording_waveform}
		<div
			bind:this={microphoneContainer}
			style:display={recording ? "block" : "none"}
		/>
	{/if}
	<div class="controls">
		{#if recording && !waiting}
			<button
				class={paused_recording ? "stop-button-paused" : "stop-button"}
				onclick={() => {
					stop_mic();
					stop();
				}}
			>
				<span class="record-icon">
					<span class="pinger" />
					<span class="dot" />
				</span>
				{paused_recording ? i18n("audio.pause") : i18n("audio.stop")}
			</button>
		{:else if recording && waiting}
			<div class="waiting">
				<div class="queue-status" role="status">
					<div class="icon">
						<Spinner />
					</div>
					<span data-testid="waiting-label"
						>{i18n("audio.waiting")}{queue_detail
							? ` · ${queue_detail}`
							: ""}</span
					>
				</div>
				<button
					class="cancel-button"
					aria-label="cancel waiting"
					onclick={() => {
						stop_mic();
						stop();
					}}
				>
					<div class="icon">
						<Clear />
					</div>
					{i18n("chatbot.cancel")}
				</button>
			</div>
		{:else}
			<button
				class="record-button"
				onclick={() => {
					start_mic();
					record();
				}}
			>
				<span class="record-icon">
					<span class="dot" />
				</span>
				{i18n("audio.record")}
			</button>
		{/if}

		<DeviceSelect bind:micDevices {i18n} />
	</div>
</div>

<style>
	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.mic-wrap {
		display: block;
		align-items: center;
		margin: var(--spacing-xl);
	}

	.icon {
		width: var(--size-4);
		height: var(--size-4);
		fill: var(--primary-600);
		stroke: var(--primary-600);
	}

	.stop-button-paused {
		display: none;
		height: var(--size-8);
		width: var(--size-20);
		background-color: var(--block-background-fill);
		border-radius: var(--button-large-radius);
		align-items: center;
		border: 1px solid var(--block-border-color);
		margin-right: 5px;
	}

	.stop-button-paused::before {
		content: "";
		height: var(--size-4);
		width: var(--size-4);
		border-radius: var(--radius-full);
		background: var(--primary-600);
		margin: 0 var(--spacing-xl);
	}

	.stop-button::before {
		content: "";
		height: var(--size-4);
		width: var(--size-4);
		border-radius: var(--radius-full);
		background: var(--primary-600);
		margin: 0 var(--spacing-xl);
		animation: scaling 1800ms infinite;
	}

	.stop-button {
		height: var(--size-8);
		width: var(--size-20);
		background-color: var(--block-background-fill);
		border-radius: var(--button-large-radius);
		align-items: center;
		border: 1px solid var(--primary-600);
		margin-right: 5px;
		display: flex;
	}

	.waiting {
		height: var(--size-8);
		display: flex;
		align-items: center;
		gap: var(--size-3);
		padding: 0 var(--size-3);
		margin: 0 var(--spacing-xl);
		white-space: nowrap;
		background-color: var(--block-background-fill);
		border-radius: var(--radius-3xl);
		border: 1px solid var(--primary-600);
	}

	.queue-status,
	.cancel-button {
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.cancel-button {
		height: 100%;
		background: none;
		border: none;
		padding: 0;
	}

	.record-button::before {
		content: "";
		height: var(--size-4);
		width: var(--size-4);
		border-radius: var(--radius-full);
		background: var(--primary-600);
		margin: 0 var(--spacing-xl);
	}

	.record-button {
		height: var(--size-8);
		width: var(--size-24);
		background-color: var(--block-background-fill);
		border-radius: var(--button-large-radius);
		display: flex;
		align-items: center;
		border: 1px solid var(--block-border-color);
	}

	@keyframes scaling {
		0% {
			background-color: var(--primary-600);
			scale: 1;
		}
		50% {
			background-color: var(--primary-600);
			scale: 1.2;
		}
		100% {
			background-color: var(--primary-600);
			scale: 1;
		}
	}
</style>
