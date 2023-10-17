<script lang="ts">
	import { onMount } from "svelte";
	import { Pause } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";

	export let record: RecordPlugin;
	export let i18n: I18nFormatter;
	export let dispatch: (event: string, detail?: any) => void;

	let micDevices: MediaDeviceInfo[] = [];
	let recordButton: HTMLButtonElement;
	let recordingButton: HTMLButtonElement;
	let pauseButton: HTMLButtonElement;
	let resumeButton: HTMLButtonElement;
	let stopButton: HTMLButtonElement;

	onMount(() => {
		recordButton = document.getElementById("record") as HTMLButtonElement;
		recordingButton = document.getElementById("recording") as HTMLButtonElement;
		pauseButton = document.getElementById("pause") as HTMLButtonElement;
		resumeButton = document.getElementById("resume") as HTMLButtonElement;
		stopButton = document.getElementById("stop") as HTMLButtonElement;

		try {
			RecordPlugin.getAvailableAudioDevices().then(
				(devices: MediaDeviceInfo[]) => {
					micDevices = devices;
				}
			);
		} catch (err) {
			if (err instanceof DOMException && err.name == "NotAllowedError") {
				dispatch("error", i18n("audio.allow_recording_access"));
				return;
			}
			throw err;
		}
	});

	$: record.on("record-start", () => {
		record.startMic();

		recordButton.style.display = "none";
		recordingButton.style.display = "flex";

		stopButton.style.display = "block";
		pauseButton.style.display = "block";
	});

	$: record.on("record-end", () => {
		if (record.isPaused()) {
			record.resumeRecording();
			record.stopRecording();
		}
		record.stopMic();

		recordButton.style.display = "flex";
		recordingButton.style.display = "none";

		stopButton.style.display = "none";
		pauseButton.style.display = "none";
		recordButton.disabled = false;
	});

	$: record.on("record-pause", () => {
		pauseButton.style.display = "none";
		resumeButton.style.display = "block";

		recordButton.style.display = "flex";
		recordingButton.style.display = "none";
	});

	$: record.on("record-resume", () => {
		pauseButton.style.display = "block";
		resumeButton.style.display = "none";

		recordButton.style.display = "none";
		recordingButton.style.display = "flex";
	});
</script>

<div class="controls">
	<div class="wrapper">
		<button
			id="record"
			class="record-button"
			on:click={() => record.startRecording()}>{i18n("audio.record")}</button
		>

		<button id="recording" class="recording-button" disabled />
		<button
			id="stop"
			class="stop-button"
			on:click={() => {
				if (record.isPaused()) {
					record.resumeRecording();
					record.stopRecording();
				}

				record.stopRecording();
			}}>{i18n("audio.stop")}</button
		>
		<button
			id="pause"
			class="pause-button"
			on:click={() => record.pauseRecording()}><Pause /></button
		>
		<button
			id="resume"
			class="resume-button"
			on:click={() => record.resumeRecording()}>{i18n("audio.resume")}</button
		>
	</div>

	<select id="mic-select" disabled={micDevices.length === 0}>
		{#if micDevices.length === 0}
			<option value="">{i18n("audio.no_microphone")}</option>
		{:else}
			{#each micDevices as micDevice}
				<option value={micDevice.deviceId}>{micDevice.label}</option>
			{/each}
		{/if}
	</select>
</div>

<style>
	#mic-select {
		height: var(--size-8);
		background: var(--block-background-fill);
		padding: 0px var(--spacing-xxl);
		border-radius: var(--radius-full);
		font-size: var(--text-md);
		border: 1px solid var(--neutral-400);
	}
	.controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin: var(--spacing-xl) 0;
	}

	.wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	#record {
		margin-right: var(--spacing-md);
	}

	.stop-button {
		display: none;
		height: var(--size-8);
		width: var(--size-20);
		border: 1px solid var(--neutral-400);
		border-radius: var(--radius-3xl);
		padding: var(--spacing-xl);
		line-height: 1px;
		font-size: var(--text-md);
		margin-right: var(--spacing-md);
	}

	.recording-button::before {
		content: "";
		height: var(--size-4);
		width: var(--size-4);
		border-radius: var(--radius-full);
		background: var(--primary-600);
		animation: scaling 1800ms infinite;
	}

	.recording-button {
		width: var(--size-8);
		height: var(--size-8);
		background-color: var(--block-background-fill);
		border-radius: var(--radius-3xl);
		display: none;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--primary-600);
		margin-right: var(--spacing-md);
	}

	.record-button::before {
		content: "";
		height: var(--size-4);
		width: var(--size-4);
		border-radius: var(--radius-full);
		background: var(--primary-600);
		margin: var(--spacing-md);
	}

	.record-button {
		height: var(--size-8);
		width: var(--size-20);
		background-color: var(--block-background-fill);
		border-radius: var(--radius-3xl);
		display: flex;
		align-items: center;
		border: 1px solid var(--neutral-400);
	}

	.recording-button:disabled {
		cursor: not-allowed;
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
		border: 1px solid var(--neutral-400);
		border-radius: var(--radius-3xl);
		padding: var(--spacing-md);
	}

	.resume-button {
		display: none;
		height: var(--size-8);
		width: var(--size-20);
		border: 1px solid var(--neutral-400);
		border-radius: var(--radius-3xl);
		padding: var(--spacing-xl);
		line-height: 1px;
		font-size: var(--text-md);
	}

	:global(::part(region)) {
		border-radius: var(--radius-md);
		height: 98% !important;
		border: 1px solid var(--color-accent);
	}

	:global(::part(region-handle)) {
		border: none;
	}

	:global(::part(region-handle-right)) {
		border: none;
	}
</style>
