<script lang="ts">
	import LikeDislike from "./LikeDislike.svelte";
	import Copy from "./Copy.svelte";
	import type { FileData } from "@gradio/client";
	import DownloadIcon from "./Download.svelte";
	import { DownloadLink } from "@gradio/wasm/svelte";
	import type { NormalisedMessage, TextMessage } from "../types";
	import { is_component_message } from "./utils";
	import ActionButton from "./ActionButton.svelte";
	import { Retry } from "@gradio/icons";
	import Remove from "./Remove.svelte";

	export let likeable: boolean;
	export let _retryable: boolean;
	export let _undoable: boolean;
	export let show_copy_button: boolean;
	export let show: boolean;
	export let message: NormalisedMessage | NormalisedMessage[];
	export let position: "right" | "left";
	export let avatar: FileData | null;
	export let disable: boolean;

	export let handle_action: (selected: string | null) => void;
	export let layout: "bubble" | "panel";

	function is_all_text(
		message: NormalisedMessage[] | NormalisedMessage
	): message is TextMessage[] | TextMessage {
		return (
			(Array.isArray(message) &&
				message.every((m) => typeof m.content === "string")) ||
			(!Array.isArray(message) && typeof message.content === "string")
		);
	}

	function all_text(message: TextMessage[] | TextMessage): string {
		if (Array.isArray(message)) {
			return message.map((m) => m.content).join("\n");
		}
		return message.content;
	}

	$: message_text = is_all_text(message) ? all_text(message) : "";

	$: show_copy = show_copy_button && message && is_all_text(message);
	$: show_download =
		!Array.isArray(message) &&
		is_component_message(message) &&
		message.content.value?.url;
</script>

{#if show}
	<div
		class="message-buttons-{position} {layout}  message-buttons {avatar !==
			null && 'with-avatar'}"
	>
		{#if show_copy}
			<Copy value={message_text} />
		{/if}
		{#if show_download && !Array.isArray(message) && is_component_message(message)}
			<DownloadLink
				href={message?.content?.value.url}
				download={message.content.value.orig_name || "image"}
			>
				<span class="icon-wrap">
					<DownloadIcon />
				</span>
			</DownloadLink>
		{/if}
		{#if _retryable}
			<ActionButton
				{handle_action}
				action="retry"
				disabled={disable}
				height={"var(--size-3)"}
			>
				<Retry />
			</ActionButton>
		{/if}
		{#if _undoable}
			<ActionButton
				{handle_action}
				action="undo"
				disabled={disable}
				height="var(--size-3)"
			>
				<Remove />
			</ActionButton>
		{/if}
		{#if likeable}
			<LikeDislike {handle_action} padded={show_copy || show_download} />
		{/if}
	</div>
{/if}

<style>
	.icon-wrap {
		display: block;
		color: var(--body-text-color-subdued);
	}

	.icon-wrap:hover {
		color: var(--body-text-color);
	}

	.message-buttons {
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		height: var(--size-6);
		align-self: self-end;
		margin: 0px calc(var(--spacing-xl) * 2);
		padding-left: 5px;
		z-index: 1;
		padding-bottom: var(--spacing-xl);
		padding: var(--spacing-md) var(--spacing-md);
		border: 1px solid var(--border-color-primary);
		background: var(--border-color-secondary);
		gap: var(--spacing-md);
	}
	.message-buttons-left {
		align-self: start;
		left: 0px;
	}

	.panel.message-buttons-left,
	.panel.message-buttons-right {
		margin: 10px 0 2px 0;
	}

	/* .message-buttons {
		left: 0px;
		right: 0px;
		top: unset;
		bottom: calc(-30px - var(--spacing-xl));
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 0px;
	} */

	.message-buttons :global(> *) {
		margin-right: 0px;
	}

	.with-avatar {
		margin-left: calc(var(--spacing-xl) * 4 + 31px);
	}
</style>
