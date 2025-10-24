<script lang="ts">
	import { Error, Info, Warning, Success } from "@gradio/icons";
	import { sanitize } from "@gradio/sanitize";
	import { createEventDispatcher, onMount } from "svelte";
	import { fade } from "svelte/transition";
	import type { ToastMessage } from "./types";

	export let title = "";
	export let message = "";
	export let type: ToastMessage["type"];
	export let id: number;
	export let duration: number | null = 10;
	export let visible: boolean | "hidden" = true;

	$: message = sanitize(message);
	$: display = visible;
	$: duration = duration || null;

	const dispatch = createEventDispatcher();

	function close_message(): void {
		dispatch("close", id);
	}

	onMount(() => {
		if (duration !== null) {
			setTimeout(() => {
				close_message();
			}, duration * 1000);
		}
	});

	$: timer_animation_duration = `${duration || 0}s`;

	let touch_start_x = 0;
	let touch_start_y = 0;
	let offset_x = 0;
	let is_dragging = false;
	let toast_element: HTMLElement;

	function handle_touch_start(e: TouchEvent): void {
		touch_start_x = e.touches[0].clientX;
		touch_start_y = e.touches[0].clientY;
		is_dragging = true;
	}

	function handle_touch_move(e: TouchEvent): void {
		if (!is_dragging) return;

		const touch_x = e.touches[0].clientX;
		const touch_y = e.touches[0].clientY;
		const delta_x = touch_x - touch_start_x;
		const delta_y = touch_y - touch_start_y;

		if (Math.abs(delta_x) > Math.abs(delta_y) && Math.abs(delta_x) > 10) {
			e.preventDefault();
			offset_x = delta_x;
		}
	}

	function handle_touch_end(): void {
		if (!is_dragging) return;

		if (Math.abs(offset_x) > 100) {
			close_message();
		} else {
			offset_x = 0;
		}

		is_dragging = false;
	}
</script>

<div
	bind:this={toast_element}
	class="toast-body {type}"
	role="status"
	aria-live="polite"
	data-testid="toast-body"
	class:hidden={!display}
	on:touchstart={handle_touch_start}
	on:touchmove={handle_touch_move}
	on:touchend={handle_touch_end}
	in:fade={{ duration: 200, delay: 100 }}
	out:fade={{ duration: 200 }}
	style="transform: translateX({offset_x}px); opacity: {1 -
		Math.abs(offset_x) / 300};"
