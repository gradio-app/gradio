<script lang="ts">
	import { onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { Copy, Check } from "@gradio/icons";

	let copied = false;
	export let value: string;
	let timer: NodeJS.Timeout;

	function copy_feedback() {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 2000);
	}

	async function handle_copy() {
		// Navigator clipboard api needs a secure context (https)
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			copy_feedback();
		} else {
			// Use the 'out of viewport hidden text area' trick
			const textArea = document.createElement("textarea");
			textArea.value = value;

			// Move textarea out of the viewport so it's not visible
			textArea.style.position = "absolute";
			textArea.style.left = "-999999px";

			document.body.prepend(textArea);
			textArea.select();

			try {
				document.execCommand("copy");
				copy_feedback();
			} catch (error) {
				console.error(error);
			} finally {
				textArea.remove();
			}
		}
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<button on:click={handle_copy} title="copy">
	<!-- {#if !copied} -->
	<span class="copy-text" class:copied><Copy /> </span>
	<!-- {/if} -->
	{#if copied}
		<span class="check" transition:fade><Check /></span>
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
