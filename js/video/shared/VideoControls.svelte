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

	export let videoElement: HTMLVideoElement;

	export let showRedo = false;
	export let interactive = true;
	export let mode = "";
	export let handle_reset_value: () => void;
	export let handle_trim_video: (videoBlob: Blob) => void;
	export let processingVideo = false;
	export let i18n: (key: string) => string;
	export let value: FileData | null = null;
	export let show_download_button = false;
	export let handle_clear: () => void = () => {};
	export let has_change_history = false;

	let ffmpeg: FFmpeg;

	onMount(async () => {
		ffmpeg = await loadFfmpeg();
	});

	$: if (mode === "edit" && trimmedDuration === null && videoElement)
		trimmedDuration = videoElement.duration;

	let trimmedDuration: number | null = null;
	let dragStart = 0;
	let dragEnd = 0;

	let loadingTimeline = false;

	const toggleTrimmingMode = (): void => {
		if (mode === "edit") {
			mode = "";
			trimmedDuration = videoElement.duration;
		} else {
			mode = "edit";
		}
	};
</script>

<div class="container" class:hidden={mode !== "edit"}>
	{#if mode === "edit"}
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
					on:click={() => {
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
					on:click={toggleTrimmingMode}>Cancel</button
				>
			</div>
		{:else}
			<div />
		{/if}
	</div>
</div>

<ModifyUpload
	{i18n}
	on:clear={() => handle_clear()}
	download={show_download_button ? value?.url : null}
>
	{#if showRedo && mode === ""}
		<IconButton
			Icon={Undo}
			label="Reset video to initial value"
			disabled={processingVideo || !has_change_history}
			on:click={() => {
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
			on:click={toggleTrimmingMode}
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
