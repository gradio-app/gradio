<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { Webcam } from "@gradio/image";
	import { Video } from "@gradio/icons";

	import { prettyBytes, playable } from "./utils";
	import Player from "./Player.svelte";

	export let value: FileData | null = null;
	export let source: string;
	export let label: string | undefined = undefined;
	export let show_label: boolean;
	export let mirror_webcam: boolean;

	export let drop_text: string = "Drop a video file";
	export let or_text: string = "or";
	export let upload_text: string = "click to upload";

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		clear: undefined;
		play: undefined;
		pause: undefined;
		ended: undefined;
		drag: boolean;
		error: string;
	}>();

	function handle_load({ detail }: CustomEvent<FileData | null>) {
		dispatch("change", detail);
		value = detail;
	}

	function handle_clear({ detail }: CustomEvent<FileData | null>) {
		value = null;
		dispatch("change", detail);
		dispatch("clear");
	}

	let dragging = false;
	$: dispatch("drag", dragging);
</script>

<BlockLabel {show_label} Icon={Video} label={label || "Video"} />
{#if value === null}
	{#if source === "upload"}
		<Upload
			bind:dragging
			filetype="video/mp4,video/x-m4v,video/*"
			on:load={handle_load}
		>
			<div class="flex flex-col">
				{drop_text}
				<span class="text-gray-300">- {or_text} -</span>
				{upload_text}
			</div>
		</Upload>
	{:else if source === "webcam"}
		<Webcam
			{mirror_webcam}
			mode="video"
			on:error
			on:capture={({ detail }) => dispatch("change", detail)}
		/>
	{/if}
{:else}
	<ModifyUpload on:clear={handle_clear} />
	{#if playable()}
		<!-- svelte-ignore a11y-media-has-caption -->
		<Player src={value.data} on:play on:pause on:ended mirror={mirror_webcam} />
	{:else if value.size}
		<div class="file-name text-4xl p-6 break-all">{value.name}</div>
		<div class="file-size text-2xl p-2">
			{prettyBytes(value.size)}
		</div>
	{/if}
{/if}
