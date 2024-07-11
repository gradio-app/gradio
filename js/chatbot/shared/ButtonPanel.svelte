<script lang="ts">
	import LikeDislike from "./LikeDislike.svelte";
	import Copy from "./Copy.svelte";
	import type { FileData } from "@gradio/client";
	import DownloadIcon from "./Download.svelte";
	import { DownloadLink } from "@gradio/wasm/svelte";

	export let likeable: boolean;
	export let show_copy_button: boolean;
	export let show: boolean;
	export let message: Record<string, any>;
	export let position: "right" | "left";
	export let avatar: FileData | null;

	export let handle_action: (selected: string | null) => void;
	export let layout: "bubble" | "panel";
	$: show_copy = show_copy_button && message && message?.type === "text";
	$: show_download =
		show_copy_button && (message?.value?.video?.url || message?.value?.url);
</script>

{#if show}
	<div
		class="message-buttons-{position} {layout}  message-buttons {avatar !==
			null && 'with-avatar'}"
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
		padding: var(--spacing-md) 2px;
	}
	.message-buttons-left {
		align-self: start;
		left: 0px;
	}
	.message-buttons-right {
		right: 5px;
	}

	.panel.message-buttons-left,
	.panel.message-buttons-right {
		margin: 10px 0 2px 0;
	}

	.message-buttons {
		left: 0px;
		right: 0px;
		top: unset;
		bottom: calc(-30px - var(--spacing-xl));
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 0px;
	}

	.message-buttons :global(> *) {
		margin-right: 7px;
	}
</style>
