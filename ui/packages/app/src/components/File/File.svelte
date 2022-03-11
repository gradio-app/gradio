<script lang="ts">
	import { File, FileUpload } from "@gradio/file";
	import type { FileData } from "@gradio/upload";

	export let value: null | FileData = null;
	export let theme: string;
	export let mode: "static" | "dynamic";
</script>

{#if mode === "static"}
	<FileUpload bind:value {theme} on:change />
{:else if value}
	<File {value} {theme} />
{/if}
