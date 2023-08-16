<script lang="ts">
	import { Error, Info, Warning } from "@gradio/icons";
	import { createEventDispatcher, onMount } from "svelte";
	import { fade } from "svelte/transition";
	import type { ToastMessage } from "./types";

	export let message = "";
	export let type: ToastMessage["type"];
	export let id: number;

	const dispatch = createEventDispatcher();

	function close_message(): void {
		dispatch("close", id);
	}

	onMount(() => {
		setTimeout(() => {
			close_message();
		}, 10000);
	});
</script>

<!-- TODO: fix-->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions-->
<div
	class="toast-body {type}"
	role="alert"
	data-testid="toast-body"
	on:click|stopPropagation
	on:keydown|stopPropagation
	in:fade={{ duration: 200, delay: 100 }}
	out:fade={{ duration: 200 }}
>
	<div class="toast-icon {type}">
		{#if type === "warning"}
			<Warning />
		{:else if type === "info"}
			<Info />
		{:else if type === "error"}
			<Error />
		{/if}
	</div>

	<div class="toast-details {type}">
		<div class="toast-title {type}">{type}</div>
		<div class="toast-text {type}">
			{message}
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

	<div class="timer {type}" />
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
		border-radius: var(--container-radius);
		overflow: hidden;
		pointer-events: auto;
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

	.toast-title {
		display: flex;
		align-items: center;
		font-weight: var(--weight-bold);
		font-size: var(--text-lg);
		line-height: var(--line-sm);
		text-transform: capitalize;
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

	.toast-close {
		margin: 0 var(--size-3);
		border-radius: var(--size-3);
		padding: 0px var(--size-1-5);
		font-size: var(--size-5);
		line-height: var(--size-5);
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

	.toast-text {
		font-size: var(--text-lg);
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

	.toast-details {
		margin: var(--size-3) var(--size-3) var(--size-3) 0;
		width: 100%;
	}

	.toast-icon {
		display: flex;
		position: absolute;
		position: relative;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		margin: var(--size-2);
		border-radius: var(--radius-full);
		padding: var(--size-1);
		padding-left: calc(var(--size-1) - 1px);
		width: 35px;
		height: 35px;
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
</style>
