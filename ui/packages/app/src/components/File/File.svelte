<script lang="ts">
	import { File, FileUpload } from "@gradio/file";
	import type { FileData } from "@gradio/upload";

	export let value: null | FileData = null;
	export let default_value: null | FileData = null;
	export let theme: string;
	export let style: string | null;
	export let mode: "static" | "dynamic";
	export let static_src: string;

	if (default_value) value = default_value;
</script>

{#if mode === "dynamic"}
	<FileUpload bind:value {theme} {style} on:change on:clear />
{:else if value}
	<File {value} {theme} {style} />
{/if}
