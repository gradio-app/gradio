<script lang="ts">
	import { Audio } from "@gradio/audio";
	import type { FileData } from "@gradio/upload";

	export let mode: "static" | "dynamic";
	export let value: null | FileData = null;
	export let theme: string;
	export let name: string;
	export let source: "microphone" | "upload";
	export let type: "normal" | "numpy" = "normal";
</script>

{#if mode === "dynamic"}
	<Audio
		{value}
		{theme}
		{name}
		{source}
		{type}
		on:change={({ detail }) => (value = detail)}
		on:edit
		on:play
		on:pause
		on:ended
	/>
{:else if value}
	<audio {theme} controls>
		<source src={value.data} />
	</audio>
{/if}
