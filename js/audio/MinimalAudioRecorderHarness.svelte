<script lang="ts">
	import type { Client, FileData } from "@gradio/client";
	import MinimalAudioRecorder from "./shared/MinimalAudioRecorder.svelte";

	let {
		props
	}: {
		props: {
			upload_fn: Client["upload"];
			onchange: (value: FileData) => void;
			onstoprecording: () => void;
		};
	} = $props();
</script>

<MinimalAudioRecorder
	label="Chat input audio"
	recording={false}
	upload={props.upload_fn}
	root="https://example.com"
	onchange={props.onchange}
	onstoprecording={props.onstoprecording}
/>
