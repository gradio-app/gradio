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
	aria-label={copied ? "Value copied" : "Copy value"}
>
	{#if !copied}
		<Copy />
	{:else}
		<span class="check">
			<Check />
		</span>
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
		top: 0;
		right: 0;
		z-index: var(--layer-top);
		background: var(--block-label-background-fill);
		width: 100%;
		height: 100%;
	}
</style>
