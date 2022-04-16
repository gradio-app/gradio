<script lang="ts">
  import type { FileData } from "@gradio/upload";
  import { normalise_file } from "@gradio/upload";
	import { Model3D, Model3DUpload } from "@gradio/model3D";
	import { _ } from "svelte-i18n";

	export let value: null | FileData = null;
	export let default_value: null | string = null;
	export let style: string = "";
	export let mode: "static" | "dynamic";
	export let root: string;
	export let clearColor: [];

	if (default_value) value = default_value;

	let _value: null | FileData;
  $: _value = normalise_file(value, root);
</script>

{#if mode === "dynamic"}
	<Model3DUpload
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
	<Model3D value={_value} clearColor={clearColor} {style} />
{/if}
