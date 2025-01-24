<script lang="ts">
	import { Pause } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	import DeviceSelect from "./DeviceSelect.svelte";

	export let record: RecordPlugin;
	export let i18n: I18nFormatter;
	export let recording = false;

	let micDevices: MediaDeviceInfo[] = [];
	let recordButton: HTMLButtonElement;
	let pauseButton: HTMLButtonElement;
	let resumeButton: HTMLButtonElement;
	let stopButton: HTMLButtonElement;
	let stopButtonPaused: HTMLButtonElement;
	let recording_ongoing = false;

	export let record_time: string;
	export let show_recording_waveform: boolean | undefined;
	export let timing = false;

	$: record.on("record-start", () => {
		record.startMic();

		recordButton.style.display = "none";
		stopButton.style.display = "flex";
		pauseButton.style.display = "block";
	});

	$: record.on("record-end", () => {
		if (record.isPaused()) {
			record.resumeRecording();
			record.stopRecording();
		}
		record.stopMic();

		recordButton.style.display = "flex";
		stopButton.style.display = "none";
		pauseButton.style.display = "none";
		recordButton.disabled = false;
	});

	$: record.on("record-pause", () => {
		pauseButton.style.display = "none";
		resumeButton.style.display = "block";
		stopButton.style.display = "none";
		stopButtonPaused.style.display = "flex";
	});

	$: record.on("record-resume", () => {
		pauseButton.style.display = "block";
		resumeButton.style.display = "none";
		recordButton.style.display = "none";
		stopButton.style.display = "flex";
		stopButtonPaused.style.display = "none";
	});

	$: if (recording && !recording_ongoing) {
		record.startRecording();
		recording_ongoing = true;
	} else {
		record.stopRecording();
		recording_ongoing = false;
	}
</script>

<div class="controls">
	<div class="wrapper">
		<button
			bind:this={recordButton}
			class="record record-button"
			on:click={() => record.startRecording()}>{i18n("audio.record")}</button
		>

		<button
			bind:this={stopButton}
			class="stop-button {record.isPaused() ? 'stop-button-paused' : ''}"
			on:click={() => {
				if (record.isPaused()) {
					record.resumeRecording();
					record.stopRecording();
				}

				record.stopRecording();
			}}>{i18n("audio.stop")}</button
		>

		<button
			bind:this={stopButtonPaused}
			id="stop-paused"
			class="stop-button-paused"
			on:click={() => {
				if (record.isPaused()) {
					record.resumeRecording();
					record.stopRecording();
				}

				record.stopRecording();
			}}>{i18n("audio.stop")}</button
		>

		<button
			aria-label="pause"
			bind:this={pauseButton}
			class="pause-button"
			on:click={() => record.pauseRecording()}><Pause /></button
		>
		<button
			bind:this={resumeButton}
			class="resume-button"
			on:click={() => record.resumeRecording()}>{i18n("audio.resume")}</button
		>
		{#if timing && !show_recording_waveform}
			<time class="duration-button duration">{record_time}</time>
		{/if}
	</div>
	<DeviceSelect bind:micDevices {i18n} />
</div>

<style>
	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.wrapper {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	.record {
		margin-right: var(--spacing-md);
	}

	.stop-button-paused {
		display: none;
		height: var(--size-8);
		width: var(--size-20);
		background-color: var(--block-background-fill);
		border-radius: var(--button-large-radius);
		align-items: center;
		border: 1px solid var(--block-border-color);
		margin: var(--size-1) var(--size-1) 0 0;
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
		display: none;
		height: var(--size-8);
		width: var(--size-20);
		background-color: var(--block-background-fill);
		border-radius: var(--button-large-radius);
		align-items: center;
		border: 1px solid var(--primary-600);
		margin: var(--size-1) var(--size-1) 0 0;
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

	.duration-button {
		border-radius: var(--button-large-radius);
	}

	.stop-button:disabled {
		cursor: not-allowed;
	}

	.record-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
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

	.pause-button {
		display: none;
		height: var(--size-8);
		width: var(--size-20);
		border: 1px solid var(--block-border-color);
		border-radius: var(--button-large-radius);
		padding: var(--spacing-md);
		margin: var(--size-1) var(--size-1) 0 0;
	}

	.resume-button {
		display: none;
		height: var(--size-8);
		width: var(--size-20);
		border: 1px solid var(--block-border-color);
		border-radius: var(--button-large-radius);
		padding: var(--spacing-xl);
		line-height: 1px;
		font-size: var(--text-md);
		margin: var(--size-1) var(--size-1) 0 0;
	}

	.duration {
		display: flex;
		height: var(--size-8);
		width: var(--size-20);
		border: 1px solid var(--block-border-color);
		padding: var(--spacing-md);
		align-items: center;
		justify-content: center;
		margin: var(--size-1) var(--size-1) 0 0;
	}

	:global(::part(region)) {
		border-radius: var(--radius-md);
		height: 98% !important;
		border: 1px solid var(--trim-region-color);
		background-color: unset;
		border-width: 1px 3px;
	}

	:global(::part(region))::after {
		content: "";
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: var(--trim-region-color);
		opacity: 0.2;
		border-radius: var(--radius-md);
	}

	:global(::part(region-handle)) {
		width: 5px !important;
		border: none;
	}
</style>
