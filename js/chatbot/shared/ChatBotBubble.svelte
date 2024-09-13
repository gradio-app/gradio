<script lang="ts">
	import { MarkdownCode as Markdown } from "@gradio/markdown";
	import { Image } from "@gradio/image/shared";
	import MessageBox from "./MessageBox.svelte";
	import Component from "./Component.svelte";
	import { type ComponentType } from "svelte";
	import type { FileData } from "@gradio/client";
	import type { NormalisedMessage } from "../types";
	import type { I18nFormatter } from "js/core/src/gradio_helper";

	export let messages: any;
	export let role: "user" | "bot";
	export let avatar_img: FileData | null;
	export let opposite_avatar_img: FileData | null;
	export let render_markdown: boolean;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let sanitize_html: boolean;
	export let line_breaks: boolean;
	export let root: string;
	export let is_component_message: (message: NormalisedMessage) => boolean;
	export let bubble_full_width: boolean;
	export let rtl: boolean;
	export let handle_select: (i: number, message: NormalisedMessage) => void;
	export let value: NormalisedMessage[];
	export let get_message_label_data: (message: NormalisedMessage) => string;
	export let selectable: boolean;
	export let target: HTMLElement | null;
	export let theme_mode: string;
	export let upload: (
		file_data: FileData[],
		root_url: string,
		upload_id?: string | undefined,
		max_file_size?: number | undefined
	) => Promise<(FileData | null)[] | null>;
	export let _fetch: typeof fetch;
	export let _components: Record<string, ComponentType>;
	export let i18n: I18nFormatter;
	export let i: number;
</script>

<div
	class="message-row bubble {role}-row"
	class:with_avatar={avatar_img !== null}
	class:with_opposite_avatar={opposite_avatar_img !== null}
