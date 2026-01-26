<script lang="ts">
	import { Error, Info, Warning, Success, ChevronDown } from "@gradio/icons";
	import { sanitize } from "@gradio/sanitize";
	import { fade, slide } from "svelte/transition";
	import type { ToastMessage } from "./types";

	interface Props {
		type: ToastMessage["type"];
		messages?: ToastMessage[];
		expanded?: boolean;
		ontoggle?: () => void;
		onclose?: (id: number) => void;
	}

	let {
		type,
		messages = [],
		expanded = true,
		ontoggle,
		onclose
	}: Props = $props();

	let touch_start_x = $state(0);
	let touch_start_y = $state(0);
	let offset_x = $state(0);
	let is_dragging = $state(false);
	let toast_element: HTMLElement;

	let count = $derived(messages.length);
	let first_message = $derived(messages[0]);
	let type_label = $derived(type.charAt(0).toUpperCase() + type.slice(1));
	let has_duration = $derived(first_message?.duration !== null);
	let timer_duration = $derived(
		has_duration ? `${first_message.duration}s` : "0s"
	);

	function handle_toggle(): void {
		ontoggle?.();
	}

	function close_all(): void {
		messages.forEach((msg) => {
			onclose?.(msg.id);
		});
	}

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
			close_all();
		} else {
			offset_x = 0;
		}

		is_dragging = false;
	}

	$effect(() => {
		if (has_duration && messages.length === 1) {
			setTimeout(close_all, first_message.duration! * 1000);
		}
	});
</script>

<div
	bind:this={toast_element}
	class="toast-body {type}"
	role="status"
	aria-live="polite"
	data-testid="toast-body"
	ontouchstart={handle_touch_start}
	ontouchmove={handle_touch_move}
	ontouchend={handle_touch_end}
	in:fade={{ duration: 200, delay: 100 }}
	out:fade={{ duration: 200 }}
	style="transform: translateX({offset_x}px); opacity: {1 -
		Math.abs(offset_x) / 300};"
>
	<div
		class="toast-header"
		onclick={handle_toggle}
		role="button"
		tabindex="0"
		onkeydown={(e) => {
			if (e.key === "Enter" || e.key === " ") {
				handle_toggle();
			}
		}}
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

		<div class="toast-title-row">
			<span class="toast-title {type}">
				{type_label}
				{#if count > 1}
					<span class="toast-count">({count})</span>
				{/if}
			</span>
			<div class="chevron" class:expanded class:visible={count > 0}>
				<ChevronDown />
			</div>
		</div>

		<button
			onclick={(e) => {
				e.stopPropagation();
				close_all();
			}}
			class="toast-close {type}"
			type="button"
			aria-label="Close"
			data-testid="toast-close"
		>
			<span aria-hidden="true">&#215;</span>
		</button>
	</div>

	{#if expanded}
		<div class="toast-messages" transition:slide={{ duration: 200 }}>
			{#each messages as message, i (message.id)}
				<div class="toast-message-item {type}">
					<div class="toast-message-text {type}" data-testid="toast-text">
						{@html sanitize(message.message)}
					</div>
				</div>
				{#if i < messages.length - 1}
					<div class="toast-separator" />
				{/if}
			{/each}
		</div>
	{/if}

	{#if has_duration}
		<div class="timer {type}" style="animation-duration: {timer_duration}" />
	{/if}
</div>

<!-- s-csdrBJqpTpqa  -->
<style>
	.toast-body {
		display: flex;
		flex-direction: column;
		position: relative;
		right: 0;
		left: 0;
		margin: auto;
		border-radius: var(--radius-sm);
		overflow: hidden;
		pointer-events: auto;
		background: var(--background-fill-secondary);
		border: 1px solid var(--border-color-primary);
		box-shadow: var(--shadow-drop);
		touch-action: pan-y;
		user-select: none;
	}

	:global(.dark) .toast-body {
		background: var(--background-fill-primary);
	}

	.toast-body.error {
		--toast-color: var(--color-red-700);
	}

	.toast-body.warning {
		--toast-color: var(--color-yellow-700);
	}

	.toast-body.info {
		--toast-color: var(--color-grey-700);
	}

	.toast-body.success {
		--toast-color: var(--color-green-700);
	}

	:global(.dark) .toast-body.error {
		--toast-color: var(--color-red-500);
	}

	:global(.dark) .toast-body.warning {
		--toast-color: var(--color-yellow-500);
	}

	:global(.dark) .toast-body.info {
		--toast-color: var(--color-grey-500);
	}

	:global(.dark) .toast-body.success {
		--toast-color: var(--color-green-500);
	}

	.toast-header {
		display: flex;
		align-items: center;
		padding: var(--size-3) var(--size-3);
		cursor: pointer;
	}

	.toast-header:hover {
		opacity: 0.9;
	}

	.toast-title-row {
		flex: 1;
		display: flex;
		align-items: center;
		gap: var(--size-2);
	}

	.chevron {
		display: flex;
		align-items: center;
		width: var(--size-4);
		height: var(--size-4);
		transition: transform 0.2s ease;
		opacity: 0.6;
	}

	.chevron.visible {
		opacity: 1;
	}

	.chevron.expanded {
		transform: rotate(180deg);
	}

	.toast-title {
		display: flex;
		align-items: center;
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
		line-height: var(--line-sm);
	}

	.toast-count {
		margin-left: var(--size-1);
		font-weight: var(--weight-semibold);
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
		flex-shrink: 0;
	}

	.toast-close:hover {
		opacity: 1;
		transform: scale(1.1);
	}

	.toast-close:active {
		transform: scale(0.95);
	}

	.toast-close {
		color: var(--body-text-color);
	}

	.toast-icon {
		display: flex;
		position: relative;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		margin-right: var(--size-2);
		border-radius: var(--radius-full);
		padding: var(--size-1-5);
		width: var(--size-8);
		height: var(--size-8);
	}

	.toast-icon {
		color: var(--toast-color);
	}

	.toast-messages {
		display: flex;
		flex-direction: column;
		gap: var(--size-2);
		padding: 0 var(--size-3) var(--size-2) var(--size-3);
	}

	.toast-message-item {
		padding: var(--size-1-5) var(--size-1-5) var(--size-1-5) var(--size-1-5);
		border-radius: var(--radius-lg);
	}

	.toast-separator {
		height: 1px;
		background: var(--border-color-primary);
		margin: 0;
	}

	.toast-message-text {
		font-size: var(--text-md);
		line-height: 1.5;
		word-wrap: break-word;
		overflow-wrap: break-word;
		word-break: break-word;
		color: var(--body-text-color);
	}

	.toast-message-text :global(a) {
		text-decoration: underline;
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

	.timer {
		background: var(--toast-color);
	}

	@media (max-width: 640px) {
		.toast-header {
			padding: var(--size-2) var(--size-2);
		}

		.toast-messages {
			gap: var(--size-1);
			padding: 0 var(--size-2) var(--size-1-5) var(--size-2);
		}

		.toast-message-item {
			padding: 0 var(--size-1) var(--size-1) var(--size-1);
		}
	}
</style>
