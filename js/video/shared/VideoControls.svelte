<script lang="ts">
	import { Undo, Trim } from "@gradio/icons";
	import VideoTimeline from "./VideoTimeline.svelte";
	import { trimVideo } from "./utils";
	import { FFmpeg } from "@ffmpeg/ffmpeg";
	import loadFfmpeg from "./utils";
	import { onMount } from "svelte";

	export let videoElement: HTMLVideoElement;

	export let showRedo = false;
	export let interactive = true;
	export let mode = "";
	export let handle_reset_value: () => void;
	export let handle_trim_video: (videoBlob: Blob) => void;
	export let processingVideo = false;

	let ffmpeg: FFmpeg;

	onMount(async () => {
		ffmpeg = await loadFfmpeg();
	});

	$: if (mode === "edit" && trimmedDuration === null && videoElement)
		trimmedDuration = videoElement.duration;

	const formatTime = (seconds: number): string => {
		const minutes = Math.floor(seconds / 60);
		const secondsRemainder = Math.round(seconds) % 60;
		const paddedSeconds = `0${secondsRemainder}`.slice(-2);
		return `${minutes}:${paddedSeconds}`;
	};

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

<div class="container">
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
				class:hidden={loadingTimeline}>{formatTime(trimmedDuration)}</time
			>
		{:else}
			<div />
		{/if}

		<div class="settings-wrapper">
			{#if showRedo && mode === ""}
				<button
					class="action icon"
					disabled={processingVideo}
					aria-label="Reset video to initial value"
					on:click={() => {
						handle_reset_value();
						mode = "";
					}}
				>
					<Undo />
				</button>
			{/if}

			{#if interactive}
				{#if mode === ""}
					<button
						disabled={processingVideo}
						class="action icon"
						aria-label="Trim video to selection"
						on:click={toggleTrimmingMode}
					>
						<Trim />
					</button>
				{:else}
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
				{/if}
			{/if}
		</div>
	</div>
</div>

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
	.settings-wrapper {
		display: flex;
		justify-self: self-end;
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
	.hidden {
		display: none;
	}

	.text-button:hover,
	.text-button:focus {
		color: var(--color-accent);
		border-color: var(--color-accent);
	}

	.controls {
		display: grid;
		grid-template-columns: 1fr 1fr;
		margin: var(--spacing-lg);
		overflow: hidden;
		text-align: left;
	}

	@media (max-width: 320px) {
		.controls {
			display: flex;
			flex-wrap: wrap;
		}

		.controls * {
			margin: var(--spacing-sm);
		}

		.controls .text-button {
			margin-left: 0;
		}
	}
	.action {
		width: var(--size-5);
		width: var(--size-5);
		color: var(--neutral-400);
		margin-left: var(--spacing-md);
	}

	.action:disabled {
		cursor: not-allowed;
		color: var(--border-color-accent-subdued);
	}

	.action:disabled:hover {
		color: var(--border-color-accent-subdued);
	}

	.icon:hover,
	.icon:focus {
		color: var(--color-accent);
	}

	.container {
		display: flex;
		flex-direction: column;
	}
</style>
