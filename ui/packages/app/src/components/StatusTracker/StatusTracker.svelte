<script context="module" lang="ts">
	import { tick } from "svelte";
	import { fade } from "svelte/transition";

	let items: Array<HTMLDivElement> = [];

	let called = false;

	async function scroll_into_view(
		el: HTMLDivElement,
		enable: boolean | null = true
	) {
		if (
			window.__gradio_mode__ === "website" ||
			(window.__gradio_mode__ !== "app" && enable !== true)
		) {
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
	import { onDestroy } from "svelte";
	import { app_state } from "../../stores";
	import Loader from "./Loader.svelte";

	export let eta: number | null = null;
	export let queue: boolean = false;
	export let queue_position: number | null;
	export let queue_size: number | null;
	export let status: "complete" | "pending" | "error" | "generating";
	export let scroll_to_output: boolean = false;
	export let timer: boolean = true;
	export let visible: boolean = true;
	export let message: string | null = null;

	let el: HTMLDivElement;

	let _timer: boolean = false;
	let timer_start = 0;
	let timer_diff = 0;
	let old_eta: number | null = null;
	let message_visible: boolean = false;

	$: progress =
		eta === null || eta <= 0 || !timer_diff
			? null
			: Math.min(timer_diff / eta, 1);

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
		scroll_into_view(el, $app_state.autoscroll);

	let formatted_eta: string | null = null;
	$: {
		if (eta === null) {
			eta = old_eta;
		} else if (queue) {
			eta = (performance.now() - timer_start) / 1000 + eta;
		}
		if (eta != null) {
			formatted_eta = eta.toFixed(1);
			old_eta = eta;
		}
	}
	let show_message_timeout: NodeJS.Timeout | null = null;
	const close_message = () => {
		message_visible = false;
		if (show_message_timeout !== null) {
			clearTimeout(show_message_timeout);
		}
	};
	$: {
		close_message();
		if (status === "error" && message) {
			message_visible = true;
		}
	}
	$: formatted_timer = timer_diff.toFixed(1);
</script>

<div
	class="wrap"
	class:opacity-0={!status || status === "complete"}
	class:cover-bg={status === "pending" || status === "error"}
	class:generating={status === "generating"}
	class:!hidden={!visible}
	bind:this={el}
>
	{#if status === "pending"}
		<div class="progress-bar" style:transform="scaleX({progress || 0})" />
		<div class="meta-text dark:text-gray-400">
			{#if queue_position !== null && queue_size !== undefined && queue_position >= 0}
				queue: {queue_position + 1}/{queue_size} |
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
		{#if message_visible}
			<div class="fixed inset-0 z-[100]">
				<div
					class="absolute left-0 md:left-auto border-black right-0 top-0 h-96 md:w-1/2 bg-gradient-to-b md:bg-gradient-to-bl from-red-500/5 via-transparent to-transparent"
				/>
				<div
					class="absolute bg-white top-7 left-4 right-4 md:right-8 md:left-auto rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-2xl shadow-red-500/10 md:w-96 pointer-events-auto"
					on:click|stopPropagation
					in:fade={{ duration: 100 }}
				>
					<div
						class="flex items-center bg-gradient-to-r from-red-500/10 to-red-200/10 px-3 py-1 text-lg font-bold text-red-500"
					>
						Error
						<button
							on:click={close_message}
							class="ml-auto text-gray-900 text-2xl pr-1">×</button
						>
					</div>
					<div class="px-3 py-3 text-base font-mono">
						{message}
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style lang="postcss">
	.wrap {
		@apply absolute inset-0 z-50 flex flex-col justify-center items-center dark:bg-gray-800 pointer-events-none transition-opacity max-h-screen;
	}

	:global(.dark) .cover-bg {
		@apply bg-gray-800;
	}

	.cover-bg {
		@apply bg-white;
	}

	.generating {
		@apply border-2 border-orange-500 animate-pulse;
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
</style>
