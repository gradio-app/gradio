<script lang="ts">
	import { onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { Copy, Check } from "@gradio/icons";

	let copied = false;
	export let value: string;
	let timer: NodeJS.Timeout;

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			copy_feedback();
		}
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<button
	on:click={handle_copy}
	title="copy"
	class:copied
	aria-roledescription="Copy value"
	aria-label="Copy"
>
	<Copy />
	{#if copied}
		<span
			class="check"
			transition:fade
			aria-roledescription="Value copied"
			aria-label="Copied"><Check /></span
		>
	{/if}
</button>

<style>
	button {
		position: relative;
		cursor: pointer;
		padding: 5px;
		width: 22px;
		height: 22px;
	}

	.check {
		position: absolute;
		top: 0;
		right: 0;
		z-index: var(--layer-top);
		background: var(--background-fill-primary);
		padding: var(--size-1);
		width: 100%;
		height: 100%;
		color: var(--body-text-color);
	}
</style>
