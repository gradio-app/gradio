<script lang="ts">
	import { createEventDispatcher, tick } from "svelte";
	import type { Styles } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";
	import { UploadButton } from "@gradio/uploadbutton";
	import { _ } from "svelte-i18n";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let value: null | FileData | Array<FileData>;
	export let variant: "primary" | "secondary" = "primary";

	async function handle_upload({ detail }: CustomEvent<FileData>) {
		value = detail;
		await tick();
		dispatch("change", value);
		dispatch("upload", detail);
	}

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		clear: undefined;
		drag: boolean;
		upload: FileData;
	}>();
</script>

<UploadButton {variant} {elem_id} {style} {visible} on:click on:load={handle_upload}>
	{"Upload a File"}
</UploadButton>