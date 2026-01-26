<script lang="ts">
	import { onMount, onDestroy } from "svelte";
	import { Play, Pause, Maximize, Undo } from "@gradio/icons";
	import Video from "./Video.svelte";
	import VideoControls from "./VideoControls.svelte";
	import VolumeControl from "./VolumeControl.svelte";
	import VolumeLevels from "../../audio/shared/VolumeLevels.svelte";
	import type { FileData, Client } from "@gradio/client";
	import { prepare_files } from "@gradio/client";
	import { format_time } from "@gradio/utils";
	import type { I18nFormatter } from "@gradio/utils";

	interface Props {
		root?: string;
		src: string;
		subtitle?: string | null;
		mirror: boolean;
		autoplay: boolean;
		loop: boolean;
		label?: string;
		interactive?: boolean;
		handle_change?: (video: FileData) => void;
		handle_reset_value?: () => void;
		upload: Client["upload"];
		is_stream?: boolean;
		i18n: I18nFormatter;
		show_download_button?: boolean;
		value?: FileData | null;
		handle_clear?: () => void;
		has_change_history?: boolean;
		playback_position?: number;
		onplay?: () => void;
		onpause?: () => void;
		onstop?: () => void;
		onend?: () => void;
		onerror?: (error: string) => void;
		onloadstart?: () => void;
		onloadeddata?: () => void;
		onloadedmetadata?: () => void;
	}

	let {
		root = "",
		src,
		subtitle = null,
		mirror,
		autoplay,
		loop,
		label = "test",
		interactive = false,
		handle_change = () => {},
		handle_reset_value = () => {},
		upload,
		is_stream = undefined,
		i18n,
		show_download_button = false,
		value = null,
		handle_clear = () => {},
		has_change_history = false,
		playback_position = $bindable(),
		onplay,
		onpause,
		onstop,
		onend,
		onerror,
		onloadstart,
		onloadeddata,
		onloadedmetadata
	}: Props = $props();

	let time = $state(0);
	let duration = $state<number>(0);
	let paused = $state(true);
	let video = $state<HTMLVideoElement>();
	let processingVideo = $state(false);
	let show_volume_slider = $state(false);
	let current_volume = $state(1);
	let is_fullscreen = $state(false);

	function handleMove(e: TouchEvent | MouseEvent): void {
		if (!duration) return;

		if (e.type === "click") {
			handle_click(e as MouseEvent);
			return;
		}

		if (e.type !== "touchmove" && !((e as MouseEvent).buttons & 1)) return;

		const clientX =
			e.type === "touchmove"
				? (e as TouchEvent).touches[0].clientX
				: (e as MouseEvent).clientX;
		const { left, right } = (
			e.currentTarget as HTMLProgressElement
		).getBoundingClientRect();
		time = (duration * (clientX - left)) / (right - left);
	}

	async function play_pause(): Promise<void> {
		if (!video) return;
		if (document.fullscreenElement != video) {
			const isPlaying =
				video.currentTime > 0 &&
				!video.paused &&
				!video.ended &&
				video.readyState > video.HAVE_CURRENT_DATA;

			if (!isPlaying) {
				await video.play();
			} else video.pause();
		}
	}

	function handle_click(e: MouseEvent): void {
		if (!duration) return;
		const { left, right } = (
			e.currentTarget as HTMLProgressElement
		).getBoundingClientRect();
		time = (duration * (e.clientX - left)) / (right - left);
	}

	function handle_end(): void {
		onstop?.();
		onend?.();
	}

	const handle_trim_video = async (videoBlob: Blob): Promise<void> => {
		let _video_blob = new File([videoBlob], "video.mp4");
		const val = await prepare_files([_video_blob]);
		let value = ((await upload(val, root))?.filter(Boolean) as FileData[])[0];

		handle_change(value);
	};

	function open_full_screen(): void {
		if (!video) return;
		if (!is_fullscreen) {
			video.requestFullscreen();
		} else {
			document.exitFullscreen();
		}
	}

	function handleFullscreenChange(): void {
		is_fullscreen = document.fullscreenElement === video;
		if (video) {
			video.controls = is_fullscreen;
		}
	}

	let last_synced_volume = 1;
	let previous_video: HTMLVideoElement | undefined;
	// Tolerance for floating-point comparison of volume values
	const VOLUME_EPSILON = 0.001;

	function handleVolumeChange(): void {
		if (video && Math.abs(video.volume - last_synced_volume) > VOLUME_EPSILON) {
			current_volume = video.volume;
			last_synced_volume = video.volume;
		}
	}

	onMount(() => {
		document.addEventListener("fullscreenchange", handleFullscreenChange);
		return () => {
			document.removeEventListener("fullscreenchange", handleFullscreenChange);
		};
	});

	onDestroy(() => {
		if (video) {
			video.removeEventListener("volumechange", handleVolumeChange);
		}
	});

	$effect(() => {
		if (video && video !== previous_video) {
			if (previous_video) {
				previous_video.removeEventListener("volumechange", handleVolumeChange);
			}
			video.addEventListener("volumechange", handleVolumeChange);
			previous_video = video;
		}
	});

	$effect(() => {
		time = time || 0;
	});

	$effect(() => {
		duration = duration || 0;
	});

	$effect(() => {
		playback_position = time;
	});

	$effect(() => {
		if (playback_position !== time && video) {
			video.currentTime = playback_position;
		}
	});

	$effect(() => {
		if (video && !is_fullscreen) {
			if (Math.abs(video.volume - current_volume) > VOLUME_EPSILON) {
				video.volume = current_volume;
				last_synced_volume = current_volume;
			}
			video.controls = false;
		}
	});

	$effect(() => {
		if (video && is_fullscreen) {
			last_synced_volume = video.volume;
		}
	});
