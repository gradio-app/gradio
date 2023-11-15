<script lang="ts">
	import { onMount } from "svelte";
	import type { I18nFormatter } from "@gradio/utils";
	import WaveSurfer from "wavesurfer.js";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";

	export let recording = false;
	export let paused_recording = false;
	export let stop: () => void;
	export let record: () => void;
	export let i18n: I18nFormatter;
	export let waveform_settings: Record<string, any>;

	let micWaveform: WaveSurfer;
	let waveformRecord: RecordPlugin;

	onMount(() => {
		create_mic_waveform();
	});

	const create_mic_waveform = (): void => {
		if (micWaveform !== undefined) micWaveform.destroy();

		micWaveform = WaveSurfer.create({
			...waveform_settings,
			height: 100,
			container: "#microphone"
		});

		waveformRecord = micWaveform.registerPlugin(RecordPlugin.create());
	};
</script>

<div class="mic-wrap">
	<div id="microphone" style:display={recording ? "block" : "none"} />
	{#if recording}
		<button
			class={paused_recording ? "stop-button-paused" : "stop-button"}
			on:click={() => {
				waveformRecord.stopMic();
				stop();
			}}
		>
			<span class="record-icon">
				<span class="pinger" />
				<span class="dot" />
			</span>
			{paused_recording ? i18n("audio.pause") : i18n("audio.stop")}
		</button>
	{:else}
		<button
			class="record-button"
			on:click={() => {
				waveformRecord.startMic();
				record();
			}}
		>
			<span class="record-icon">
				<span class="dot" />
			</span>
			{i18n("audio.record")}
		</button>
	{/if}
</div>

<style>
	.mic-wrap {
		display: block;
		align-items: center;
		margin: var(--spacing-xl);
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
		height: var(--size-8);
		width: var(--size-20);
		background-color: var(--block-background-fill);
		border-radius: var(--radius-3xl);
		align-items: center;
		border: 1px solid var(--primary-600);
		margin-right: 5px;
		display: flex;
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
</style>
