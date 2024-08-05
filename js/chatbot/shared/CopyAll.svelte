<script lang="ts">
	import { onDestroy } from "svelte";
	import { Copy, Check } from "@gradio/icons";
	import type { NormalisedMessage } from "../types";

	let copied = false;
	export let value: NormalisedMessage[] | null;

	let timer: NodeJS.Timeout;

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	const copy_conversation = (): void => {
		if (value) {
			const conversation_text = value
				.map((message) => `${message.role}: ${message.content}`)
				.join("\n\n");
			navigator.clipboard.writeText(conversation_text).catch((err) => {
				console.error("Failed to copy conversation: ", err);
			});
		}
	};

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			copy_conversation();
			copy_feedback();
		}
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

<button
	on:click={handle_copy}
	class="action"
	title="copy"
	aria-label={copied ? "Copied conversation" : "Copy conversation"}
>
	{#if !copied}
		<Copy />
	{/if}
	{#if copied}
		<Check />
	{/if}
</button>

<style>
	button {
		position: relative;
		top: 0;
		right: 0;
		cursor: pointer;
		color: var(--body-text-color-subdued);
	}

	button:hover {
		color: var(--body-text-color);
	}

	.action {
		position: absolute;
		right: var(--size-2);
		top: var(--size-2);
		width: var(--size-4);
		height: var(--size-4);
	}
</style>
