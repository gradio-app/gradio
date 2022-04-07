<script lang="ts">
	import { Audio } from "@gradio/audio";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";

	export let mode: "static" | "dynamic";
	export let value: null | FileData | string = null;
	export let default_value: null | FileData | string = null;
	export let style: string | null;
	export let name: string;
	export let source: "microphone" | "upload";
	export let type: "normal" | "numpy" = "normal";
	export let label: string;

	if (default_value) value = default_value;

	let _value: null | FileData;
	$: _value = normalise_file(value);
</script>

{#if mode === "dynamic"}
	<Audio
		{label}
		value={_value}
		on:change={({ detail }) => (value = detail)}
		{style}
		{name}
		{source}
		{type}
		on:edit
		on:play
		on:pause
		on:ended
	/>
{:else if _value}
	<audio {style} controls>
		<source src={_value.data} />
	</audio>
{/if}
