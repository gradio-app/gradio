<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { prettyBytes, playable } from "./utils";

	export let value: FileData | null = null;
	export let theme: string = "default";
	export let source: string;

	export let drop_text: string = "Drop a video file";
	export let or_text: string = "or";
	export let upload_text: string = "click to upload";

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		clear: undefined;
		play: undefined;
		pause: undefined;
		ended: undefined;
	}>();

	function handle_load({ detail }: CustomEvent<FileData | null>) {
		dispatch("change", detail);
		value = detail;
	}

	function handle_clear({ detail }: CustomEvent<FileData | null>) {
		dispatch("clear");
		value = null;
	}
</script>

<div
	class="video-preview w-full h-60 object-contain flex justify-center items-center relative"
	class:bg-gray-200={value}
>
	{#if value === null}
		{#if source === "upload"}
			<Upload
				filetype="video/mp4,video/x-m4v,video/*"
				on:load={handle_load}
				{theme}
			>
				{drop_text}
				<br />- {or_text} -<br />
				{upload_text}
			</Upload>
		{/if}
	{:else}
		<ModifyUpload on:clear={handle_clear} {theme} />
		{#if playable(value.name)}
			<!-- svelte-ignore a11y-media-has-caption -->
			<video
				class="w-full h-full object-contain bg-black"
				controls
				playsInline
				preload="auto"
				src={value.data}
				on:play
				on:pause
				on:ended
			/>
		{:else if value.size}
			<div class="file-name text-4xl p-6 break-all">{value.name}</div>
			<div class="file-size text-2xl p-2">
				{prettyBytes(value.size)}
			</div>
		{/if}
	{/if}
</div>
