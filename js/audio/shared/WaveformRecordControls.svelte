<script lang="ts">
	import { Pause } from "@gradio/icons";
	import type { I18nFormatter } from "@gradio/utils";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	import { createEventDispatcher } from "svelte";

	export let record: RecordPlugin;
	export let i18n: I18nFormatter;

	let micDevices: MediaDeviceInfo[] = [];
	let recordButton: HTMLButtonElement;
	let pauseButton: HTMLButtonElement;
	let resumeButton: HTMLButtonElement;
	let stopButton: HTMLButtonElement;
	let stopButtonPaused: HTMLButtonElement;

	const dispatch = createEventDispatcher<{
		error: string;
	}>();

	$: try {
		let tempDevices: MediaDeviceInfo[] = [];
		RecordPlugin.getAvailableAudioDevices().then(
			(devices: MediaDeviceInfo[]) => {
				micDevices = devices;
				devices.forEach((device) => {
					if (device.deviceId) {
						tempDevices.push(device);
					}
				});
				micDevices = tempDevices;
			}
		);
	} catch (err) {
		if (err instanceof DOMException && err.name == "NotAllowedError") {
			dispatch("error", i18n("audio.allow_recording_access"));
		}
		throw err;
	}

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
			bind:this={pauseButton}
			class="pause-button"
			on:click={() => record.pauseRecording()}><Pause /></button
		>
		<button
			bind:this={resumeButton}
			class="resume-button"
			on:click={() => record.resumeRecording()}>{i18n("audio.resume")}</button
		>
	</div>

	<select
		class="mic-select"
		aria-label="Select input device"
		disabled={micDevices.length === 0}
	>
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
	.mic-select {
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
		flex-wrap: wrap;
		overflow: hidden;
	}

	.controls select {
		text-overflow: ellipsis;
		margin: var(--size-2) 0;
	}

	@media (max-width: 375px) {
		.controls select {
			width: 100%;
		}
	}

	.wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.record {
		margin-right: var(--spacing-md);
	}

	.stop-button-paused {
		display: none;
		height: var(--size-8);
		width: var(--size-20);
		background-color: var(--block-background-fill);
		border-radius: var(--radius-3xl);
		align-items: center;
		border: 1px solid var(--neutral-400);
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
		display: none;
		height: var(--size-8);
		width: var(--size-20);
		background-color: var(--block-background-fill);
		border-radius: var(--radius-3xl);
		align-items: center;
		border: 1px solid var(--primary-600);
		margin-right: 5px;
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
		border-radius: var(--radius-3xl);
		display: flex;
		align-items: center;
		border: 1px solid var(--neutral-400);
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
		border-width: 1px 3px;
	}

	:global(::part(region-handle)) {
		width: 5px !important;
		border: none;
	}
</style>
