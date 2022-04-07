<script lang="ts">
	import { Audio } from "@gradio/audio";
	import type { FileData } from "@gradio/upload";
	import { prefixFileWithURL } from "../utils/utils";

	export let mode: "static" | "dynamic";
	export let value: null | FileData = null;
	export let theme: string;
	export let style: string | null;
	export let name: string;
	export let source: "microphone" | "upload";
	export let type: "normal" | "numpy" = "normal";
	export let label: string;
	export let root: string;

	$: prefixedValue = value === null ? null : prefixFileWithURL(value, root);
</script>

{#if mode === "dynamic"}
	<Audio
		value={prefixedValue}
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
{:else if prefixedValue}
	<audio {theme} {style} controls>
		<source src={prefixedValue.data || prefixedValue.name} />
	</audio>
{/if}
