<script lang="ts">
	import { onMount } from "svelte";
	import { createEventDispatcher } from "svelte";
	import { Upload } from "@gradio/upload";
	import { type FileData, type Client } from "@gradio/client";

	export let sources: ("upload" | "clipboard" | "webcam")[] = [];
	export let root: string;
	export let upload: Client["upload"];
	export let stream_handler: Client["stream"];
	export let dragging: boolean;

	const dispatch = createEventDispatcher();

	/**
	 * Handles image addition and dispatches an event
	 * @param {{ detail: Blob | File }} event - The event containing the image data
	 */
	function add_image({ detail }: { detail: Blob | File }): void {
		dispatch("add_image", detail);
	}
</script>

<!-- {#if sources.includes("upload")}
	<Upload
		filetype="image"
		{dragging}
		boundedheight={false}
		{root}
		{upload}
		{stream_handler}
		on:load={add_image}
		format="blob"
	>
		<slot></slot>
	</Upload>
{/if} -->
<!-- 
{#if sources.includes("clipboard")}
	<Clipboard />
{/if} -->
