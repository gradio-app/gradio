<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { Webcam } from "@gradio/image/interactive";
	import { Video } from "@gradio/icons";

	import { prettyBytes, playable } from "../shared/utils";
	import Player from "../shared/Player.svelte";

	export let value: FileData | null = null;
	export let subtitle: FileData | null = null;
	export let source: string;
	export let label: string | undefined = undefined;
	export let show_label = true;
	export let mirror_webcam = false;
	export let include_audio: boolean;
	export let autoplay: boolean;

	const dispatch = createEventDispatcher<{
		change: any;
		clear: undefined;
		play: undefined;
		pause: undefined;
		end: undefined;
		drag: boolean;
		error: string;
		upload: FileData;
		start_recording: undefined;
		stop_recording: undefined;
	}>();

	function handle_load({ detail }: CustomEvent<FileData | null>): void {
		dispatch("change", detail);
		dispatch("upload", detail!);
		value = detail;
	}

	function handle_clear({ detail }: CustomEvent<FileData | null>): void {
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
			on:start_recording
			on:stop_recording
		/>
	{/if}
{:else}
	<ModifyUpload on:clear={handle_clear} />
	{#if playable()}
		{#key value?.data}
			<Player
				{autoplay}
				src={value.data}
				subtitle={subtitle?.data}
				on:play
				on:pause
				on:stop
				on:end
				mirror={mirror_webcam && source === "webcam"}
				{label}
			/>
		{/key}
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
