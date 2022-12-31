<script context="module" lang="ts">
	import { tick } from "svelte";
	import { fade } from "svelte/transition";
	import { Clear } from "@gradio/icons";

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

	export let eta: number | null = 99;
	export let queue: boolean = false;
	export let queue_position: number | null;
	export let queue_size: number | null;
	export let status: "complete" | "pending" | "error" | "generating";
	export let scroll_to_output: boolean = false;
	export let timer: boolean = true;
	export let visible: boolean = true;
	export let message: string | null = null;
	export let variant: "default" | "center" = "default";

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
	class="wrap {variant}"
	class:hide={!status || status === "complete" || !visible}
	class:translucent={variant === "center" &&
		(status === "pending" || status === "error")}
	class:generating={status === "generating"}
	bind:this={el}
>
	{#if status === "pending"}
		{#if variant === "default"}
			<div
				class="progress-bar"
				style:transform="translateX({(progress || 0) * 100}%)"
			/>
		{/if}
		<div
			class:meta-text-center={variant === "center"}
			class:meta-text={variant === "default"}
		>
			{#if queue_position !== null && queue_size !== undefined && queue_position >= 0}
				queue: {queue_position + 1}/{queue_size} |
			{:else if queue_position === 0}
				processing |
			{/if}

			{#if timer}
				{formatted_timer}{eta ? `/${formatted_eta}` : ""}
			{/if}
		</div>

		<Loader margin={variant === "default"} />

		{#if !timer}
			<p class="timer">Loading...</p>
		{/if}
	{:else if status === "error"}
		<span class="error">Error</span>
		{#if message_visible}
			<div class="toast">
				<div
					class="toast-body"
					on:click|stopPropagation
					in:fade={{ duration: 100 }}
				>
					<button on:click={close_message} class="toast-close"
						><svg
							width="100%"
							height="100%"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="feather feather-x"
							><line x1="18" y1="6" x2="6" y2="18" /><line
								x1="6"
								y1="6"
								x2="18"
								y2="18"
							/></svg
						></button
					>

					<div class="toast-details">
						<div class="toast-title">Something went wrong</div>
						<div class="toast-text">
							{message}
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style lang="postcss">
	.wrap {
		position: absolute;
		z-index: var(--layer-5);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		pointer-events: none;
		max-height: var(--size-screen);
		background-color: var(--color-background-tertiary);
	}

	.wrap.center {
		left: 0px;
		right: 0px;
		top: 0;
	}

	.wrap.default {
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
	}

	.hide {
		opacity: 0;
	}

	.generating {
		border: 2px solid var(--color-accent-base);
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	.translucent {
		background: none;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.progress-bar {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		transform-origin: left;
		z-index: var(--layer-1);
		opacity: 0.8;
		background: var(--color-background-secondary);
		box-shadow: 2px 0px 2px 2px rgba(0, 0, 0, 0.2);
		transition: 0.5s;
	}

	.meta-text {
		position: absolute;
		top: 0;
		right: 0;
		padding: var(--size-1) var(--size-2);
		font-family: var(--font-mono);
		z-index: var(--layer-2);
		font-size: var(--scale-000);
	}

	.meta-text-center {
		position: absolute;
		top: 0;
		right: 0;
		padding: var(--size-1) var(--size-2);
		font-family: var(--font-mono);
		z-index: var(--layer-2);
		font-size: var(--scale-000);
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		transform: translateY(var(--size-6));
	}

	.timer {
		transform: translateY(var(--size-16));
	}

	.error {
		color: var(--color-functional-error-base);
		background-color: var(--color-background-primary);
		background: rgba(255, 0, 0, 0.2);
		border-radius: var(--radius-full);
		font-family: var(--font-sans);
		font-weight: var(--weight-semibold);
		font-size: var(--scale-1);
		line-height: var(--line-lg);
		padding-left: var(--size-4);
		padding-right: var(--size-4);
		box-shadow: var(--shadow-drop);
	}

	.toast {
		position: fixed;
		top: 0;
		left: var(--size-4);
		right: var(--size-4);
		bottom: 0;
		z-index: var(--layer-top);
		padding: var(--size-4);
	}

	.toast-body {
		position: absolute;
		background: var(--color-background-secondary);
		top: var(--size-8);
		left: 0;
		right: 0;
		border: 1px solid var(--color-border-primary);
		overflow: hidden;
		border-radius: var(--radius-lg);
		pointer-events: auto;
		box-shadow: var(--shadow-drop-lg-xl);
		padding: var(--size-4) var(--size-6);
		display: flex;
		align-items: center;
		max-width: 1200px;
		margin: var(--size-6) var(--size-4);
		max-width: 610px;
		margin: auto;
	}

	.toast-title {
		display: flex;
		align-items: center;
		padding: var(--size-1) var(--size-3);
		font-size: var(--scale-0);
		font-weight: var(--weight-bold);
		line-height: var(--line-xs);

		color: var(--color-functional-error-base);
		color: var(--color-red-500);
	}

	.toast-close {
		height: var(--size-10);
		width: var(--size-10);
		font-size: var(--scale-5);
		border-radius: var(--radius-full);
		background: var(--color-red-600);
		color: var(--color-text-body);
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: var(--size-2);
		padding-left: calc(var(--size-2) - 1px);
		font-weight: var(--weight-bold);
		flex-shrink: 0;
	}

	.toast-text {
		font-size: var(--scale-00);
		padding: var(--size-1) var(--size-3);
		font-family: var(--font-mono);
	}

	.toast-details {
		width: 100%;
		padding-left: var(--size-3);
	}

	@media (--screen-md) {
		.toast-body {
			left: auto;
			right: var(--size-4);
		}
	}
</style>
