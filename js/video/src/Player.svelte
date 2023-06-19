<script lang="ts">
	import { tick, createEventDispatcher } from "svelte";
	import { Play, Pause, Maximise, Undo } from "@gradio/icons";

	export let src: string;
	export let subtitle: string | null = null;
	export let mirror: boolean;
	export let autoplay: boolean;

	const dispatch = createEventDispatcher<{
		play: undefined;
		pause: undefined;
		stop: undefined;
		end: undefined;
	}>();

	let time: number = 0;
	let duration: number;
	let paused: boolean = true;
	let video: HTMLVideoElement;

	function handleMove(e: TouchEvent | MouseEvent) {
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

	async function play_pause() {
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

	function handle_click(e: MouseEvent) {
		const { left, right } = (
			e.currentTarget as HTMLProgressElement
		).getBoundingClientRect();
		time = (duration * (e.clientX - left)) / (right - left);
	}

	function format(seconds: number) {
		if (isNaN(seconds) || !isFinite(seconds)) return "...";

		const minutes = Math.floor(seconds / 60);
		let _seconds: number | string = Math.floor(seconds % 60);
		if (seconds < 10) _seconds = `0${_seconds}`;

		return `${minutes}:${_seconds}`;
	}

	async function checkforVideo() {
		await tick();

		await tick();

		var b = setInterval(async () => {
			if (video.readyState >= 3) {
				video.currentTime = 9999;
				paused = true;

				setTimeout(async () => {
					video.currentTime = 0.0;
				}, 50);
				clearInterval(b);
			}
		}, 15);
	}

	async function _load() {
		checkforVideo();
	}

	$: src && _load();

	function handle_end() {
		dispatch("stop");
		dispatch("end");
	}

	$: autoplay && video && src && video.play();
</script>

<div class="wrap">
	<video
		{src}
		preload="auto"
		on:click={play_pause}
		on:play
		on:pause
		on:ended={handle_end}
		bind:currentTime={time}
		bind:duration
		bind:paused
		bind:this={video}
		class:mirror
	>
		<track kind="captions" src={subtitle} default />
	</video>

	<div class="controls">
		<div class="inner">
			<span class="icon" on:click={play_pause}>
				{#if time === duration}
					<Undo />
				{:else if paused}
					<Play />
				{:else}
					<Pause />
				{/if}
			</span>

			<span class="time">{format(time)} / {format(duration)}</span>
			<progress
				value={time / duration || 0}
				on:mousemove={handleMove}
				on:touchmove|preventDefault={handleMove}
				on:click|stopPropagation|preventDefault={handle_click}
			/>

			<div class="icon" on:click={() => video.requestFullscreen()}>
				<Maximise />
			</div>
		</div>
	</div>
</div>

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

	video {
		position: inherit;
		background-color: black;
		width: var(--size-full);
		height: var(--size-full);
		object-fit: contain;
	}

	.mirror {
		transform: scaleX(-1);
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
	}
	.wrap:hover .controls {
		opacity: 1;
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
	}
</style>
