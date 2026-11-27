<script lang="ts">
	// Plays the live audio a WebRTC stream sends back
	let { stream }: { stream: MediaStream } = $props();
	let audio: HTMLAudioElement | undefined = $state();

	$effect(() => {
		if (audio && audio.srcObject !== stream) {
			audio.srcObject = stream;
			audio.play().catch(() => {});
		}
	});
</script>

<audio bind:this={audio} data-testid="live-audio" autoplay></audio>
