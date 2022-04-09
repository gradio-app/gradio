<script lang="ts">
	import { Audio } from "@gradio/audio";
	import type { FileData } from "@gradio/upload";

	export let mode: "static" | "dynamic";
	export let value: null | FileData = null;
	export let theme: string;
	export let style: string | null;
	export let name: string;
	export let source: "microphone" | "upload";
	export let type: "normal" | "numpy" = "normal";
	export let label: string;
	export let examples_dir: string;
</script>

{#if mode === "dynamic"}
	<Audio
		{value}
		{theme}
		{style}
		{name}
		{source}
		{type}
		{examples_dir}
		on:change={({ detail }) => (value = detail)}
		on:edit
		on:play
		on:pause
		on:ended
	/>
{:else if value}
	<audio {theme} {style} controls>
		<source src={value.data || examples_dir + value.name} />
	</audio>
{/if}
