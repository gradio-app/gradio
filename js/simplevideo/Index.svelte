<script lang="ts">
	import { Upload, ModifyUpload } from "@gradio/upload";
	import { type FileData, normalise_file } from "@gradio/client";
	import { BlockLabel } from "@gradio/atoms";
	import { Video } from "@gradio/icons";
	import { Block, UploadText } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	import { BaseStaticVideo, prettyBytes, playable } from "@gradio/video";
	import type { Gradio, ShareData } from "@gradio/utils";

	type VideoData = { video: FileData; subtitles: FileData | null } | null;

	export let gradio: Gradio<{
		change: never;
		clear?: never;
		play?: never;
		pause?: never;
		end?: never;
		stop?: never;
		upload: never;
		share: ShareData;
	}>;

	export let visible: true;
	export let value: VideoData | null = null;
	let previous_value = value;
	export let label: string | undefined = undefined;
	export let show_label = true;
	export let autoplay: boolean;
	export let root: string;
	export let root_url: string;
	export let mode: "static" | "interactive";
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let height: number | undefined;
	export let width: number | undefined;
	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let show_share_button = true;

	let dragging = false;

	function handle_load({ detail }: CustomEvent<FileData | null>): void {
		if (detail != null) {
			value = { video: detail, subtitles: null };
			gradio.dispatch("upload");
		}
	}

	async function handle_clear(): Promise<void> {
		value = null;
		gradio.dispatch("change");
		gradio.dispatch("clear");
	}

	$: {
		if (JSON.stringify(value) !== JSON.stringify(previous_value)) {
			previous_value = value;
			gradio.dispatch("change");
		}
	}

	$: {
		if (value != null) {
			const vid = normalise_file(value.video, root, root_url);
			if (vid != null) {
				value.video = vid;
			}
			value.subtitles = normalise_file(value.subtitles, root, root_url);
		}
	}

	$: interactive = mode === "interactive";
</script>

<Block
	{visible}
	variant={"dashed"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	{height}
	{width}
	{container}
	{scale}
	{min_width}
	allow_overflow={false}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	<BlockLabel {show_label} Icon={Video} label={label || "Video"} />
	{#if value === null && interactive}
		<Upload
			bind:dragging
			filetype="video/x-m4v,video/*"
			on:load={handle_load}
			{root}
		>
			<UploadText i18n={gradio.i18n} type="video" />
		</Upload>
	{:else}
		{#if interactive}
			<ModifyUpload i18n={gradio.i18n} on:clear={handle_clear} />
		{/if}
		{#if playable()}
			{#key value?.video.url}
				<BaseStaticVideo
					{autoplay}
					value={value?.video}
					subtitle={value?.subtitles}
					{show_share_button}
					show_download_button={!interactive}
					on:play={() => gradio.dispatch("play")}
					on:pause={() => gradio.dispatch("pause")}
					on:stop={() => gradio.dispatch("stop")}
					on:end={() => gradio.dispatch("end")}
					on:share={(e) => gradio.dispatch("share", e.detail)}
					{label}
					i18n={gradio.i18n}
				/>
			{/key}
		{:else if value?.video.size}
			<div class="file-name">{value.video.orig_name}</div>
			<div class="file-size">
				{prettyBytes(value.video.size)}
			</div>
		{/if}
	{/if}
</Block>

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
