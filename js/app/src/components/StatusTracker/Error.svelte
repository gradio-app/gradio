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
	role="alert"
	on:click|stopPropagation
	on:keydown|stopPropagation
	in:fade={{ duration: 200, delay: 100 }}
	out:fade={{ duration: 200 }}
>
	<svg
		aria-hidden="true"
		xmlns="http://www.w3.org/2000/svg"
		width="35"
		height="35"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		class="toast-icon"
		><circle cx="12" cy="12" r="10" /><line
			x1="12"
			x2="12"
			y2="13"
			y1="7"
		/><line x1="13" y1="16" x2="11.01" y2="16" /></svg
	>

	<div class="toast-details">
		<div class="toast-title">Something went wrong</div>
		<div class="toast-text">
			{message}
		</div>
	</div>

	<button
		on:click={close_message}
		class="toast-close"
		type="button"
		aria-label="Close"
	>
		<span aria-hidden="true">×</span>
	</button>

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
		border: 1px solid var(--error-border-color);
		border-radius: var(--container-radius);
		background: var(--error-background-fill);
		max-width: 1200px;
		max-width: 610px;
		overflow: hidden;
		pointer-events: auto;
	}
	.toast-title {
		display: flex;
		align-items: center;
		color: var(--error-text-color);
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
		line-height: var(--line-sm);
	}
	.toast-icon {
		display: flex;
		position: relative;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		margin: var(--size-2);
		border-radius: var(--radius-full);
		padding: var(--size-1);
		padding-left: calc(var(--size-1) - 1px);
		color: var(--error-icon-color);
	}

	.toast-close {
		margin: 0 var(--size-3);
		border-radius: var(--size-3);
		padding: 0px var(--size-1-5);
		color: var(--error-icon-color);
		font-size: var(--size-5);
		line-height: var(--size-5);
	}

	.toast-text {
		color: var(--error-text-color);
		font-size: var(--text-lg);
	}

	.toast-details {
		margin: var(--size-3) var(--size-3) var(--size-3) 0;
		width: 100%;
	}
	svg {
		position: absolute;
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
		background: var(--error-icon-color);
		width: 100%;
		height: var(--size-1);
	}
</style>
