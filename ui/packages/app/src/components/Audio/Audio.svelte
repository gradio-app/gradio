<script lang="ts">
	import { Audio } from "@gradio/audio";
	import type { FileData } from "@gradio/upload";

	export let is_static: boolean;
	export let value: null | FileData;
	export let theme: string;
	export let name: string;
	export let source: "microphone" | "upload";
</script>

{#if is_static}
	<Audio
		{value}
		{theme}
		{name}
		{source}
		on:change={({ detail }) => (value = detail)}
	/>
{:else if value}
	<audio {theme} controls>
		<source src={value.data} />
	</audio>
{/if}
