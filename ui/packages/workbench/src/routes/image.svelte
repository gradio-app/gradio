<script lang="ts">
	import { browser } from "$app/env";
	import { Image } from "@gradio/image";

	const src = `<h1>hello</h1>`;
</script>

{#if browser}
	<h2>Editor with upload</h2>
	<Image value={null} source={"upload"} tool="editor" />

	<h2>Editor with webcam</h2>
	<Image value={null} source={"webcam"} tool="editor" />

	<h2>Editor with sketch</h2>
	<Image value={null} source={"canvas"} tool="editor" />

	<h2>Cropper with upload</h2>
	<Image value={null} source={"upload"} tool="select" />
{/if}
