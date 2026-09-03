<script lang="ts">
	import AudioRecorder from "./recorder/AudioRecorder.svelte";

	let {
		props
	}: {
		props: {
			dispatch_blob: (
				blobs: Uint8Array[] | Blob[],
				event: "stream" | "change"
			) => Promise<void>;
		};
	} = $props();
</script>

<AudioRecorder
	i18n={(text: string) => text}
	dispatch_blob={props.dispatch_blob}
	waveform_settings={{ sampleRate: 44100 }}
	handle_reset_value={() => {}}
/>
