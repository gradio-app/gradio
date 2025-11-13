<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import WaveSurfer from "wavesurfer.js";
	import type { FileData } from "@gradio/client";
	import { format_time } from "@gradio/utils";

	export let value: FileData;
	export let label: string;
	export let loop = false;

	let container: HTMLDivElement;
	let waveform: WaveSurfer | undefined;
	let playing = false;
	let duration = 0;
	let currentTime = 0;
	let waveform_ready = false;

	$: resolved_src = value.url;

	const create_waveform = async (): Promise<void> => {
		if (!container || !resolved_src || waveform_ready) return;

		if (waveform) {
			waveform.destroy();
		}

		const accentColor =
			getComputedStyle(document.documentElement).getPropertyValue(
				"--color-accent"
			) || "#ff7c00";

		waveform = WaveSurfer.create({
			container,
			height: 32,
			waveColor: "rgba(128, 128, 128, 0.5)",
			progressColor: accentColor,
			cursorColor: "transparent",
			barWidth: 2,
			barGap: 2,
			barRadius: 2,
			normalize: true,
			interact: true,
			dragToSeek: true,
			hideScrollbar: true
		});

		waveform.on("play", () => (playing = true));
		waveform.on("pause", () => (playing = false));
		waveform.on("ready", () => {
			duration = waveform?.getDuration() || 0;
			waveform_ready = true;
		});
		waveform.on("audioprocess", () => {
			currentTime = waveform?.getCurrentTime() || 0;
		});
		waveform.on("interaction", () => {
			currentTime = waveform?.getCurrentTime() || 0;
		});
		waveform.on("finish", () => {
			playing = false;
			if (loop) {
				waveform?.play();
			}
		});

		await waveform.load(resolved_src);
	};

	onMount(async () => {
		await create_waveform();
	});

	onDestroy(() => {
		if (waveform) {
			waveform.destroy();
		}
	});

	const togglePlay = (): void => {
		if (waveform) {
			waveform.playPause();
		}
	};
</script>

<div
	class="minimal-audio-player"
	aria-label={label || "Audio"}
	data-testid={label && label.trim() ? "waveform-" + label : "unlabelled-audio"}
>
	<button
		class="play-btn"
		on:click={togglePlay}
		aria-label={playing ? "Pause" : "Play"}
	>
		{#if playing}
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
				<rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
			</svg>
		{:else}
			<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
				<path
					d="M8 5.74537C8 5.06444 8.77346 4.64713 9.35139 5.02248L18.0227 10.2771C18.5518 10.6219 18.5518 11.3781 18.0227 11.7229L9.35139 16.9775C8.77346 17.3529 8 16.9356 8 16.2546V5.74537Z"
					fill="currentColor"
				/>
			</svg>
		{/if}
	</button>

	<div class="waveform-wrapper" bind:this={container}></div>

	<div class="timestamp">{format_time(playing ? currentTime : duration)}</div>
</div>

<style>
	.minimal-audio-player {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		border-radius: var(--radius-sm);
		width: var(--size-52);
		padding: var(--spacing-sm);
	}

	.play-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: none;
		background: none;
		color: var(--body-text-color);
		opacity: 0.7;
		cursor: pointer;
		border-radius: 50%;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.play-btn:hover {
		color: var(--color-accent);
		opacity: 1;
	}

	.play-btn:active {
		transform: scale(0.95);
	}

	.play-btn svg {
		width: var(--size-5);
		height: var(--size-5);
		display: block;
	}

	.waveform-wrapper {
		flex: 1 1 auto;
		cursor: pointer;
		width: auto;
	}

	.waveform-wrapper :global(::part(wrapper)) {
		margin-bottom: 0;
	}

	.timestamp {
		font-size: 13px;
		font-weight: 500;
		color: var(--body-text-color);
		opacity: 0.7;
		font-variant-numeric: tabular-nums;
		flex-shrink: 0;
		min-width: 40px;
		text-align: center;
	}

	@media (prefers-reduced-motion: reduce) {
		.play-btn {
			transition: none;
		}
	}
</style>
