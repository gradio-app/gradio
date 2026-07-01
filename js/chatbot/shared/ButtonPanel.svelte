<script lang="ts">
	import LikeDislike from "./LikeDislike.svelte";
	import Copy from "./Copy.svelte";
	import type { FileData } from "@gradio/client";
	import type { NormalisedMessage } from "../types";
	import { Retry, Undo, Edit, Check, Clear, Download } from "@gradio/icons";
	import {
		IconButtonWrapper,
		IconButton,
		DownloadLink,
		ShareButton
	} from "@gradio/atoms";
	import { all_text, is_all_text } from "./utils";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import { uploadToHuggingFace } from "@gradio/utils";
	import type { CopyData } from "@gradio/utils";

	let {
		i18n,
		likeable,
		feedback_options,
		show_retry,
		show_undo,
		show_edit,
		in_edit_mode,
		show_copy_button,
		watermark = null,
		message,
		position,
		avatar,
		generating,
		current_feedback,
		file = null,
		show_download_button = false,
		show_share_button = false,
		handle_action,
		layout,
		oncopy,
		onerror,
		onshare
	}: {
		i18n: I18nFormatter;
		likeable: boolean;
		feedback_options: string[];
		show_retry: boolean;
		show_undo: boolean;
		show_edit: boolean;
		in_edit_mode: boolean;
		show_copy_button: boolean;
		watermark?: string | null;
		message: NormalisedMessage | NormalisedMessage[];
		position: "right" | "left";
		avatar: FileData | null;
		generating: boolean;
		current_feedback: string | null;
		file?: FileData | null;
		show_download_button?: boolean;
		show_share_button?: boolean;
		handle_action: (selected: string | null) => void;
		layout: "bubble" | "panel";
		oncopy?: (data: CopyData) => void;
		onerror?: (message: string) => void;
		onshare?: (data: any) => void;
	} = $props();

	let message_text = $derived(is_all_text(message) ? all_text(message) : "");
	let show_copy = $derived(show_copy_button && message && is_all_text(message));
</script>

{#if show_copy || show_retry || show_undo || show_edit || likeable || (show_download_button && file?.url) || (show_share_button && file)}
	<div
		class="message-buttons-{position} {layout} message-buttons {avatar !==
			null && 'with-avatar'}"
	>
		<IconButtonWrapper top_panel={false}>
			{#if in_edit_mode}
				<IconButton
					label={i18n("chatbot.submit")}
					Icon={Check}
					onclick={() => handle_action("edit_submit")}
					disabled={generating}
				/>
				<IconButton
					label={i18n("chatbot.cancel")}
					Icon={Clear}
					onclick={() => handle_action("edit_cancel")}
					disabled={generating}
				/>
			{:else}
				{#if show_copy}
					<Copy value={message_text} {oncopy} {watermark} {i18n} />
				{/if}
				{#if show_download_button && file?.url}
					<DownloadLink
						href={file.is_stream
							? file.url?.replace("playlist.m3u8", "playlist-file")
							: file.url}
						download={file.orig_name || file.path || "file"}
					>
						<IconButton Icon={Download} label={i18n("common.download")} />
					</DownloadLink>
				{/if}
				{#if show_share_button && file}
					<ShareButton
						{i18n}
						onerror={(detail) => onerror?.(detail)}
						onshare={(detail) => onshare?.(detail)}
						formatter={async (value) => {
							if (!value) return "";
							let url = await uploadToHuggingFace(value.url, "url");
							const mime_type = value.mime_type || "";
							if (mime_type.startsWith("audio/")) {
								return `<audio controls src="${url}"></audio>`;
							} else if (mime_type.startsWith("video/")) {
								return `<video controls src="${url}"></video>`;
							} else if (mime_type.startsWith("image/")) {
								return `<img src="${url}" />`;
							}
							return "";
						}}
						value={file}
					/>
				{/if}
				{#if show_retry}
					<IconButton
						Icon={Retry}
						label={i18n("chatbot.retry")}
						onclick={() => handle_action("retry")}
						disabled={generating}
					/>
				{/if}
				{#if show_undo}
					<IconButton
						label={i18n("chatbot.undo")}
						Icon={Undo}
						onclick={() => handle_action("undo")}
						disabled={generating}
					/>
				{/if}
				{#if show_edit}
					<IconButton
						label={i18n("chatbot.edit")}
						Icon={Edit}
						onclick={() => handle_action("edit")}
						disabled={generating}
					/>
				{/if}
				{#if likeable}
					<LikeDislike
						{handle_action}
						{feedback_options}
						selected={current_feedback}
						{i18n}
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
