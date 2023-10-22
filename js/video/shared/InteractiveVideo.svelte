<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Upload, ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/upload";
	import { BlockLabel } from "@gradio/atoms";
	import { Webcam } from "@gradio/image";
	import { Video } from "@gradio/icons";

	import { prettyBytes, playable } from "./utils";
	import Player from "./Player.svelte";
	import type { I18nFormatter } from "@gradio/utils";

	export let value: FileData | null = null;
	export let subtitle: FileData | null = null;
	export let source: string;
	export let label: string | undefined = undefined;
	export let show_label = true;
	export let mirror_webcam = false;
	export let include_audio: boolean;
	export let autoplay: boolean;
	export let root: string;
	export let i18n: I18nFormatter;

	const dispatch = createEventDispatcher<{
		change: FileData | null;
		clear?: never;
		play?: never;
		pause?: never;
		end?: never;
		drag: boolean;
		error: string;
		upload: FileData;
		start_recording?: never;
		stop_recording?: never;
	}>();

	function handle_load({ detail }: CustomEvent<FileData | null>): void {
		value = detail;
		dispatch("change", detail);
		dispatch("upload", detail!);
	}

	function handle_clear(): void {
		value = null;
		dispatch("change", null);
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
			filetype="video/x-m4v,video/*"
			on:load={handle_load}
			{root}
		>
			<slot />
		</Upload>
	{:else if source === "webcam"}
		<Webcam
			{mirror_webcam}
			{include_audio}
			mode="video"
			on:error
			on:capture={() => dispatch("change")}
			on:start_recording
			on:stop_recording
			{i18n}
		/>
	{/if}
{:else}
	<ModifyUpload {i18n} on:clear={handle_clear} />
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
