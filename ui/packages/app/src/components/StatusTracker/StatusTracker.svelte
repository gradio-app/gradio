<script context="module" lang="ts">
	import { tick } from "svelte";

	let items: Array<HTMLDivElement> = [];

	let called = false;

	async function scroll_into_view(el: HTMLDivElement) {
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

	export let style: string = "";
	export let eta: number | null = null;
	export let queue_position: number | null;
	export let status: "complete" | "pending" | "error";

	let el: HTMLDivElement;

	let timer: boolean = false;
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
		timer = true;
		run();
		// timer = setInterval(, 100);
	};

	function run() {
		requestAnimationFrame(() => {
			timer_diff = (performance.now() - timer_start) / 1000;
			if (timer) run();
		});
	}

	const stop_timer = () => {
		timer_diff = 0;

		if (!timer) return;
		timer = false;
	};

	onDestroy(() => {
		if (timer) stop_timer();
	});

	$: {
		if (status === "pending") {
			start_timer();
		} else {
			stop_timer();
		}
	}

	$: el &&
		(status === "pending" || status === "complete") &&
		scroll_into_view(el);

	$: formatted_eta = eta && (eta * ((initial_queue_pos || 0) + 1)).toFixed(1);
	$: formatted_timer = timer_diff.toFixed(1);
</script>

<div
	class=" absolute inset-0  z-10 flex flex-col justify-center items-center bg-white pointer-events-none transition-opacity"
	class:opacity-0={!status || status === "complete"}
	{style}
	bind:this={el}
>
	{#if status === "pending"}
		<div
			class="absolute inset-0  origin-left bg-slate-100 top-0 left-0 z-10 opacity-80"
			style:transform="scaleX({progress || 0})"
		/>
		<div class="absolute top-0 right-0 py-1 px-2 font-mono z-20 text-xs">
			{#if queue_position !== null && queue_position > 0}
				queue: {queue_position}/{initial_queue_pos} |
			{:else if queue_position === 0}
				processing |
			{/if}

			{formatted_timer}{eta ? `/${formatted_eta}s` : "s"}
		</div>

		<Loader />
	{:else if status === "error"}
		<span class="text-red-400 font-mono font-semibold text-lg">ERROR</span>
	{/if}
</div>

<style lang="postcss">
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
