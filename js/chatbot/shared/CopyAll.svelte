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
			const conversation_value = value
				.map((message) => {
					if (message.type === "text") {
						return `${message.role}: ${message.content}`;
					}
					return `${message.role}: ${message.content.value.url}`;
				})
				.join("\n\n");

			navigator.clipboard.writeText(conversation_value).catch((err) => {
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
	title="Copy conversation"
	class={copied ? "copied" : "copy-text"}
	aria-label={copied ? "Copied conversation" : "Copy conversation"}
>
	{#if copied}
		<Check />
	{:else}
		<Copy />
	{/if}
</button>

<style>
	button {
		display: flex;
		align-items: center;
		width: var(--size-4);
		height: var(--size-4);
		color: var(--body-text-color-subdued);
	}

	button:hover {
		color: var(--body-text-color);
	}
</style>
