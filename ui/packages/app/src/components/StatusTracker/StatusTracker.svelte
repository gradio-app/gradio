<script context="module" lang="ts">
	import { tick } from "svelte";

	let items: Array<HTMLDivElement> = [];

	let called = false;

	async function scroll_into_view(el: HTMLDivElement) {
		console.log(el);
		if (window.__gradio_mode__ === "website") {
			return;
		}

		items.push(el);
		if (!called) called = true;
		else return;

		await tick();

		requestAnimationFrame(() => {
			let min = [0, 0];

			for (let i = 0; i < items.length; i++) {
				const element = items[i];

				const box = element.getBoundingClientRect();
				if (i === 0 || box.top + window.scrollY <= min[0]) {
					min[0] = box.top + window.scrollY;
					min[1] = i;
				}
			}

			window.scrollTo({ top: min[0] - 20, behavior: "smooth" });

			called = false;
			items = [];
		});
	}
</script>

<script lang="ts">
	import { onDestroy, onMount } from "svelte";
	import Loader from "./Loader.svelte";

	export let eta: number | null = null;
	export let queue_position: number | null;
	export let status: "complete" | "pending" | "error";
	export let scroll_to_output: boolean = false;
	export let timer: boolean = true;
	export let cover_all: boolean = false;
	export let visible: boolean = true;

	let el: HTMLDivElement;

	let _timer: boolean = false;
	let timer_start = 0;
	let timer_diff = 0;

	let initial_queue_pos = queue_position;

	$: if (
		queue_position &&
		(!initial_queue_pos || queue_position > initial_queue_pos)
	) {
		initial_queue_pos = queue_position;
	}

	$: progress =
		eta === null || !timer_diff
			? null
			: Math.min(timer_diff / (eta * ((initial_queue_pos || 0) + 1)), 1);

	const start_timer = () => {
		timer_start = performance.now();
		timer_diff = 0;
		_timer = true;
		run();
		// timer = setInterval(, 100);
	};

	function run() {
		requestAnimationFrame(() => {
			timer_diff = (performance.now() - timer_start) / 1000;
			if (_timer) run();
		});
	}

	const stop_timer = () => {
		timer_diff = 0;

		if (!_timer) return;
		_timer = false;
	};

	onDestroy(() => {
		if (_timer) stop_timer();
	});

	$: {
		if (status === "pending") {
			start_timer();
		} else {
			stop_timer();
		}
	}

	$: el &&
		scroll_to_output &&
		(status === "pending" || status === "complete") &&
		scroll_into_view(el);

	$: formatted_eta = eta && (eta * ((initial_queue_pos || 0) + 1)).toFixed(1);
	$: formatted_timer = timer_diff.toFixed(1);
</script>

{#if status && status !== "complete" && (visible || status === "error")}
	<div class="wrap" class:z-50={cover_all} bind:this={el}>
		{#if status === "pending"}
			<div class="progress-bar" style:transform="scaleX({progress || 0})" />
			<div class="meta-text">
				{#if queue_position !== null && queue_position > 0}
					queue: {queue_position}/{initial_queue_pos} |
				{:else if queue_position === 0}
					processing |
				{/if}

				{#if timer}
					{formatted_timer}{eta ? `/${formatted_eta}` : ""}
				{/if}
			</div>

			<Loader />

			{#if !timer}
				<p class="timer">Loading...</p>
			{/if}
		{:else if status === "error"}
			<span class="error">ERROR</span>
		{/if}
	</div>
{/if}

<style lang="postcss">
	.wrap {
		@apply absolute inset-0  z-10 flex flex-col justify-center items-center bg-white dark:bg-gray-800 pointer-events-none transition-opacity max-h-screen;
	}

	:global(.dark) .wrap {
		@apply bg-gray-800;
	}

	.progress-bar {
		@apply absolute inset-0  origin-left bg-slate-100 dark:bg-gray-700 top-0 left-0 z-10 opacity-80;
	}

	.meta-text {
		@apply absolute top-0 right-0 py-1 px-2 font-mono z-20 text-xs;
	}

	.timer {
		@apply -translate-y-16;
	}

	.error {
		@apply text-red-400 font-mono font-semibold text-lg;
	}
	@keyframes blink {
		0% {
			opacity: 100%;
		}
		50% {
			opacity: 60%;
		}
		100% {
			opacity: 100%;
		}
	}
	.blink {
		animation: blink 2s infinite;
	}
	@keyframes bounce {
		0% {
			left: 0%;
		}
		50% {
			left: 75%;
		}
		100% {
			left: 0%;
		}
	}
	.bounce {
		animation: bounce 2s infinite linear;
	}
</style>
