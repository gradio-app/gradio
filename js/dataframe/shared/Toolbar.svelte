<script lang="ts">
	import { Maximize, Minimize, Copy, Check } from "@gradio/icons";
	import { onDestroy } from "svelte";

	export let show_fullscreen_button = false;
	export let show_copy_button = false;
	export let is_fullscreen = false;
	export let on_copy: () => Promise<void>;

	let copied = false;
	let timer: ReturnType<typeof setTimeout>;

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	async function handle_copy(): Promise<void> {
		await on_copy();
		copy_feedback();
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<div class="toolbar" role="toolbar" aria-label="Table actions">
	{#if show_copy_button}
		<button
			class="toolbar-button"
			on:click={handle_copy}
			aria-label={copied ? "Copied to clipboard" : "Copy table data"}
			title={copied ? "Copied to clipboard" : "Copy table data"}
		>
			{#if copied}
				<Check />
			{:else}
				<Copy />
			{/if}
		</button>
	{/if}
	{#if show_fullscreen_button}
		<button
			class="toolbar-button"
			on:click
			aria-label={is_fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
			title={is_fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
		>
			{#if is_fullscreen}
				<Minimize />
			{:else}
				<Maximize />
			{/if}
		</button>
	{/if}
</div>

<style>
	.toolbar {
		display: flex;
		justify-content: flex-end;
		gap: var(--size-1);
	}

	.toolbar-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: var(--size-6);
		height: var(--size-6);
		padding: var(--size-1);
		border: none;
		border-radius: var(--radius-sm);
		background: transparent;
		color: var(--body-text-color-subdued);
		cursor: pointer;
		transition: all 0.2s;
	}

	.toolbar-button:hover {
		background: var(--background-fill-secondary);
		color: var(--body-text-color);
	}

	.toolbar-button :global(svg) {
		width: var(--size-4);
		height: var(--size-4);
	}
</style>