</script>

<div class="wrap">
	<div class="mirror-wrap" class:mirror>
		<Video
			{src}
			preload="auto"
			{autoplay}
			{loop}
			{is_stream}
			controls={is_fullscreen}
			onclick={play_pause}
			onplay={() => onplay?.()}
			onpause={() => onpause?.()}
			onerror={(error) => onerror?.(error)}
			onended={handle_end}
			bind:currentTime={time}
			bind:duration
			bind:paused
			bind:node={video}
			data-testid={`${label}-player`}
			{processingVideo}
			onloadstart={() => onloadstart?.()}
			onloadeddata={() => onloadeddata?.()}
			onloadedmetadata={() => onloadedmetadata?.()}
		>
			<track kind="captions" src={subtitle} default />
		</Video>
	</div>

	<div class="controls">
		<div class="inner">
			<span
				role="button"
				tabindex="0"
				class="icon"
				aria-label="play-pause-replay-button"
				onclick={play_pause}
				onkeydown={play_pause}
			>
				{#if time === duration}
					<Undo />
				{:else if paused}
					<Play />
				{:else}
					<Pause />
				{/if}
			</span>

			<span class="time">{format_time(time)} / {format_time(duration)}</span>

			<!-- TODO: implement accessible video timeline for 4.0 -->
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<progress
				value={time / duration || 0}
				onmousemove={handleMove}
				ontouchmove={(e) => {
					e.preventDefault();
					handleMove(e);
				}}
				onclick={(e) => {
					e.stopPropagation();
					e.preventDefault();
					handle_click(e);
				}}
			></progress>

			<div class="volume-control-wrapper">
				<button
					class="icon volume-button"
					style:color={show_volume_slider ? "var(--color-accent)" : "white"}
					aria-label="Adjust volume"
					onclick={() => (show_volume_slider = !show_volume_slider)}
				>
					<VolumeLevels currentVolume={current_volume} />
				</button>

				{#if show_volume_slider}
					<VolumeControl bind:current_volume bind:show_volume_slider />
				{/if}
			</div>

			{#if !show_volume_slider}
				<div
					role="button"
					tabindex="0"
					class="icon"
					aria-label="full-screen"
					onclick={open_full_screen}
					onkeypress={open_full_screen}
				>
					<Maximize />
				</div>
			{/if}
		</div>
	</div>
</div>
{#if interactive}
	<VideoControls
		videoElement={video}
		showRedo
		{handle_trim_video}
		{handle_reset_value}
		bind:processingVideo
		{value}
		{i18n}
		{show_download_button}
		{handle_clear}
		{has_change_history}
	/>
{/if}

<style lang="postcss">
	span {
		text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
	}

	progress {
		margin-right: var(--size-3);
		border-radius: var(--radius-sm);
		width: var(--size-full);
		height: var(--size-2);
	}

	progress::-webkit-progress-bar {
		border-radius: 2px;
		background-color: rgba(255, 255, 255, 0.2);
		overflow: hidden;
	}

	progress::-webkit-progress-value {
		background-color: rgba(255, 255, 255, 0.9);
	}

	.mirror {
		transform: scaleX(-1);
	}

	.mirror-wrap {
		position: relative;
		height: 100%;
		width: 100%;
	}

	.controls {
		position: absolute;
		bottom: 0;
		opacity: 0;
		transition: 500ms;
		margin: var(--size-2);
		border-radius: var(--radius-md);
		background: var(--color-grey-800);
		padding: var(--size-2) var(--size-1);
		width: calc(100% - 0.375rem * 2);
		width: calc(100% - var(--size-2) * 2);
		z-index: 10;
	}
	.wrap:hover .controls {
		opacity: 1;
	}
	:global(:fullscreen) .controls {
		display: none;
	}

	.inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-right: var(--size-2);
		padding-left: var(--size-2);
		width: var(--size-full);
		height: var(--size-full);
	}

	.icon {
		display: flex;
		justify-content: center;
		cursor: pointer;
		width: var(--size-6);
		color: white;
	}

	.volume-control-wrapper {
		position: relative;
		display: flex;
		align-items: center;
		margin-right: var(--spacing-md);
	}

	.volume-button {
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
		width: var(--size-6);
		color: white;
		border: none;
		background: none;
		padding: 0;
	}

	.time {
		flex-shrink: 0;
		margin-right: var(--size-3);
		margin-left: var(--size-3);
		color: white;
		font-size: var(--text-sm);
		font-family: var(--font-mono);
	}
	.wrap {
		position: relative;
		background-color: var(--background-fill-secondary);
		height: var(--size-full);
		width: var(--size-full);
		border-radius: var(--radius-xl);
	}
	.wrap :global(video) {
		height: var(--size-full);
		width: var(--size-full);
	}
</style>
