<script lang="ts">
	import { Error, Info, Warning, Success } from "@gradio/icons";
	import DOMPurify from "dompurify";
	import { createEventDispatcher, onMount } from "svelte";
	import { fade } from "svelte/transition";
	import type { ToastMessage } from "./types";

	export let title = "";
	export let message = "";
	export let type: ToastMessage["type"];
	export let id: number;
	export let duration: number | null = 10;
	export let visible = true;

	const is_external_url = (link: string | null): boolean => {
		try {
			return !!link && new URL(link, location.href).origin !== location.origin;
		} catch (e) {
			return false;
		}
	};

	DOMPurify.addHook("afterSanitizeAttributes", function (node) {
		if ("target" in node) {
			if (is_external_url(node.getAttribute("href"))) {
				node.setAttribute("target", "_blank");
				node.setAttribute("rel", "noopener noreferrer");
			}
		}
	});
	$: message = DOMPurify.sanitize(message);
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
</script>

<!-- TODO: fix-->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions-->
<div
	class="toast-body {type}"
	role="alert"
	data-testid="toast-body"
	class:hidden={!display}
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
		background: var (--color-grey-50);
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

	.toast-close.success {
		color: var(--color-green-700);
	}
	:global(.dark) .toast-close.success {
		color: var(--color-green-500);
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

	.toast-text.success {
		color: var(--color-green-700);
	}
	:global(.dark) .toast-text.success {
		color: var(--color-green-50);
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
