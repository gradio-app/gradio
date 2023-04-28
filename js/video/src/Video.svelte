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
	export let subtitle: FileData | null = null;
	export let source: string;
	export let label: string | undefined = undefined;
	export let show_label: boolean = true;
	export let mirror_webcam: boolean = false;
	export let include_audio: boolean;

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		clear: undefined;
		play: undefined;
		pause: undefined;
		ended: undefined;
		drag: boolean;
		error: string;
		upload: FileData;
	}>();

	function handle_load({ detail }: CustomEvent<FileData | null>) {
		dispatch("change", detail);
		dispatch("upload", detail!);
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
		<Upload bind:dragging filetype="video/x-m4v,video/*" on:load={handle_load}>
			<slot />
		</Upload>
	{:else if source === "webcam"}
		<Webcam
			{mirror_webcam}
			{include_audio}
			mode="video"
			on:error
			on:capture={({ detail }) => dispatch("change", detail)}
		/>
	{/if}
{:else}
	<ModifyUpload on:clear={handle_clear} />
	{#if playable()}
		<!-- svelte-ignore a11y-media-has-caption -->
		<Player
			src={value.data}
			subtitle={subtitle?.data}
			on:play
			on:pause
			on:ended
			mirror={mirror_webcam && source === "webcam"}
		/>
	{:else if value.size}
		<div class="file-name">{value.name}</div>
		<div class="file-size">
			{prettyBytes(value.size)}
		</div>
	{/if}
{/if}

<style>
	.file-name {
		padding: var(--size-6);
		font-size: var(--text-xxl);
		word-break: break-all;
	}

	.file-size {
		padding: var(--size-2);
		font-size: var(--text-xl);
	}
</style>
