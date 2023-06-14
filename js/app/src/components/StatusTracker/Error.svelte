<script lang="ts">
	import { createEventDispatcher, onMount } from "svelte";
	import { fade } from "svelte/transition";
	export let message: string = "";
	export let id: number;

	const dispatch = createEventDispatcher();

	function close_message() {
		dispatch("close", id);
	}

	onMount(() => {
		setTimeout(() => {
			close_message();
		}, 10000);
	});
</script>

<div
	class="toast-body"
	on:click|stopPropagation
	on:keydown|stopPropagation
	in:fade={{ duration: 200, delay: 100 }}
	out:fade={{ duration: 200 }}
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
			class="close-svg"
		>
			<line x1="18" y1="6" x2="6" y2="18" />
			<line x1="6" y1="6" x2="18" y2="18" />
		</svg>
	</button>

	<div class="toast-details">
		<div class="toast-title">Something went wrong</div>
		<div class="toast-text">
			{message}
		</div>
	</div>

	<div class="timer" />
</div>

<style>
	.toast-body {
		display: flex;
		position: relative;
		right: 0;
		left: 0;
		align-items: center;
		margin: var(--size-6) var(--size-4);
		margin: auto;
		margin-left: 0;
		box-shadow: var(--shadow-drop-lg);
		border: 1px solid var(--error-border-color);
		border-radius: var(--container-radius);
		background: var(--error-background-fill);
		padding: var(--size-4) var(--size-6);
		width: 100%;
		max-width: 1200px;
		max-width: 610px;
		overflow: hidden;
		pointer-events: auto;
	}

	.toast-title {
		display: flex;
		align-items: center;
		padding: var(--size-1) var(--size-3);
		color: var(--error-text-color);
		color: var(--color-red-500);
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
		line-height: var(--line-xs);
	}

	.toast-close {
		display: flex;
		position: relative;
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
		color: var(--body-text-color);
		font-family: var(--font-mono);
	}

	.toast-details {
		padding-left: var(--size-3);
		width: 100%;
	}
	svg {
		position: absolute;
	}

	.close-svg {
		top: var(--size-2);
		right: var(--size-2);
		bottom: var(--size-2);
		left: var(--size-2);
		width: var(--size-6);
		height: var(--size-6);
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
		background: var(--color-red-600);
		width: 100%;
		height: var(--size-1);
	}
</style>
