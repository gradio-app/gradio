<script lang="ts">
	import LikeDislike from "./LikeDislike.svelte";
	import Copy from "./Copy.svelte";
	import type { FileData } from "@gradio/client";

	export let likeable: boolean;
	export let show_copy_button: boolean;
	export let show: boolean;
	export let message: Record<string, any> | string;
	export let position: "right" | "left";
	export let layout: string;
	export let bubble_full_width: boolean;
	export let avatar: FileData | null;
	export let handle_action: (selected: string | null) => void;
</script>

{#if show}
	<div
		class="message-buttons-{position} message-buttons-{layout} {avatar !==
			null && 'with-avatar'}"
		class:message-buttons-fit={layout === "bubble" && !bubble_full_width}
		class:bubble-buttons-right={layout === "bubble"}
	>
		{#if likeable && position === "left"}
			<LikeDislike {handle_action} />
		{/if}
		{#if show_copy_button && message && typeof message === "string"}
			<Copy value={message} />
		{/if}
	</div>
{/if}

<style>
	.message-buttons-right,
	.message-buttons-left {
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		bottom: 0;
		height: var(--size-7);
		align-self: self-end;
		position: absolute;
		bottom: -15px;
		margin: 2px;
		padding-left: 5px;
		z-index: 1;
	}
	.message-buttons-left {
		left: 10px;
	}
	.message-buttons-right {
		right: 5px;
	}

	.message-buttons-left.message-buttons-bubble.with-avatar {
		left: 50px;
	}
	.message-buttons-right.message-buttons-bubble.with-avatar {
		right: 50px;
	}

	.message-buttons-bubble {
		border: 1px solid var(--border-color-accent);
		background: var(--background-fill-secondary);
	}

	.message-buttons-panel {
		left: unset;
		right: 0px;
		top: 0px;
	}
</style>
