<script lang="ts">
	import { is_component_message, is_last_bot_message } from "../shared/utils";
	import { Image } from "@gradio/image/shared";
	import Component from "./Component.svelte";
	import type { FileData, Client } from "@gradio/client";
	import type { NormalisedMessage } from "../types";
	import MessageBox from "./MessageBox.svelte";
	import { MarkdownCode as Markdown } from "@gradio/markdown-code";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { ComponentType, SvelteComponent } from "svelte";
	import ButtonPanel from "./ButtonPanel.svelte";

	export let value: NormalisedMessage[];
	export let avatar_img: FileData | null;
	export let opposite_avatar_img: FileData | null = null;
	export let role = "user";
	export let messages: NormalisedMessage[] = [];
	export let layout: "bubble" | "panel";
	export let bubble_full_width: boolean;
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
	export let root: string;
	export let theme_mode: "light" | "dark" | "system";
	export let _components: Record<string, ComponentType<SvelteComponent>>;
	export let i: number;
	export let show_copy_button: boolean;
	export let generating: boolean;
	export let show_like: boolean;
	export let show_retry: boolean;
	export let show_undo: boolean;
	export let msg_format: "tuples" | "messages";
	export let handle_action: (selected: string | null) => void;
	export let scroll: () => void;
	export let allow_file_downloads: boolean;

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

	type ButtonPanelProps = {
		handle_action: (selected: string | null) => void;
		likeable: boolean;
		show_retry: boolean;
		show_undo: boolean;
		generating: boolean;
		show_copy_button: boolean;
		message: NormalisedMessage[] | NormalisedMessage;
		position: "left" | "right";
		layout: "bubble" | "panel";
		avatar: FileData | null;
		dispatch: any;
	};

	let button_panel_props: ButtonPanelProps;
	$: button_panel_props = {
		handle_action,
		likeable: show_like,
		show_retry,
		show_undo,
		generating,
		show_copy_button,
		message: msg_format === "tuples" ? messages[0] : messages,
		position: role === "user" ? "right" : "left",
		avatar: avatar_img,
		layout,
		dispatch
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
		{#each messages as message, thought_index}
			<div
				class="message {role} {is_component_message(message)
					? message?.content.component
					: ''}"
				class:message-fit={layout === "bubble" && !bubble_full_width}
				class:panel-full-width={true}
				class:message-markdown-disabled={!render_markdown}
				class:component={message.type === "component"}
				class:html={is_component_message(message) &&
					message.content.component === "html"}
				class:thought={thought_index > 0}
			>
				<button
					data-testid={role}
					class:latest={i === value.length - 1}
					class:message-markdown-disabled={!render_markdown}
					style:user-select="text"
					class:selectable
					style:cursor={selectable ? "pointer" : "default"}
					style:text-align={rtl ? "right" : "left"}
					on:click={() => handle_select(i, message)}
					on:keydown={(e) => {
						if (e.key === "Enter") {
							handle_select(i, message);
						}
					}}
					dir={rtl ? "rtl" : "ltr"}
					aria-label={role + "'s message: " + get_message_label_data(message)}
				>
					{#if message.type === "text"}
						<div class="message-content">
							{#if message.metadata.title}
								<MessageBox
									title={message.metadata.title}
									expanded={is_last_bot_message([message], value)}
								>
									<Markdown
										message={message.content}
										{latex_delimiters}
										{sanitize_html}
										{render_markdown}
										{line_breaks}
										on:load={scroll}
										{root}
									/>
								</MessageBox>
							{:else}
								<Markdown
									message={message.content}
									{latex_delimiters}
									{sanitize_html}
									{render_markdown}
									{line_breaks}
									on:load={scroll}
									{root}
								/>
							{/if}
						</div>
					{:else if message.type === "component" && message.content.component in _components}
						<Component
							{target}
							{theme_mode}
							props={message.content.props}
							type={message.content.component}
							components={_components}
							value={message.content.value}
							{i18n}
							{upload}
							{_fetch}
							on:load={() => scroll()}
							{allow_file_downloads}
						/>
					{:else if message.type === "component" && message.content.component === "file"}
						<a
							data-testid="chatbot-file"
							class="file-pil"
							href={message.content.value.url}
							target="_blank"
							download={window.__is_colab__
								? null
								: message.content.value?.orig_name ||
									message.content.value?.path.split("/").pop() ||
									"file"}
						>
							{message.content.value?.orig_name ||
								message.content.value?.path.split("/").pop() ||
								"file"}
						</a>
					{/if}
				</button>
			</div>

			{#if layout === "panel"}
				<ButtonPanel
					{...button_panel_props}
					on:copy={(e) => dispatch("copy", e.detail)}
				/>
			{/if}
		{/each}
	</div>
</div>

{#if layout === "bubble"}
	<ButtonPanel {...button_panel_props} />
{/if}

<style>
	.message {
		position: relative;
		width: 100%;
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

	.message-fit {
		width: fit-content !important;
	}

	.panel-full-width {
		width: 100%;
	}
	.message-markdown-disabled {
		white-space: pre-line;
	}

	.user {
		border-width: 1px;
		border-radius: var(--radius-md);
		align-self: flex-end;
		border-bottom-right-radius: 0;
		box-shadow: var(--shadow-drop);
		border-color: var(--border-color-accent-subdued);
		background-color: var(--color-accent-soft);
	}

	.bot {
		border-width: 1px;
		border-radius: var(--radius-lg);
		border-bottom-left-radius: 0;
		border-color: var(--border-color-primary);
		background-color: var(--background-fill-secondary);
		box-shadow: var(--shadow-drop);
		align-self: flex-start;
		text-align: right;
	}

	.panel .user :global(*) {
		text-align: right;
	}

	/* Colors */
	.bubble .bot {
		border-color: var(--border-color-primary);
	}

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

	.bubble .message-fit {
		width: fit-content !important;
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

	.message-content {
		padding: var(--spacing-sm) var(--spacing-xl);
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
		padding: 6px;
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

	.message > button {
		width: 100%;
	}
	.html {
		padding: 0;
		border: none;
		background: none;
	}

	.thought {
		margin-top: var(--spacing-xxl);
	}

	.panel .bot,
	.panel .user {
		border: none;
		box-shadow: none;
		background-color: var(--background-fill-secondary);
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
