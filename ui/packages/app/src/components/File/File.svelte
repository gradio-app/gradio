<script lang="ts">
	import { File, FileUpload } from "@gradio/file";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";

	export let value: null | FileData = null;
	export let default_value: null | FileData = null;
	export let theme: string;
	export let style: string = "";
	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;

	let _value: null | FileData;
	$: _value = normalise_file(value);
</script>

{#if mode === "dynamic"}
	<FileUpload
		value={_value}
		on:change={({ detail }) => (value = detail)}
		{style}
		on:change
		on:clear
	/>
{:else if _value}
	<File value={_value} {theme} {style} />
{/if}
