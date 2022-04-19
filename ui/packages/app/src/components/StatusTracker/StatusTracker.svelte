<script lang="ts">
	import { onDestroy } from "svelte";

	export let style: string = "";
	export let cover_container: bool = false;
	export let eta: number | null = null;
	export let duration: number = 8.2;
	export let queue_pos: number | null = 0;
	export let tracked_status: "complete" | "pending" | "error";

	$: progress = eta === null ? null : Math.min(duration / eta, 1);

	let timer: NodeJS.Timeout = null;
	let timer_start = 0;
	let timer_diff = 0;

	const start_timer = () => {
		timer_start = Date.now();
		timer_diff = 0;
		timer = setInterval(() => {
			timer_diff = (Date.now() - timer_start) / 1000;
		}, 100);
	};

	const stop_timer = () => {
		clearInterval(timer);
	};

	onDestroy(() => {
		if (timer) stop_timer();
	});

	$: {
		if (tracked_status === "pending") {
			start_timer();
		} else {
			stop_timer();
		}
	}
</script>

{#if tracked_status === "pending"}
	<div class:cover_container {style}>
		<div class="text-xs font-mono text-gray-400">
			{#if queue_pos}
				{queue_pos} in line
			{:else}
				{timer_diff.toFixed(1)}s
			{/if}
		</div>
		<div class="border-gray-200 rounded border w-40 h-2 relative">
			{#if progress === null}
				<div class="bounce absolute bg-amber-500 shadow-inner h-full w-1/4" />
			{:else}
				<div
					class="blink bg-amber-500 shadow-inner h-full"
					style="width: {progress * 100}%;"
				/>
			{/if}
		</div>
	</div>
{:else if tracked_status === "error"}
	<div class:cover_container {style}>
		<span class="text-red-400 font-mono font-semibold text-lg">ERROR</span>
	</div>
{/if}

<style lang="postcss">
	.cover_container {
		@apply absolute top-0 left-0 w-full h-full z-10 flex flex-col justify-center items-center bg-gray-100 bg-opacity-25;
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
