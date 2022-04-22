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
	import { fade } from "svelte/transition";
	import Loader from "./Loader.svelte";

	export let style: string = "";
	// export let eta: number | null = null;
	// export let duration: number = 8.2;
	// export let queue_pos: number | null = 0;
	export let tracked_status: "complete" | "pending" | "error";

	let el: HTMLDivElement;

	// onMount(async () => {
	// 	items.push(el);
	// 	console.log(items);

	// 	await tick();
	// 	console.log("all done");
	// 	return () => {
	// 		items.splice(items.findIndex((i) => i === el));
	// 		console.log(items);
	// 	};
	// });

	// $: progress = eta === null ? null : Math.min(duration / eta, 1);

	// let timer: NodeJS.Timeout | null = null;
	// let timer_start = 0;
	// let timer_diff = 0;

	// const start_timer = () => {
	// 	timer_start = performance.now();
	// 	timer_diff = 0;
	// 	timer = setInterval(() => {
	// 		timer_diff = (performance.now() - timer_start) / 1000;
	// 	}, 100);
	// };

	// const stop_timer = () => {
	// 	if (!timer) return;
	// 	clearInterval(timer);
	// };

	// onDestroy(() => {
	// 	if (timer) stop_timer();
	// });

	// $: {
	// 	if (tracked_status === "pending") {
	// 		start_timer();
	// 	} else {
	// 		stop_timer();
	// 	}
	// }

	$: el &&
		(tracked_status === "pending" || tracked_status === "complete") &&
		scroll_into_view(el);
</script>

<div
	class=" absolute top-0 left-0 w-full h-full z-10 flex flex-col justify-center items-center bg-white pointer-events-none transition-opacity"
	class:opacity-0={!tracked_status || tracked_status === "complete"}
	{style}
	bind:this={el}
>
	{#if tracked_status === "pending"}
		<Loader />
	{:else if tracked_status === "error"}
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
