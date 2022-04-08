<script lang="ts">
	import { File, FileUpload } from "@gradio/file";
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { _ } from "svelte-i18n";

	export let value: null | FileData = null;
	export let default_value: null | FileData = null;
	export let style: string = "";
	export let mode: "static" | "dynamic";
	export let root: string;

	if (default_value) value = default_value;

	let _value: null | FileData;
	$: _value = normalise_file(value, root);
</script>

{#if mode === "dynamic"}
	<FileUpload
		value={_value}
		on:change={({ detail }) => (value = detail)}
		{style}
		on:change
		on:clear
		drop_text={$_("interface.drop_file")}
		or_text={$_("or")}
		upload_text={$_("interface.click_to_upload")}
	/>
{:else if _value}
	<File value={_value} {style} />
{/if}
