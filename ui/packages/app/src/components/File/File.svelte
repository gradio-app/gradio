<script lang="ts">
	import { File, FileUpload } from "@gradio/file";
	import type { FileData } from "@gradio/upload";

	export let value: null | FileData;
	export let theme: string;
	export let is_static: boolean;
</script>

{#if is_static}
	<FileUpload bind:value {theme} on:change />
{:else if value}
	<File {value} {theme} />
{/if}