>
	{#if avatar_img !== null}
		<div class="avatar-container">
			<Image class="avatar-image" src={avatar_img?.url} alt="{role} avatar" />
		</div>
	{/if}
	<div
		class="flex-wrap {role} "
		class:component-wrap={messages[0].type === "component"}
	>
		{#each messages as message, thought_index}
			<div
				class="message {role} {is_component_message(message)
					? message?.content.component
					: ''}"
				class:message-fit={!bubble_full_width}
				class:panel-full-width={true}
				class:message-markdown-disabled={!render_markdown}
				style:text-align={rtl && role === "user" ? "left" : "right"}
				class:component={message.type === "component"}
				class:html={is_component_message(message) &&
					message.content.component === "html"}
				class:thought={thought_index > 0}
			>
				<button
					data-testid={role}
					class:latest={i === value.length - 1}
					class:message-markdown-disabled={!render_markdown}
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
						{#if message.metadata.title}
							<MessageBox title={message.metadata.title}>
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
							on:load={scroll}
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
		{/each}
	</div>
</div>

<style>
	.placeholder-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
	.panel-wrap {
		width: 100%;
		overflow-y: auto;
	}

	.flex-wrap {
		width: 100%;
		height: 100%;
	}

	.bubble-wrap {
		width: 100%;
		overflow-y: auto;
		height: 100%;
		padding-top: var(--spacing-xxl);
	}

	:global(.dark) .bubble-wrap {
		background: var(--background-fill-secondary);
	}

	.message-wrap {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin-bottom: var(--spacing-xxl);
	}

	.bubble-gap {
		gap: calc(var(--spacing-xxl) + var(--spacing-lg));
	}

	.message-wrap > div :global(p:not(:first-child)) {
		margin-top: var(--spacing-xxl);
	}

	.message {
		position: relative;
		display: flex;
		flex-direction: column;
		white-space: normal;
		word-break: break-word;
		width: calc(100% - var(--spacing-xxl));
		color: var(--body-text-color);
		font-size: var(--chatbot-body-text-size);
		overflow-wrap: break-word;
	}

	.thought {
		margin-top: var(--spacing-xxl);
	}

	.message :global(.prose) {
		font-size: var(--chatbot-body-text-size);
	}

	.message-bubble-border {
		border-width: 1px;
		border-radius: var(--radius-md);
	}

	.user {
		align-self: flex-end;
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

	.flex-wrap.user {
		border-width: 1px;
		border-radius: var(--radius-md);
		align-self: flex-start;
		border-bottom-right-radius: 0;
		box-shadow: var(--shadow-drop);
		align-self: flex-start;
		text-align: right;
		padding: var(--spacing-sm) var(--spacing-xl);
		border-color: var(--border-color-accent-subdued);
		background-color: var(--color-accent-soft);
	}

	:not(.component-wrap).flex-wrap.bot {
		border-width: 1px;
		border-radius: var(--radius-lg);
		border-bottom-left-radius: 0;
		box-shadow: var(--shadow-drop);
		text-align: right;
		padding: var(--spacing-sm) var(--spacing-xl);
		border-color: var(--border-color-primary);
		background-color: var(--background-fill-secondary);
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

	.message-row.user-row {
		align-self: flex-end;
	}
	.message-row.bubble {
		margin: calc(var(--spacing-xl) * 2);
		margin-bottom: var(--spacing-xl);
	}

	.with_avatar.message-row.panel {
		padding-left: calc(var(--spacing-xl) * 2) !important;
		padding-right: calc(var(--spacing-xl) * 2) !important;
	}

	.with_avatar.message-row.bubble.user-row {
		margin-right: calc(var(--spacing-xl) * 2) !important;
	}

	.with_avatar.message-row.bubble.bot-row {
		margin-left: calc(var(--spacing-xl) * 2) !important;
	}

	.with_opposite_avatar.message-row.bubble.user-row {
		margin-left: calc(var(--spacing-xxl) + 35px + var(--spacing-xxl));
	}

	.message-row.panel {
		margin: 0;
		padding: calc(var(--spacing-xl) * 3) calc(var(--spacing-xxl) * 2);
	}

	.message-row.panel.bot-row {
		background: var(--background-fill-secondary);
	}

	.message-row.bubble.user-row {
		align-self: flex-end;
		max-width: calc(100% - var(--spacing-xl) * 6);
	}

	.message-row.bubble.bot-row {
		align-self: flex-start;
		max-width: calc(100% - var(--spacing-xl) * 6);
	}

	.message-row:last-of-type {
		margin-bottom: calc(var(--spacing-xxl) * 2);
	}

	.user-row.bubble {
		flex-direction: row;
		justify-content: flex-end;
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
		margin-left: var(--spacing-xxl);
	}
	.bot-row > .avatar-container {
		margin-right: var(--spacing-xxl);
		margin-left: 0;
		margin-top: -5px;
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
	.message-wrap > .message :not(.image-button) :global(img) {
		margin: var(--size-2);
		max-height: 200px;
	}

	.message-wrap
		> div
		:not(.avatar-container)
		div
		:not(.image-button)
		:global(img) {
		border-radius: var(--radius-xl);
		margin: var(--size-2);
		width: 400px;
		max-width: 30vw;
		max-height: 30vw;
	}

	.message-wrap .message :global(a) {
		color: var(--color-text-link);
		text-decoration: underline;
	}

	.message-wrap .bot :global(table),
	.message-wrap .bot :global(tr),
	.message-wrap .bot :global(td),
	.message-wrap .bot :global(th) {
		border: 1px solid var(--border-color-primary);
	}

	.message-wrap .user :global(table),
	.message-wrap .user :global(tr),
	.message-wrap .user :global(td),
	.message-wrap .user :global(th) {
		border: 1px solid var(--border-color-accent);
	}

	/* KaTeX */
	.message-wrap :global(span.katex) {
		font-size: var(--text-lg);
		direction: ltr;
	}

	.message-wrap :global(div[class*="code_wrap"] > button) {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		z-index: 1;
		cursor: pointer;
		border-bottom-left-radius: var(--radius-sm);
		padding: var(--spacing-md);
		width: 25px;
		height: 25px;
	}

	.message-wrap :global(code > button > span) {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		width: 12px;
		height: 12px;
	}
	.message-wrap :global(.check) {
		position: absolute;
		top: 0;
		right: 0;
		opacity: 0;
		z-index: var(--layer-top);
		transition: opacity 0.2s;
		background: var(--background-fill-primary);
		padding: var(--size-1);
		width: 100%;
		height: 100%;
		color: var(--body-text-color);
	}

	.message-wrap :global(pre) {
		position: relative;
	}

	.message-wrap :global(.grid-wrap) {
		max-height: 80% !important;
		max-width: 600px;
		object-fit: contain;
	}

	.component {
		padding: 0;
		border-radius: var(--radius-md);
		width: fit-content;
		max-width: 80%;
		max-height: 80%;
		border: none;
		overflow: hidden;
	}

	.component.gallery {
		border: none;
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
			max-width: calc(100% - var(--spacing-xl) * 3);
			width: 100%;
		}
	}

	:global(.prose.chatbot.md) {
		opacity: 0.8;
	}

	.message > button {
		width: 100%;
		user-select: text;
	}
	.html {
		padding: 0;
		border: none;
		background: none;
	}
</style>
