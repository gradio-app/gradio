<script context="module" lang="ts">
	import { tick } from "svelte";
	import { pretty_si } from "./utils";

	let items: HTMLDivElement[] = [];

	let called = false;

	const is_browser = typeof window !== "undefined";
	const raf = is_browser
		? window.requestAnimationFrame
		: (cb: (...args: any[]) => void) => {};

	async function scroll_into_view(
		el: HTMLDivElement,
		enable: boolean | null = true
	): Promise<void> {
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

		raf(() => {
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

	import Loader from "./Loader.svelte";
	import type { LoadingStatus } from "./types";
	import type { I18nFormatter } from "@gradio/utils";
	import { createEventDispatcher } from "svelte";

	import { IconButton } from "@gradio/atoms";
	import { Clear } from "@gradio/icons";

	const dispatch = createEventDispatcher();

	export let i18n: I18nFormatter;
	export let eta: number | null = null;
	export let queue_position: number | null;
	export let queue_size: number | null;
	export let status:
		| "complete"
		| "pending"
		| "error"
		| "generating"
		| "streaming"
		| null;
	export let scroll_to_output = false;
	export let timer = true;
	export let show_progress: "full" | "minimal" | "hidden" = "full";
	export let message: string | null = null;
	export let progress: LoadingStatus["progress"] | null | undefined = null;
	export let variant: "default" | "center" = "default";
	export let loading_text = "Loading...";
	export let absolute = true;
	export let translucent = false;
	export let border = false;
	export let autoscroll: boolean;

	let el: HTMLDivElement;

	let _timer = false;
	let timer_start = 0;
	let timer_diff = 0;
	let old_eta: number | null = null;
	let eta_from_start: number | null = null;
	let message_visible = false;
	let eta_level: number | null = 0;
	let progress_level: (number | undefined)[] | null = null;
	let last_progress_level: number | undefined = undefined;
	let progress_bar: HTMLElement | null = null;
	let show_eta_bar = true;

	$: eta_level =
		eta_from_start === null || eta_from_start <= 0 || !timer_diff
			? null
			: Math.min(timer_diff / eta_from_start, 1);
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
				}
				return undefined;
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

	const start_timer = (): void => {
		eta = old_eta = formatted_eta = null;
		timer_start = performance.now();
		timer_diff = 0;
		_timer = true;
		run();
	};

	function run(): void {
		raf(() => {
			timer_diff = (performance.now() - timer_start) / 1000;
			if (_timer) run();
		});
	}

	function stop_timer(): void {
		timer_diff = 0;
		eta = old_eta = formatted_eta = null;

		if (!_timer) return;
		_timer = false;
	}

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
		scroll_into_view(el, autoscroll);

	let formatted_eta: string | null = null;
	$: {
		if (eta === null) {
			eta = old_eta;
		}
		if (eta != null && old_eta !== eta) {
			eta_from_start = (performance.now() - timer_start) / 1000 + eta;
			formatted_eta = eta_from_start.toFixed(1);
			old_eta = eta;
		}
	}
	let show_message_timeout: NodeJS.Timeout | null = null;
	function close_message(): void {
		message_visible = false;
		if (show_message_timeout !== null) {
			clearTimeout(show_message_timeout);
		}
	}
	$: {
		close_message();
		if (status === "error" && message) {
			message_visible = true;
		}
	}
	$: formatted_timer = timer_diff.toFixed(1);
</script>

<div
	class="wrap {variant} {show_progress}"
	class:hide={!status ||
		status === "complete" ||
		show_progress === "hidden" ||
		status == "streaming"}
	class:translucent={(variant === "center" &&
		(status === "pending" || status === "error")) ||
		translucent ||
		show_progress === "minimal"}
	class:generating={status === "generating" && show_progress === "full"}
	class:border
	style:position={absolute ? "absolute" : "static"}
	style:padding={absolute ? "0" : "var(--size-8) 0"}
	bind:this={el}
>
	{#if status === "pending"}
		{#if variant === "default" && show_eta_bar && show_progress === "full"}
			<div
				class="eta-bar"
				style:transform="translateX({(eta_level || 0) * 100 - 100}%)"
			/>
		{/if}
		<div
			class:meta-text-center={variant === "center"}
			class:meta-text={variant === "default"}
			class="progress-text"
		>
			{#if progress}
				{#each progress as p}
					{#if p.index != null}
						{#if p.length != null}
							{pretty_si(p.index || 0)}/{pretty_si(p.length)}
						{:else}
							{pretty_si(p.index || 0)}
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
		{:else if show_progress === "full"}
			<Loader margin={variant === "default"} />
		{/if}

		{#if !timer}
			<p class="loading">{loading_text}</p>
			<slot name="additional-loading-text" />
		{/if}
	{:else if status === "error"}
		<div class="clear-status">
			<IconButton
				Icon={Clear}
				label={i18n("common.clear")}
				disabled={false}
				on:click={() => {
					dispatch("clear_status");
				}}
			/>
		</div>
		<span class="error">{i18n("common.error")}</span>
		<slot name="error" />
	{/if}
</div>

<style>
	.wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		z-index: var(--layer-2);
		transition: opacity 0.1s ease-in-out;
		border-radius: var(--block-radius);
		background: var(--block-background-fill);
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
		animation:
			pulseStart 1s cubic-bezier(0.4, 0, 0.6, 1),
			pulse 2s cubic-bezier(0.4, 0, 0.6, 1) 1s infinite;
		border: 2px solid var(--color-accent);
		background: transparent;
		z-index: var(--layer-1);
		pointer-events: none;
	}

	.translucent {
		background: none;
	}

	@keyframes pulseStart {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
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
		background: var(--background-fill-secondary);
	}
	.progress-bar-wrap {
		border: 1px solid var(--border-color-primary);
		background: var(--background-fill-primary);
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
		bottom: 0;
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
		border: solid 1px var(--error-border-color);
		border-radius: var(--radius-full);
		background: var(--error-background-fill);
		padding-right: var(--size-4);
		padding-left: var(--size-4);
		color: var(--error-text-color);
		font-weight: var(--weight-semibold);
		font-size: var(--text-lg);
		line-height: var(--line-lg);
		font-family: var(--font);
	}

	.minimal {
		pointer-events: none;
	}

	.minimal .progress-text {
		background: var(--block-background-fill);
	}

	.border {
		border: 1px solid var(--border-color-primary);
	}

	.clear-status {
		position: absolute;
		display: flex;
		top: var(--size-2);
		right: var(--size-2);
		justify-content: flex-end;
		gap: var(--spacing-sm);
		z-index: var(--layer-1);
	}
</style>
