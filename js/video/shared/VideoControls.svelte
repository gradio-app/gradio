<script lang="ts">
	import { Undo, Trim, Clear } from "@gradio/icons";
	import VideoTimeline from "./VideoTimeline.svelte";
	import { trimVideo } from "./utils";
	import { FFmpeg } from "@ffmpeg/ffmpeg";
	import loadFfmpeg from "./utils";
	import { onMount } from "svelte";
	import { format_time } from "@gradio/utils";
	import { IconButton } from "@gradio/atoms";
	import { ModifyUpload } from "@gradio/upload";
	import type { FileData } from "@gradio/client";

	interface Props {
		videoElement?: HTMLVideoElement;
		showRedo?: boolean;
		interactive?: boolean;
		mode?: string;
		handle_reset_value: () => void;
		handle_trim_video: (videoBlob: Blob) => void;
		processingVideo?: boolean;
		i18n: (key: string) => string;
		value?: FileData | null;
		show_download_button?: boolean;
		handle_clear?: () => void;
		has_change_history?: boolean;
	}

	let {
		videoElement = undefined,
		showRedo = false,
		interactive = true,
		mode = $bindable(""),
		handle_reset_value,
		handle_trim_video,
		processingVideo = $bindable(false),
		i18n,
		value = null,
		show_download_button = false,
		handle_clear = () => {},
		has_change_history = false
	}: Props = $props();

	let ffmpeg: FFmpeg;

	onMount(async () => {
		ffmpeg = await loadFfmpeg();
	});

	$effect(() => {
		if (mode === "edit" && trimmedDuration === null && videoElement) {
			trimmedDuration = videoElement.duration;
		}
	});

	let trimmedDuration = $state<number | null>(null);
	let dragStart = $state(0);
	let dragEnd = $state(0);

	let loadingTimeline = $state(false);

	const toggleTrimmingMode = (): void => {
		if (mode === "edit") {
			mode = "";
			if (videoElement) {
				trimmedDuration = videoElement.duration;
			}
		} else {
			mode = "edit";
		}
	};
</script>

<div class="container" class:hidden={mode !== "edit"}>
	{#if mode === "edit" && videoElement}
		<div class="timeline-wrapper">
			<VideoTimeline
				{videoElement}
				bind:dragStart
				bind:dragEnd
				bind:trimmedDuration
				bind:loadingTimeline
			/>
		</div>
	{/if}

	<div class="controls" data-testid="waveform-controls">
		{#if mode === "edit" && trimmedDuration !== null}
			<time
				aria-label="duration of selected region in seconds"
				class:hidden={loadingTimeline}>{format_time(trimmedDuration)}</time
			>
			<div class="edit-buttons">
				<button
					class:hidden={loadingTimeline}
					class="text-button"
					onclick={() => {
						if (!videoElement) return;
						mode = "";
						processingVideo = true;
						trimVideo(ffmpeg, dragStart, dragEnd, videoElement)
							.then((videoBlob) => {
								handle_trim_video(videoBlob);
							})
							.then(() => {
								processingVideo = false;
							});
					}}>Trim</button
				>
				<button
					class="text-button"
					class:hidden={loadingTimeline}
					onclick={toggleTrimmingMode}>Cancel</button
				>
			</div>
		{:else}
			<div />
		{/if}
	</div>
</div>

<ModifyUpload
	{i18n}
	onclear={() => handle_clear()}
	download={show_download_button ? value?.url : null}
>
	{#if showRedo && mode === ""}
		<IconButton
			Icon={Undo}
			label="Reset video to initial value"
			disabled={processingVideo || !has_change_history}
			onclick={() => {
				handle_reset_value();
				mode = "";
			}}
		/>
	{/if}

	{#if interactive && mode === ""}
		<IconButton
			Icon={Trim}
			label="Trim video to selection"
			disabled={processingVideo}
			onclick={toggleTrimmingMode}
		/>
	{/if}
</ModifyUpload>

<style>
	.container {
		width: 100%;
	}
	time {
		color: var(--color-accent);
		font-weight: bold;
		padding-left: var(--spacing-xs);
	}

	.timeline-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
	}

	.text-button {
		border: 1px solid var(--neutral-400);
		border-radius: var(--radius-sm);
		font-weight: 300;
		font-size: var(--size-3);
		text-align: center;
		color: var(--neutral-400);
		height: var(--size-5);
		font-weight: bold;
		padding: 0 5px;
		margin-left: 5px;
	}

	.text-button:hover,
	.text-button:focus {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: var(--spacing-lg);
		overflow: hidden;
	}

	.edit-buttons {
		display: flex;
		gap: var(--spacing-sm);
	}

	@media (max-width: 320px) {
		.controls {
			flex-direction: column;
			align-items: flex-start;
		}

		.edit-buttons {
			margin-top: var(--spacing-sm);
		}

		.controls * {
			margin: var(--spacing-sm);
		}

		.controls .text-button {
			margin-left: 0;
		}
	}

	.container {
		display: flex;
		flex-direction: column;
	}

	.hidden {
		display: none;
	}
</style>
