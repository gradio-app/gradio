<script lang="ts">
	import { Audio, StaticAudio } from "@gradio/audio";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { _ } from "svelte-i18n";

	export let mode: "static" | "dynamic";
	export let value: null | FileData | string = null;
	export let style: string = "";
	export let name: string;
	export let source: "microphone" | "upload";
	export let type: "normal" | "numpy" = "normal";
	export let label: string;
	export let root: string;

	let _value: null | FileData;
	$: _value = normalise_file(value, root);
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
		drop_text={$_("interface.drop_audio")}
		or_text={$_("or")}
		upload_text={$_("interface.click_to_upload")}
	/>
{:else}
	<StaticAudio value={_value} name={_value?.name || "audio_file"} {label} />
{/if}
