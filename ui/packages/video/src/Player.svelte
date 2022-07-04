<script lang="ts">
	import { tick } from "svelte";
	import { Play, Pause } from "@gradio/icons";

	export let src: string;
	export let mirror: boolean;

	let time: number = 0;
	let duration: number;
	let paused: boolean = true;
	let video: HTMLVideoElement;

	let show_controls = true;
	let show_controls_timeout: NodeJS.Timeout;

	function video_move() {
		clearTimeout(show_controls_timeout);
		show_controls_timeout = setTimeout(() => (show_controls = false), 2500);
		show_controls = true;
	}

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

	function play_pause() {
		if (paused) video.play();
		else video.pause();
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

	async function _load() {
		await tick();
		video.currentTime = 9999;

		setTimeout(async () => {
			video.currentTime = 0.0;
		}, 50);
	}

	$: src && _load();
</script>

<div>
	<video
		{src}
		preload="auto"
		on:mousemove={video_move}
		on:click={play_pause}
		on:play
		on:pause
		on:ended
		bind:currentTime={time}
		bind:duration
		bind:paused
		bind:this={video}
		class="w-full h-full object-contain bg-black"
		class:mirror
	>
		<track kind="captions" />
	</video>

	<div
		class="absolute bottom-0 w-full transition duration-500 h-10"
		style="opacity: {duration && show_controls ? 1 : 0}"
		on:mousemove={video_move}
	>
		<div class="flex w-full justify-space h-full items-center px-3">
			<span
				class="font-mono w-5 cursor-pointer text-white"
				on:click={play_pause}
			>
				{#if paused}
					<Play />
				{:else}
					<Pause />
				{/if}
			</span>

			<span class="font-mono shrink-0 text-xs mx-3 text-white"
				>{format(time)} / {format(duration)}</span
			>
			<progress
				value={time / duration || 0}
				on:mousemove={handleMove}
				on:touchmove|preventDefault={handleMove}
				on:click|stopPropagation|preventDefault={handle_click}
				class="rounded h-2 w-full"
			/>
		</div>
	</div>
</div>

<style lang="postcss">
	span {
		text-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
	}

	progress::-webkit-progress-bar {
		border-radius: 2px;
		background-color: rgba(0, 0, 0, 0.4);
		overflow: hidden;
	}

	progress::-webkit-progress-value {
		/* border-radius: 2px; */

		background-color: rgba(255, 255, 255, 0.8);
	}

	.mirror {
		transform: scaleX(-1);
	}
</style>
