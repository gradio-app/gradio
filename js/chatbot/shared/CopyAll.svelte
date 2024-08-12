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
		position: absolute;
		top: var(--block-label-margin);
		right: var(--block-label-margin);
		align-items: center;
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
		border-top: none;
		border-right: none;
		border-radius: var(--block-label-right-radius);
		background: var(--block-label-background-fill);
		padding: var(--spacing-sm);
		width: var(--size-6);
		height: var(--size-6);
		overflow: hidden;
		color: var(--block-label-text-color);
	}

	button:hover {
		color: var(--body-text-color);
	}
</style>
