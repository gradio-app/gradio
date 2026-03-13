<script lang="ts">
	import { VolumeMuted, VolumeHigh, VolumeLow } from "@gradio/icons";

	let { currentVolume }: { currentVolume: number } = $props();
</script>

{#if currentVolume == 0}
	<VolumeMuted />
{:else if currentVolume < 0.5}
	<VolumeLow />
{:else if currentVolume >= 0.5}
	<VolumeHigh />
{/if}
