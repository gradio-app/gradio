<script lang="ts">
	import { Audio } from "@gradio/audio";
	import type { FileData } from "@gradio/upload";
	import { setFilenameSource } from "../utils/utils";

	export let mode: "static" | "dynamic";
	export let value: null | FileData = null;
	export let theme: string;
	export let style: string | null;
	export let name: string;
	export let source: "microphone" | "upload";
	export let type: "normal" | "numpy" = "normal";
	export let label: string;
	export let root: string;

	$: valueWithSource = value === null ? null : setFilenameSource(value, root);
</script>

{#if mode === "dynamic"}
	<Audio
		value={valueWithSource}
		{theme}
		{style}
		{name}
		{source}
		{type}
		on:change={({ detail }) => (value = detail)}
		on:edit
		on:play
		on:pause
		on:ended
	/>
{:else if valueWithSource}
	<audio {theme} {style} controls>
		<source src={valueWithSource.name} />
	</audio>
{/if}
