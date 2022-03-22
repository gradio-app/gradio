<script lang="ts">
	import { File, FileUpload } from "@gradio/file";
	import type { FileData } from "@gradio/upload";

	export let value: null | FileData = null;
	export let theme: string;
	export let style: string | null;
	export let mode: "static" | "dynamic";
</script>

{#if mode === "dynamic"}
	<FileUpload bind:value {theme} {style} on:change on:clear />
{:else if value}
	<File {value} {theme} {style} />
{/if}
