<script lang="ts">
	import LikeDislike from "./LikeDislike.svelte";
	import Copy from "./Copy.svelte";
	import type { FileData } from "@gradio/client";
	import DownloadIcon from "./Download.svelte";
	import { DownloadLink } from "@gradio/wasm/svelte";
	import type { NormalisedMessage, TextMessage } from "../types";
	import { is_component_message } from "./utils";
	import { Retry, Undo } from "@gradio/icons";
	import { IconButtonWrapper, IconButton } from "@gradio/atoms";

	export let likeable: boolean;
	export let show_retry: boolean;
	export let show_undo: boolean;
	export let show_copy_button: boolean;
	export let show: boolean;
	export let message: NormalisedMessage | NormalisedMessage[];
	export let position: "right" | "left";
	export let avatar: FileData | null;
	export let generating: boolean;

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
		class="message-buttons-{position} {layout} message-buttons {avatar !==
			null && 'with-avatar'}"
	>
		<IconButtonWrapper top_panel={false}>
			{#if show_copy}
				<Copy value={message_text} />
			{/if}
			{#if show_download && !Array.isArray(message) && is_component_message(message)}
				<DownloadLink
					href={message?.content?.value.url}
					download={message.content.value.orig_name || "image"}
				>
					<IconButton Icon={DownloadIcon} />
				</DownloadLink>
			{/if}
			{#if show_retry}
				<IconButton
					Icon={Retry}
					label="Retry"
					on:click={() => handle_action("retry")}
					disabled={generating}
				/>
			{/if}
			{#if show_undo}
				<IconButton
					label="Undo"
					Icon={Undo}
					on:click={() => handle_action("undo")}
					disabled={generating}
				/>
			{/if}
			{#if likeable}
				<LikeDislike {handle_action} />
			{/if}
		</IconButtonWrapper>
	</div>
{/if}

<style>
	.bubble :global(.icon-button-wrapper) {
		margin: 0px calc(var(--spacing-xl) * 2);
	}

	.message-buttons-left {
		align-self: flex-start;
	}

	.bubble.message-buttons-right {
		align-self: flex-end;
	}

	.message-buttons-right :global(.icon-button-wrapper) {
		margin-left: auto;
	}

	.bubble.with-avatar {
		margin-left: calc(var(--spacing-xl) * 5);
		margin-right: calc(var(--spacing-xl) * 5);
	}

	.panel {
		display: flex;
		align-self: flex-start;
		padding: 0 var(--spacing-xl);
		z-index: var(--layer-1);
	}
</style>
