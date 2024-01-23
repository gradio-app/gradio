<script lang="ts">
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	import type { I18nFormatter } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";

	export let i18n: I18nFormatter;
	export let micDevices: MediaDeviceInfo[] = [];

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
</script>

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

<style>
	.mic-select {
		height: var(--size-8);
		background: var(--block-background-fill);
		padding: 0px var(--spacing-xxl);
		border-radius: var(--radius-full);
		font-size: var(--text-md);
		border: 1px solid var(--neutral-400);
		gap: var(--size-1);
	}

	select {
		text-overflow: ellipsis;
		max-width: var(--size-40);
	}

	@media (max-width: 375px) {
		select {
			width: 100%;
		}
	}
</style>
