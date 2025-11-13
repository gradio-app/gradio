<script lang="ts">
	import { is_component_message } from "../shared/utils";
	import { Image } from "@gradio/image/shared";
	import type { FileData, Client } from "@gradio/client";
	import type { NormalisedMessage } from "../types";

	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { ComponentType, SvelteComponent } from "svelte";
	import ButtonPanel from "./ButtonPanel.svelte";
	import MessageContent from "./MessageContent.svelte";
	import Thought from "./Thought.svelte";

	export let value: NormalisedMessage[];
	export let avatar_img: FileData | null;
	export let opposite_avatar_img: FileData | null = null;
	export let role = "user";
	export let messages: NormalisedMessage[] = [];
	export let layout: "bubble" | "panel";
	export let render_markdown: boolean;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let sanitize_html: boolean;
	export let selectable: boolean;
	export let _fetch: typeof fetch;
	export let rtl: boolean;
	export let dispatch: any;
	export let i18n: I18nFormatter;
	export let line_breaks: boolean;
	export let upload: Client["upload"];
	export let target: HTMLElement | null;
	export let theme_mode: "light" | "dark" | "system";
	export let _components: Record<string, ComponentType<SvelteComponent>>;
	export let i: number;
	export let show_copy_button: boolean;
	export let generating: boolean;
	export let feedback_options: string[];
	export let show_like: boolean;
	export let show_edit: boolean;
	export let show_retry: boolean;
	export let show_undo: boolean;
	export let handle_action: (selected: string | null) => void;
	export let scroll: () => void;
	export let allow_file_downloads: boolean;
	export let in_edit_mode: boolean;
	export let edit_messages: string[];
	export let display_consecutive_in_same_bubble: boolean;
	export let current_feedback: string | null = null;
	export let allow_tags: string[] | boolean = false;
	export let watermark: string | null = null;
	let messageElements: HTMLDivElement[] = [];
	let previous_edit_mode = false;
	let message_widths: number[] = Array(messages.length).fill(160);
	let message_heights: number[] = Array(messages.length).fill(0);

	$: if (in_edit_mode && !previous_edit_mode) {
		const offset = messageElements.length - messages.length;
		for (let idx = offset; idx < messageElements.length; idx++) {
			if (idx >= 0) {
				message_widths[idx - offset] = messageElements[idx]?.clientWidth;
				message_heights[idx - offset] = messageElements[idx]?.clientHeight;
			}
		}
	}

	function handle_select(i: number, message: NormalisedMessage): void {
		dispatch("select", {
			index: message.index,
			value: message.content
		});
	}

	function get_message_label_data(message: NormalisedMessage): string {
		if (message.type === "text") {
			return message.content;
		} else if (
			message.type === "component" &&
			message.content.component === "file"
		) {
			if (Array.isArray(message.content.value)) {
				return `file of extension type: ${message.content.value[0].orig_name?.split(".").pop()}`;
			}
			return (
				`file of extension type: ${message.content.value?.orig_name?.split(".").pop()}` +
				(message.content.value?.orig_name ?? "")
			);
		}
		return `a component of type ${message.content.component ?? "unknown"}`;
	}

	function get_file(messages: NormalisedMessage[]): FileData | null {
		for (const message of messages) {
			if (
				message.type === "component" &&
				(message.content.component === "audio" ||
					message.content.component === "video" ||
					message.content.component === "image" ||
					message.content.component === "file") &&
				message.content.value
			) {
				return message.content.value as FileData;
			}
		}
		return null;
	}

	type ButtonPanelProps = {
		handle_action: (selected: string | null) => void;
		likeable: boolean;
		feedback_options: string[];
		show_retry: boolean;
		show_undo: boolean;
		show_edit: boolean;
		in_edit_mode: boolean;
		generating: boolean;
		show_copy_button: boolean;
		message: NormalisedMessage[] | NormalisedMessage;
		position: "left" | "right";
		layout: "bubble" | "panel";
		avatar: FileData | null;
		dispatch: any;
		current_feedback: string | null;
		watermark: string | null;
		file: FileData | null;
		show_download_button: boolean;
		show_share_button: boolean;
	};

	let button_panel_props: ButtonPanelProps;
	$: button_panel_props = {
		handle_action,
		likeable: show_like,
		feedback_options,
		show_retry,
		show_undo,
		show_edit,
		in_edit_mode,
		generating,
		show_copy_button,
		message: messages,
		position: role === "user" ? "right" : "left",
		avatar: avatar_img,
		layout,
		dispatch,
		current_feedback,
		watermark,
		file: get_file(messages),
		show_download_button: allow_file_downloads,
		show_share_button: true
	};
