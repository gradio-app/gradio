<script context="module" lang="ts">
	import { tick } from "svelte";
	import { fade } from "svelte/transition";
	import { prettySI } from "../utils/helpers";

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
	import type { LoadingStatus } from "./types";

	export let eta: number | null = null;
	export let queue: boolean = false;
	export let queue_position: number | null;
	export let queue_size: number | null;
	export let status: "complete" | "pending" | "error" | "generating";
	export let scroll_to_output: boolean = false;
	export let timer: boolean = true;
	export let visible: boolean = true;
	export let message: string | null = null;
	export let progress: LoadingStatus["progress"] | null | undefined = null;
	export let variant: "default" | "center" = "default";
	export let loading_text: string = "Loading...";
	export let absolute: boolean = true;

	let el: HTMLDivElement;

	let _timer: boolean = false;
	let timer_start = 0;
	let timer_diff = 0;
	let old_eta: number | null = null;
	let message_visible: boolean = false;
	let eta_level: number | null = 0;
	let progress_level: Array<number | undefined> | null = null;
	let last_progress_level: number | undefined = undefined;
	let progress_bar: HTMLElement | null = null;
	let show_eta_bar: boolean = true;

	$: eta_level =
		eta === null || eta <= 0 || !timer_diff
			? null
			: Math.min(timer_diff / eta, 1);
	$: if (progress != null) {
		show_eta_bar = false;
	}

	$: {
		if (progress != null) {
			progress_level = progress.map((p) => {
				if (p.index != null && p.length != null) {
					return p.index / p.length;
				} else if (p.progress != null) {
					return p.progress;
				} else {
					return undefined;
				}
			});
		} else {
			progress_level = null;
		}

		if (progress_level) {
			last_progress_level = progress_level[progress_level.length - 1];
			if (progress_bar) {
				if (last_progress_level === 0) {
					progress_bar.style.transition = "0";
				} else {
					progress_bar.style.transition = "150ms";
				}
			}
		} else {
			last_progress_level = undefined;
		}
	}

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
	style:position={absolute ? "absolute" : "static"}
	style:padding={absolute ? "0" : "var(--size-8) 0"}
	bind:this={el}
