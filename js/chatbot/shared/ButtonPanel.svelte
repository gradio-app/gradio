<script lang="ts">
	import LikeDislike from "./LikeDislike.svelte";
	import Copy from "./Copy.svelte";
	import type { FileData } from "@gradio/client";
	import { IconButton } from "@gradio/atoms";
	import DownloadIcon from "./DownloadIcon.svelte";
	import { DownloadLink } from "@gradio/wasm/svelte";
	// import DownloadIcon from "./DownloadIcon.svelte";

	export let likeable: boolean;
	export let show_copy_button: boolean;
	export let show: boolean;
	export let message: Record<string, any>;
	export let position: "right" | "left";
	export let layout: string;
	export let bubble_full_width: boolean;
	export let avatar: FileData | null;
	export let show_download = false;
	export let handle_action: (selected: string | null) => void;

	$: show_copy = show_copy_button && message && message?.type === "text";
	$: show_download =
		(show_download && message?.value?.video?.url) || message?.value?.url;
</script>

{#if show}
	<div
		class="message-buttons-{position} message-buttons-{layout} {avatar !==
			null && 'with-avatar'}"
		class:message-buttons-fit={layout === "bubble" && !bubble_full_width}
		class:bubble-buttons-right={layout === "bubble"}
	>
		{#if show_copy}
			<Copy value={message.value} />
		{/if}
		{#if show_download}
			<DownloadLink
				href={message?.value?.video?.url || message?.value?.url}
				download={message?.value?.video?.orig_name ||
					message.value.orig_name ||
					"image"}
			>
				<span class="icon-wrap">
					<DownloadIcon />
				</span>
			</DownloadLink>
		{/if}
		{#if likeable && position === "left"}
			<LikeDislike {handle_action} padded={show_copy || show_download} />
		{/if}
	</div>
{/if}

<style>
	.icon-wrap {
		width: 16px;
		height: 16px;
		display: block;
		color: var(--body-text-color-subdued);
	}

	.icon-wrap:hover {
		color: var(--body-text-color);
	}
	.message-buttons-right,
	.message-buttons-left {
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		bottom: 0;
		height: var(--size-7);
		align-self: self-end;
		/* position: absolute; */
		bottom: -15px;
		margin: 2px;
		padding-left: 5px;
		z-index: 1;
		padding-bottom: var(--spacing-xl);
		padding: var(--spacing-md) var(--spacing-xxl);
		/* margin-bottom: var(--size-14); */
	}
	.message-buttons-left {
		align-self: start;
		left: 0px;
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
		left: 0px;
		right: 0px;
		top: unset;
		bottom: calc(-30px - var(--spacing-xl));
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 5px;
	}
</style>