</script>

<div
	class="message-row {layout} {role}-row"
	class:with_avatar={avatar_img !== null}
	class:with_opposite_avatar={opposite_avatar_img !== null}
>
	{#if avatar_img !== null}
		<div class="avatar-container">
			<Image class="avatar-image" src={avatar_img?.url} alt="{role} avatar" />
		</div>
	{/if}
	<div
		class:role
		class="flex-wrap"
		class:component-wrap={messages[0].type === "component"}
	>
		<div
			class:message={display_consecutive_in_same_bubble}
			class={display_consecutive_in_same_bubble ? role : ""}
		>
			{#each messages as message, thought_index}
				<div
					class="message {!display_consecutive_in_same_bubble ? role : ''}"
					class:panel-full-width={true}
					class:message-markdown-disabled={!render_markdown}
					class:component={message.type === "component"}
					class:html={is_component_message(message) &&
						message.content.component === "html"}
					class:thought={thought_index > 0}
				>
					{#if in_edit_mode && message.type === "text"}
						<!-- svelte-ignore a11y-autofocus -->
						<textarea
							class="edit-textarea"
							style:width={`max(${message_widths[thought_index]}px, 160px)`}
							style:min-height={`${message_heights[thought_index]}px`}
							autofocus
							bind:value={edit_messages[thought_index]}
						/>
					{:else}
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div
							data-testid={role}
							class:latest={i === value.length - 1}
							class:message-markdown-disabled={!render_markdown}
							style:user-select="text"
							class:selectable
							style:cursor={selectable ? "pointer" : "auto"}
							style:text-align={rtl ? "right" : "left"}
							bind:this={messageElements[thought_index]}
							on:click={() => handle_select(i, message)}
							on:keydown={(e) => {
								if (e.key === "Enter") {
									handle_select(i, message);
								}
							}}
							dir={rtl ? "rtl" : "ltr"}
							aria-label={role +
								"'s message: " +
								get_message_label_data(message)}
						>
							{#if message?.metadata?.title}
								<Thought
									thought={message}
									{rtl}
									{sanitize_html}
									{allow_tags}
									{latex_delimiters}
									{render_markdown}
									{_components}
									{upload}
									{thought_index}
									{target}
									{theme_mode}
									{_fetch}
									{scroll}
									{allow_file_downloads}
									{display_consecutive_in_same_bubble}
									{i18n}
									{line_breaks}
								/>
							{:else}
								<MessageContent
									{message}
									{sanitize_html}
									{allow_tags}
									{latex_delimiters}
									{render_markdown}
									{_components}
									{upload}
									{thought_index}
									{target}
									{theme_mode}
									{_fetch}
									{scroll}
									{allow_file_downloads}
									{display_consecutive_in_same_bubble}
									{i18n}
									{line_breaks}
								/>
							{/if}
						</div>
					{/if}
				</div>

				{#if layout === "panel"}
					<ButtonPanel
						{...button_panel_props}
						{current_feedback}
						{watermark}
						on:copy={(e) => dispatch("copy", e.detail)}
						{i18n}
					/>
				{/if}
			{/each}
		</div>
	</div>
</div>

{#if layout === "bubble"}
	<ButtonPanel {...button_panel_props} {i18n} />
{/if}

<style>
	.message {
		position: relative;
		width: 100%;
	}

	.message.display_consecutive_in_same_bubble {
		margin-top: 0;
	}

	.message + .message {
		margin-top: var(--spacing-sm);
	}

	/* avatar styles */
	.avatar-container {
		flex-shrink: 0;
		border-radius: 50%;
		border: 1px solid var(--border-color-primary);
		overflow: hidden;
	}

	.avatar-container :global(img) {
		object-fit: cover;
	}

	/* message wrapper */
	.flex-wrap {
		display: flex;
		flex-direction: column;
		width: calc(100% - var(--spacing-xxl));
		max-width: 100%;
		color: var(--body-text-color);
		font-size: var(--chatbot-text-size);
		overflow-wrap: break-word;
		width: 100%;
		height: 100%;
	}

	.component {
		padding: 0;
		border-radius: var(--radius-md);
		width: fit-content;
		overflow: hidden;
	}

	.component.gallery {
		border: none;
	}

	.bot:has(.model3D),
	.user:has(.model3D) {
		border: none;
		max-width: 75%;
	}

	.message-row :not(.avatar-container) :global(img) {
		margin: var(--size-2);
		max-height: 300px;
	}

	.file-pil {
		display: block;
		width: fit-content;
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--radius-md);
		background: var(--background-fill-secondary);
		color: var(--body-text-color);
		text-decoration: none;
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-sm);
	}

	.file {
		width: auto !important;
		max-width: fit-content !important;
	}

	@media (max-width: 600px) or (max-width: 480px) {
		.component {
			width: 100%;
		}
	}

	.message :global(.prose) {
		font-size: var(--chatbot-text-size);
	}

	.message-bubble-border {
		border-width: 1px;
		border-radius: var(--radius-md);
	}

	.panel-full-width {
		width: 100%;
	}
	.message-markdown-disabled {
		white-space: pre-line;
	}

	.user {
		border-radius: var(--radius-md);
		align-self: flex-end;
		border-bottom-right-radius: 0;
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--border-color-accent-subdued);
		background-color: var(--color-accent-soft);
		padding: var(--spacing-sm) var(--spacing-xl);
	}

	.bot {
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-md);
		border-color: var(--border-color-primary);
		background-color: var(--background-fill-secondary);
		box-shadow: var(--shadow-drop);
		align-self: flex-start;
		text-align: right;
		border-bottom-left-radius: 0;
		padding: var(--spacing-sm) var(--spacing-xl);
	}

	.bot:has(.table-wrap) {
		border: none;
		box-shadow: none;
		background: none;
	}

	.panel .user :global(*) {
		text-align: right;
	}

	/* Colors */

	.message-row {
		display: flex;
		position: relative;
	}

	/* bubble mode styles */
	.bubble {
		margin: calc(var(--spacing-xl) * 2);
		margin-bottom: var(--spacing-xl);
	}

	.bubble.user-row {
		align-self: flex-end;
		max-width: calc(100% - var(--spacing-xl) * 6);
	}

	.bubble.bot-row {
		align-self: flex-start;
		max-width: calc(100% - var(--spacing-xl) * 6);
	}

	.bubble .user-row {
		flex-direction: row;
		justify-content: flex-end;
	}

	.bubble .with_avatar.user-row {
		margin-right: calc(var(--spacing-xl) * 2) !important;
	}

	.bubble .with_avatar.bot-row {
		margin-left: calc(var(--spacing-xl) * 2) !important;
	}

	.bubble .with_opposite_avatar.user-row {
		margin-left: calc(var(--spacing-xxl) + 35px + var(--spacing-xxl));
	}

	/* panel mode styles */
	.panel {
		margin: 0;
		padding: calc(var(--spacing-lg) * 2) calc(var(--spacing-lg) * 2);
	}

	.panel.bot-row {
		background: var(--background-fill-secondary);
	}

	.panel .with_avatar {
		padding-left: calc(var(--spacing-xl) * 2) !important;
		padding-right: calc(var(--spacing-xl) * 2) !important;
	}

	.panel .panel-full-width {
		width: 100%;
	}

	.panel .user :global(*) {
		text-align: right;
	}

	/* message content */
	.flex-wrap {
		display: flex;
		flex-direction: column;
		max-width: 100%;
		color: var(--body-text-color);
		font-size: var(--chatbot-text-size);
		overflow-wrap: break-word;
	}

	@media (max-width: 480px) {
		.user-row.bubble {
			align-self: flex-end;
		}

		.bot-row.bubble {
			align-self: flex-start;
		}
		.message {
			width: 100%;
		}
	}

	.avatar-container {
		align-self: flex-start;
		position: relative;
		display: flex;
		justify-content: flex-start;
		align-items: flex-start;
		width: 35px;
		height: 35px;
		flex-shrink: 0;
		bottom: 0;
		border-radius: 50%;
		border: 1px solid var(--border-color-primary);
	}
	.user-row > .avatar-container {
		order: 2;
	}

	.user-row.bubble > .avatar-container {
		margin-left: var(--spacing-xxl);
	}

	.bot-row.bubble > .avatar-container {
		margin-left: var(--spacing-xxl);
	}

	.panel.user-row > .avatar-container {
		order: 0;
	}

	.bot-row.bubble > .avatar-container {
		margin-right: var(--spacing-xxl);
		margin-left: 0;
	}

	.avatar-container:not(.thumbnail-item) :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
		padding: var(--size-1-5);
	}

	.selectable {
		cursor: pointer;
	}

	@keyframes dot-flashing {
		0% {
			opacity: 0.8;
		}
		50% {
			opacity: 0.5;
		}
		100% {
			opacity: 0.8;
		}
	}

	/* Image preview */
	.message :global(.preview) {
		object-fit: contain;
		width: 95%;
		max-height: 93%;
	}
	.image-preview {
		position: absolute;
		z-index: 999;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		overflow: auto;
		background-color: rgba(0, 0, 0, 0.9);
		display: flex;
		justify-content: center;
		align-items: center;
	}
	.image-preview :global(svg) {
		stroke: white;
	}
	.image-preview-close-button {
		position: absolute;
		top: 10px;
		right: 10px;
		background: none;
		border: none;
		font-size: 1.5em;
		cursor: pointer;
		height: 30px;
		width: 30px;
		padding: 3px;
		background: var(--bg-color);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--button-secondary-border-color);
		border-radius: var(--radius-lg);
	}

	.message > div {
		width: 100%;
	}
	.html {
		padding: 0;
		border: none;
		background: none;
	}

	.panel .bot,
	.panel .user {
		border: none;
		box-shadow: none;
		background-color: var(--background-fill-secondary);
	}

	textarea {
		background: none;
		border-radius: var(--radius-lg);
		border: none;
		display: block;
		max-width: 100%;
	}
	.user textarea {
		border-bottom-right-radius: 0;
	}
	.bot textarea {
		border-bottom-left-radius: 0;
	}
	.user textarea:focus {
		outline: 2px solid var(--border-color-accent);
	}
	.bot textarea:focus {
		outline: 2px solid var(--border-color-primary);
	}

	.panel.user-row {
		background-color: var(--color-accent-soft);
	}

	.panel .user-row,
	.panel .bot-row {
		align-self: flex-start;
	}

	.panel .user :global(*),
	.panel .bot :global(*) {
		text-align: left;
	}

	.panel .user {
		background-color: var(--color-accent-soft);
	}

	.panel .user-row {
		background-color: var(--color-accent-soft);
		align-self: flex-start;
	}

	.panel .message {
		margin-bottom: var(--spacing-md);
	}
</style>
