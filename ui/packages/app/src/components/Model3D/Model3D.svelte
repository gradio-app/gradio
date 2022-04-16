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

	if (default_value) value = default_value;

	let _value: null | FileData;
  $: _value = normalise_file(value, root);
</script>

{console.log(mode)}

{#if mode === "static"}
	<Model3D value={_value} {style} />
	<!-- <div
		class="output-model3D w-full h-60 flex justify-center items-center bg-gray-200 dark:bg-gray-600 relative"
		{style}
	>
	</div> -->
{:else}
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
{/if}
