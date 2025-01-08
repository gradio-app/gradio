<script lang="ts">
	import LikeDislike from "./LikeDislike.svelte";
	import Copy from "./Copy.svelte";
	import type { FileData } from "@gradio/client";
	import type { NormalisedMessage, TextMessage, ThoughtNode } from "../types";
	import { Retry, Undo, Edit, Check, Clear } from "@gradio/icons";
	import { IconButtonWrapper, IconButton } from "@gradio/atoms";
	import { all_text, is_all_text } from "./utils";

	export let likeable: boolean;
	export let feedback_options: string[];
	export let show_retry: boolean;
	export let show_undo: boolean;
	export let show_edit: boolean;
	export let in_edit_mode: boolean;
	export let show_copy_button: boolean;
	export let message: NormalisedMessage | NormalisedMessage[];
	export let position: "right" | "left";
	export let avatar: FileData | null;
	export let generating: boolean;
	export let current_feedback: string | null;

	export let handle_action: (selected: string | null) => void;
	export let layout: "bubble" | "panel";
	export let dispatch: any;

	$: message_text = is_all_text(message) ? all_text(message) : "";
	$: show_copy = show_copy_button && message && is_all_text(message);
</script>

{#if show_copy || show_retry || show_undo || show_edit || likeable}
	<div
		class="message-buttons-{position} {layout} message-buttons {avatar !==
			null && 'with-avatar'}"
	>
		<IconButtonWrapper top_panel={false}>
			{#if in_edit_mode}
				<IconButton
					label="Submit"
					Icon={Check}
					on:click={() => handle_action("edit_submit")}
					disabled={generating}
				/>
				<IconButton
					label="Cancel"
					Icon={Clear}
					on:click={() => handle_action("edit_cancel")}
					disabled={generating}
				/>
			{:else}
				{#if show_copy}
					<Copy
						value={message_text}
						on:copy={(e) => dispatch("copy", e.detail)}
					/>
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
				{#if show_edit}
					<IconButton
						label="Edit"
						Icon={Edit}
						on:click={() => handle_action("edit")}
						disabled={generating}
					/>
				{/if}
				{#if likeable}
					<LikeDislike
						{handle_action}
						{feedback_options}
						selected={current_feedback}
					/>
				{/if}
			{/if}
		</IconButtonWrapper>
	</div>
{/if}

<style>
	.bubble :global(.icon-button-wrapper) {
		margin: 0px calc(var(--spacing-xl) * 2);
	}

	.message-buttons {
		z-index: var(--layer-1);
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
		z-index: var(--layer-1);
	}
</style>