>
	<div class="toast-icon {type}">
		{#if type === "warning"}
			<Warning />
		{:else if type === "info"}
			<Info />
		{:else if type === "success"}
			<Success />
		{:else if type === "error"}
			<Error />
		{/if}
	</div>

	<div class="toast-details {type}">
		<div class="toast-title {type}">{title}</div>
		<div class="toast-text {type}">
			{@html message}
		</div>
	</div>

	<button
		on:click={close_message}
		class="toast-close {type}"
		type="button"
		aria-label="Close"
		data-testid="toast-close"
	>
		<span aria-hidden="true">&#215;</span>
	</button>

	<div
		class="timer {type}"
		style={`animation-duration: ${timer_animation_duration};`}
	/>
</div>

<style>
	.toast-body {
		display: flex;
		position: relative;
		right: 0;
		left: 0;
		align-items: flex-start;
		margin: auto;
		border-radius: var(--radius-xl);
		overflow: hidden;
		pointer-events: auto;
		backdrop-filter: blur(10px);
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.08),
			0 1px 3px rgba(0, 0, 0, 0.06);
		padding: var(--size-1-5) var(--size-2) var(--size-2-5) var(--size-2);
		transition:
			transform 0.2s ease-out,
			opacity 0.2s ease-out;
		touch-action: pan-y;
		user-select: none;
	}

	.toast-body.error {
		border: 1px solid var(--color-red-700);
		background: var(--color-red-50);
	}

	:global(.dark) .toast-body.error {
		border: 1px solid var(--color-red-500);
		background-color: var(--color-grey-950);
	}

	.toast-body.warning {
		border: 1px solid var(--color-yellow-700);
		background: var(--color-yellow-50);
	}
	:global(.dark) .toast-body.warning {
		border: 1px solid var(--color-yellow-500);
		background-color: var(--color-grey-950);
	}

	.toast-body.info {
		border: 1px solid var(--color-grey-700);
		background: var(--color-grey-50);
	}
	:global(.dark) .toast-body.info {
		border: 1px solid var(--color-grey-500);
		background-color: var(--color-grey-950);
	}

	.toast-body.success {
		border: 1px solid var(--color-green-700);
		background: var(--color-green-50);
	}
	:global(.dark) .toast-body.success {
		border: 1px solid var(--color-green-500);
		background-color: var(--color-grey-950);
	}

	.toast-title {
		display: flex;
		align-items: center;
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
		line-height: var(--line-sm);
		margin-bottom: var(--size-1);
	}

	.toast-title.error {
		color: var(--color-red-700);
	}
	:global(.dark) .toast-title.error {
		color: var(--color-red-50);
	}

	.toast-title.warning {
		color: var(--color-yellow-700);
	}
	:global(.dark) .toast-title.warning {
		color: var(--color-yellow-50);
	}

	.toast-title.info {
		color: var(--color-grey-700);
	}
	:global(.dark) .toast-title.info {
		color: var(--color-grey-50);
	}

	.toast-title.success {
		color: var(--color-green-700);
	}
	:global(.dark) .toast-title.success {
		color: var(--color-green-50);
	}

	.toast-close {
		margin: 0 var(--size-1);
		border-radius: var(--radius-lg);
		padding: var(--size-1);
		font-size: var(--text-xl);
		line-height: 1;
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-7);
		height: var(--size-7);
		opacity: 0.6;
	}

	.toast-close:hover {
		opacity: 1;
		transform: scale(1.1);
	}

	.toast-close:active {
		transform: scale(0.95);
	}

	.toast-close.error {
		color: var(--color-red-700);
	}
	:global(.dark) .toast-close.error {
		color: var(--color-red-500);
	}

	.toast-close.warning {
		color: var(--color-yellow-700);
	}
	:global(.dark) .toast-close.warning {
		color: var(--color-yellow-500);
	}

	.toast-close.info {
		color: var(--color-grey-700);
	}
	:global(.dark) .toast-close.info {
		color: var(--color-grey-500);
	}

	.toast-close.success {
		color: var(--color-green-700);
	}
	:global(.dark) .toast-close.success {
		color: var(--color-green-500);
	}

	.toast-text {
		font-size: var(--text-lg);
		line-height: 1.5;
		word-wrap: break-word;
		overflow-wrap: break-word;
		word-break: break-word;
	}

	.toast-text.error {
		color: var(--color-red-700);
	}
	:global(.dark) .toast-text.error {
		color: var(--color-red-50);
	}

	.toast-text.warning {
		color: var(--color-yellow-700);
	}

	:global(.dark) .toast-text.warning {
		color: var(--color-yellow-50);
	}

	.toast-text.info {
		color: var(--color-grey-700);
	}

	:global(.dark) .toast-text.info {
		color: var(--color-grey-50);
	}

	.toast-text.success {
		color: var(--color-green-700);
	}
	:global(.dark) .toast-text.success {
		color: var(--color-green-50);
	}

	.toast-details {
		margin: var(--size-2) var(--size-2) var(--size-2) 0;
		width: 100%;
	}

	.toast-icon {
		display: flex;
		position: relative;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		margin: var(--size-1);
		border-radius: var(--radius-full);
		padding: var(--size-1-5);
		width: var(--size-8);
		height: var(--size-8);
	}

	.toast-icon.error {
		color: var(--color-red-700);
	}

	:global(.dark) .toast-icon.error {
		color: var(--color-red-500);
	}

	.toast-icon.warning {
		color: var(--color-yellow-700);
	}

	:global(.dark) .toast-icon.warning {
		color: var(--color-yellow-500);
	}

	.toast-icon.info {
		color: var(--color-grey-700);
	}

	:global(.dark) .toast-icon.info {
		color: var(--color-grey-500);
	}

	.toast-icon.success {
		color: var(--color-green-700);
	}

	:global(.dark) .toast-icon.success {
		color: var(--color-green-500);
	}

	@keyframes countdown {
		from {
			transform: scaleX(1);
		}
		to {
			transform: scaleX(0);
		}
	}

	.timer {
		position: absolute;
		bottom: 0;
		left: 0;
		transform-origin: 0 0;
		animation: countdown 10s linear forwards;
		width: 100%;
		height: var(--size-1);
	}

	.timer.error {
		background: var(--color-red-700);
	}

	:global(.dark) .timer.error {
		background: var(--color-red-500);
	}

	.timer.warning {
		background: var(--color-yellow-700);
	}

	:global(.dark) .timer.warning {
		background: var(--color-yellow-500);
	}

	.timer.info {
		background: var(--color-grey-700);
	}

	:global(.dark) .timer.info {
		background: var(--color-grey-500);
	}

	.timer.success {
		background: var(--color-green-700);
	}

	:global(.dark) .timer.success {
		background: var(--color-green-500);
	}

	.hidden {
		display: none;
	}

	.toast-text :global(a) {
		text-decoration: underline;
	}
</style>