>
	{#if status === "pending"}
		{#if variant === "default" && show_eta_bar}
			<div
				class="eta-bar"
				style:transform="translateX({(eta_level || 0) * 100 - 100}%)"
			/>
		{/if}
		<div
			class:meta-text-center={variant === "center"}
			class:meta-text={variant === "default"}
		>
			{#if progress}
				{#each progress as p}
					{#if p.index != null}
						{#if p.length != null}
							{prettySI(p.index || 0)}/{prettySI(p.length)}
						{:else}
							{prettySI(p.index || 0)}
						{/if}
						{p.unit} | {" "}
					{/if}
				{/each}
			{:else if queue_position !== null && queue_size !== undefined && queue_position >= 0}
				queue: {queue_position + 1}/{queue_size} |
			{:else if queue_position === 0}
				processing |
			{/if}

			{#if timer}
				{formatted_timer}{eta ? `/${formatted_eta}` : ""}s
			{/if}
		</div>

		{#if last_progress_level != null}
			<div class="progress-level">
				<div class="progress-level-inner">
					{#if progress != null}
						{#each progress as p, i}
							{#if p.desc != null || (progress_level && progress_level[i] != null)}
								{#if i !== 0}
									&nbsp;/
								{/if}
								{#if p.desc != null}
									{p.desc}
								{/if}
								{#if p.desc != null && progress_level && progress_level[i] != null}
									-
								{/if}
								{#if progress_level != null}
									{(100 * (progress_level[i] || 0)).toFixed(1)}%
								{/if}
							{/if}
						{/each}
					{/if}
				</div>

				<div class="progress-bar-wrap">
					<div
						bind:this={progress_bar}
						class="progress-bar"
						style:width="{last_progress_level * 100}%"
					/>
				</div>
			</div>
		{:else}
			<Loader margin={variant === "default"} />
		{/if}

		{#if !timer}
			<p class="loading">{loading_text}</p>
		{/if}
	{:else if status === "error"}
		<span class="error">Error</span>
		<slot name="error" />
		{#if message_visible}
			<div class="toast">
				<div
					class="toast-body"
					on:click|stopPropagation
					in:fade={{ duration: 100 }}
				>
					<button on:click={close_message} class="toast-close">
						<svg
							width="100%"
							height="100%"
							viewBox="0 0 24 24"
							fill="currentColor"
							stroke="currentColor"
							stroke-width="3"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>

					<div class="toast-details">
						<div class="toast-title">Something went wrong</div>
						<div class="toast-text">
							{message || ""}
						</div>
					</div>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: var(--layer-5);
		background-color: var(--color-background-primary);
		padding: 0 var(--size-6);
		max-height: var(--size-screen-h);
		overflow: hidden;
	}

	.wrap.center {
		top: 0;
		right: 0px;
		left: 0px;
	}

	.wrap.default {
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
	}

	.hide {
		opacity: 0;
		pointer-events: none;
	}

	.generating {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
		border: 2px solid var(--color-accent);
		background: transparent;
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

	.loading {
		z-index: var(--layer-2);
		color: var(--body-text-color);
	}
	.eta-bar {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		transform-origin: left;
		opacity: 0.8;
		z-index: var(--layer-1);
		transition: 10ms;
		background: var(--color-background-secondary);
	}
	.progress-bar-wrap {
		border: 1px solid var(--color-border-primary);
		background: var(--color-background-primary);
		width: 55.5%;
		height: var(--size-4);
	}
	.progress-bar {
		transform-origin: left;
		background-color: var(--loader-color);
		width: var(--size-full);
		height: var(--size-full);
	}

	.progress-level {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1;
		z-index: var(--layer-2);
		width: var(--size-full);
	}

	.progress-level-inner {
		margin: var(--size-2) auto;
		color: var(--body-text-color);
		font-size: var(--text-sm);
		font-family: var(--font-mono);
	}

	.meta-text {
		position: absolute;
		top: 0;
		right: 0;
		z-index: var(--layer-2);
		padding: var(--size-1) var(--size-2);
		font-size: var(--text-sm);
		font-family: var(--font-mono);
	}

	.meta-text-center {
		display: flex;
		position: absolute;
		top: 0;
		right: 0;
		justify-content: center;
		align-items: center;
		transform: translateY(var(--size-6));
		z-index: var(--layer-2);
		padding: var(--size-1) var(--size-2);
		font-size: var(--text-sm);
		font-family: var(--font-mono);
		text-align: center;
	}

	.error {
		box-shadow: var(--shadow-drop);
		border-radius: var(--radius-full);
		background-color: var(--color-background-primary);
		background: rgba(255, 0, 0, 0.2);
		padding-right: var(--size-4);
		padding-left: var(--size-4);
		color: var(--functional-error-color);
		font-weight: var(--weight-semibold);
		font-size: var(--text-xl);
		line-height: var(--line-lg);
		font-family: var(--font-sans);
	}

	.toast {
		position: fixed;
		top: 0;
		right: var(--size-4);
		left: var(--size-4);
		z-index: var(--layer-top);
		padding: var(--size-4);
	}

	.toast-body {
		display: flex;
		position: absolute;
		top: var(--size-8);
		right: 0;
		left: 0;
		align-items: center;
		margin: var(--size-6) var(--size-4);
		margin: auto;
		box-shadow: var(--shadow-drop-lg);
		border: 1px solid var(--functional-error-border-color);
		border-radius: var(--container-radius);
		background: var(--functional-error-background-color);
		padding: var(--size-4) var(--size-6);
		max-width: 1200px;
		max-width: 610px;
		overflow: hidden;
		pointer-events: auto;
	}

	.toast-title {
		display: flex;
		align-items: center;
		padding: var(--size-1) var(--size-3);
		color: var(--functional-error-color);
		color: var(--color-red-500);
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
		line-height: var(--line-xs);
	}

	.toast-close {
		display: flex;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		border-radius: var(--radius-full);
		background: var(--color-red-600);
		padding: var(--size-2);
		padding-left: calc(var(--size-2) - 1px);
		width: var(--size-10);
		height: var(--size-10);
		color: white;
	}

	.toast-text {
		padding: var(--size-1) var(--size-3);
		font-family: var(--font-mono);
	}

	.toast-details {
		padding-left: var(--size-3);
		width: 100%;
	}

	@media (--screen-md) {
		.toast-body {
			right: var(--size-4);
			left: auto;
		}
	}
</style>
