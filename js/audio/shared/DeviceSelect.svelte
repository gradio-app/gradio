<script lang="ts">
	import { onMount } from "svelte";
	import RecordPlugin from "wavesurfer.js/dist/plugins/record.js";
	import type { I18nFormatter } from "@gradio/utils";

	let {
		i18n,
		micDevices = $bindable(),
		onerror
	}: {
		i18n: I18nFormatter;
		micDevices?: MediaDeviceInfo[];
		onerror?: (error: string) => void;
	} = $props();

	onMount(() => {
		if (typeof window !== "undefined") {
			try {
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
					onerror?.(i18n("audio.allow_recording_access"));
				}
				throw err;
			}
		}
	});
</script>

<select
	class="mic-select"
	aria-label="Select input device"
	disabled={!micDevices || micDevices.length === 0}
>
	{#if !micDevices || micDevices.length === 0}
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
		border-radius: var(--button-large-radius);
		font-size: var(--text-md);
		border: 1px solid var(--block-border-color);
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
