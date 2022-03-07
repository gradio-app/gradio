<script lang="ts">
	import { Audio } from "@gradio/audio";
	import type { FileData } from "@gradio/upload";

	export let mode: "static" | "dynamic";
	export let value: null | FileData;

	export let theme: string;
	export let name: string;

	export let source: "microphone" | "upload";

	let _source: "none" | "microphone" | "upload" =
		mode === "static" ? "none" : source;
</script>

<Audio
	{value}
	{theme}
	{name}
	source={_source}
	on:change={({ detail }) => (value = detail)}
/>
