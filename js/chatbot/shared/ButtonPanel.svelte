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

	export let i18n: I18nFormatter;
	export let likeable: boolean;
	export let feedback_options: string[];
	export let show_retry: boolean;
	export let show_undo: boolean;
	export let show_edit: boolean;
	export let in_edit_mode: boolean;
	export let show_copy_button: boolean;
	export let watermark: string | null = null;
	export let message: NormalisedMessage | NormalisedMessage[];
	export let position: "right" | "left";
	export let avatar: FileData | null;
	export let generating: boolean;
	export let current_feedback: string | null;
	export let file: FileData | null = null;
	export let show_download_button = false;
	export let show_share_button = false;

	export let handle_action: (selected: string | null) => void;
	export let layout: "bubble" | "panel";
	export let dispatch: any;

	$: message_text = is_all_text(message) ? all_text(message) : "";
	$: show_copy = show_copy_button && message && is_all_text(message);
</script>

{#if show_copy || show_retry || show_undo || show_edit || likeable || show_download_button || show_share_button}
	<div
		class="message-buttons-{position} {layout} message-buttons {avatar !==
			null && 'with-avatar'}"
	>
		<IconButtonWrapper top_panel={false}>
			{#if in_edit_mode}
				<IconButton
					label={i18n("chatbot.submit")}
					Icon={Check}
					on:click={() => handle_action("edit_submit")}
					disabled={generating}
				/>
				<IconButton
					label={i18n("chatbot.cancel")}
					Icon={Clear}
					on:click={() => handle_action("edit_cancel")}
					disabled={generating}
				/>
			{:else}
				{#if show_copy}
					<Copy
						value={message_text}
						on:copy={(e) => dispatch("copy", e.detail)}
						{watermark}
						{i18n}
					/>
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
						on:error={(e) => dispatch("error", e.detail)}
						on:share={(e) => dispatch("share", e.detail)}
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
						on:click={() => handle_action("retry")}
						disabled={generating}
					/>
				{/if}
				{#if show_undo}
					<IconButton
						label={i18n("chatbot.undo")}
						Icon={Undo}
						on:click={() => handle_action("undo")}
						disabled={generating}
					/>
				{/if}
				{#if show_edit}
					<IconButton
						label={i18n("chatbot.edit")}
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
