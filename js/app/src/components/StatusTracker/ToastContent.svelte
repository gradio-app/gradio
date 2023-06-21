<script lang="ts">
	import { Alert, Information, Warning } from "@gradio/icons";
	import { createEventDispatcher, onMount } from "svelte";
	import { fade } from "svelte/transition";
	import type { ThemeMode } from "../types";

	export let message: string = "";
	export let description: string = "";
	export let type: string = "";
	export let theme_color: string = "";
	export let theme_mode: ThemeMode;
	export let id: number;

	const dispatch = createEventDispatcher();

	function close_message() {
		dispatch("close", id);
	}

	let lightStyles = {
		"toast-bg-color": `var(--color-${theme_color}-50)`,
		"toast-text-color": `var(--color-${theme_color}-700)`,
		"toast-border-color": `var(--color-${theme_color}-700)`,
		"toast-icon-color": `var(--color-${theme_color}-700)`
	};

	let darkStyles = {
		"toast-bg-color": `var(--color-grey-950)`,
		"toast-text-color": `var(--color-${theme_color}-50)`,
		"toast-border-color": `var(--color-${theme_color}-500)`,
		"toast-icon-color": `var(--color-${theme_color}-500)`
	};

	$: cssVarStyles = Object.entries(
		theme_mode === "light" ? lightStyles : darkStyles
	)
		.map(([key, value]) => `--${key}:${value}`)
		.join(";");

	onMount(() => {
		setTimeout(() => {
			close_message();
		}, 10000);
	});
</script>

<div
	style={cssVarStyles}
	class="toast-body"
	role="alert"
	on:click|stopPropagation
	on:keydown|stopPropagation
	in:fade={{ duration: 200, delay: 100 }}
	out:fade={{ duration: 200 }}
>
	<div class="toast-icon">
		{#if type === "warning"}
			<Warning />
		{:else if type === "info"}
			<Information />
		{:else if type === "error"}
			<Alert />
		{/if}
	</div>

	<div class="toast-details">
		<div class="toast-title">{description}</div>
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
		top: var(--size-8);
		right: 0;
		left: 0;
		align-items: center;
		margin: var(--size-6) var(--size-4);
		margin: auto;
		border-radius: var(--container-radius);
		max-width: 1200px;
		max-width: 610px;
		overflow: hidden;
		pointer-events: auto;
		background: var(--toast-bg-color);
		border: 1px solid var(--toast-border-color);
	}

	.toast-title {
		display: flex;
		align-items: center;
		color: var(--toast-text-color);
		font-weight: var(--weight-bold);
		font-size: var(--text-md);
		line-height: var(--line-xs);
	}

	.toast-close {
		margin: 0 var(--size-3);
		border-radius: var(--size-3);
		padding: 0px var(--size-1-5);
		color: var(--toast-icon-color);
		font-size: var(--size-5);
		line-height: var(--size-5);
	}

	.toast-text {
		color: var(--toast-text-color);
		font-size: var(--text-sm);
	}

	.toast-details {
		margin: var(--size-3) var(--size-3) var(--size-3) 0;
		width: 100%;
	}

	.toast-icon {
		position: absolute;
		display: flex;
		position: relative;
		flex-shrink: 0;
		justify-content: center;
		align-items: center;
		margin: var(--size-2);
		border-radius: var(--radius-full);
		padding: var(--size-1);
		padding-left: calc(var(--size-1) - 1px);
		color: var(--toast-icon-color);
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
		background: var(--toast-icon-color);
		width: 100%;
		height: var(--size-1);
	}
</style>
