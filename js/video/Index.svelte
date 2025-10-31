<svelte:options accessors={true} />

<script lang="ts">
	import type { FileData } from "@gradio/client";
	import { Block, UploadText } from "@gradio/atoms";
	import StaticVideo from "./shared/VideoPreview.svelte";
	import Video from "./shared/InteractiveVideo.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import { Gradio } from "@gradio/utils";
	import type { VideoProps, VideoEvents } from "./types";

	const props = $props();
	const gradio = new Gradio<VideoEvents, VideoProps>(props);

	let old_value = $state(gradio.props.value);
	let uploading = $state(false);
	let dragging = $state(false);
	let active_source = $derived.by(() =>
		gradio.props.sources ? gradio.props.sources[0] : undefined
	);
	let initial_value: {
		video: FileData | null;
		subtitles: FileData | null;
	} | null = gradio.props.value;

	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});

	const handle_reset_value = (): void => {
		if (initial_value === null || gradio.props.value === initial_value) {
			return;
		}
		gradio.props.value = initial_value;
	};

	function handle_change({ detail }: CustomEvent<FileData | null>): void {
		if (detail != null) {
			gradio.props.value = { video: detail, subtitles: null } as {
				video: FileData;
				subtitles: FileData | null;
			} | null;
		} else {
			gradio.props.value = null;
		}
	}

	function handle_error({ detail }: CustomEvent<string>): void {
		const [level, status] = detail.includes("Invalid file type")
			? ["warning", "complete"]
			: ["error", "error"];
		gradio.shared.loading_status.status = status as any;
		gradio.shared.loading_status.message = detail;
		gradio.dispatch(level as "error" | "warning", detail);
	}
</script>

{#if !gradio.shared.interactive}
	<Block
		visible={gradio.shared.visible}
		variant={gradio.props.value === null && active_source === "upload"
			? "dashed"
			: "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		height={gradio.props.height || undefined}
		width={gradio.props.width}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
		allow_overflow={false}
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on:clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>

		<StaticVideo
			value={gradio.props.value?.video}
			subtitle={gradio.props.value?.subtitles}
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			autoplay={gradio.props.autoplay}
			loop={gradio.props.loop}
			show_share_button={gradio.props.buttons.includes("share")}
			show_download_button={gradio.props.buttons.includes("download")}
			on:play={() => gradio.dispatch("play")}
			on:pause={() => gradio.dispatch("pause")}
			on:stop={() => gradio.dispatch("stop")}
			on:end={() => gradio.dispatch("end")}
			on:share={({ detail }) => gradio.dispatch("share", detail)}
			on:error={({ detail }) => gradio.dispatch("error", detail)}
			i18n={gradio.i18n}
			upload={(...args) => gradio.shared.client.upload(...args)}
		/>
	</Block>
{:else}
	<Block
		visible={gradio.shared.visible}
		variant={gradio.props.value === null && active_source === "upload"
			? "dashed"
			: "solid"}
		border_mode={dragging ? "focus" : "base"}
		padding={false}
		elem_id={gradio.shared.elem_id}
		elem_classes={gradio.shared.elem_classes}
		height={gradio.props.height || undefined}
		width={gradio.props.width}
		container={gradio.shared.container}
		scale={gradio.shared.scale}
		min_width={gradio.shared.min_width}
		allow_overflow={false}
	>
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			on:clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>

		<Video
			value={gradio.props.value?.video}
			subtitle={gradio.props.value?.subtitles}
			on:change={handle_change}
			on:drag={({ detail }) => (dragging = detail)}
			on:error={handle_error}
			bind:uploading
			label={gradio.shared.label}
			show_label={gradio.shared.show_label}
			show_download_button={gradio.props.buttons.includes("download")}
			sources={gradio.props.sources}
			{active_source}
			webcam_options={gradio.props.webcam_options}
			include_audio={gradio.props.include_audio}
			autoplay={gradio.props.autoplay}
			root={gradio.shared.root}
			loop={gradio.props.loop}
			{handle_reset_value}
			on:clear={() => {
				gradio.props.value = null;
				gradio.dispatch("clear");
			}}
			on:play={() => gradio.dispatch("play")}
			on:pause={() => gradio.dispatch("pause")}
			on:upload={() => gradio.dispatch("upload")}
			on:stop={() => gradio.dispatch("stop")}
			on:end={() => gradio.dispatch("end")}
			on:start_recording={() => gradio.dispatch("start_recording")}
			on:stop_recording={() => gradio.dispatch("stop_recording")}
			i18n={gradio.i18n}
			max_file_size={gradio.shared.max_file_size}
			upload={(...args) => gradio.shared.client.upload(...args)}
			stream_handler={(...args) => gradio.shared.client.stream(...args)}
		>
			<UploadText i18n={gradio.i18n} type="video" />
		</Video>
	</Block>
{/if}
