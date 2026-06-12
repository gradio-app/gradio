<script lang="ts">
	import { File } from "@gradio/icons";
	import Component from "./Component.svelte";
	import { MarkdownCode as Markdown } from "@gradio/markdown-code";
	import type { NormalisedMessage } from "../types";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { Client, FileData } from "@gradio/client";
	import type { ComponentType, SvelteComponent } from "svelte";

	let {
		latex_delimiters,
		sanitize_html,
		_fetch,
		i18n,
		line_breaks,
		upload,
		target,
		theme_mode,
		_components,
		render_markdown,
		scroll,
		allow_file_downloads,
		display_consecutive_in_same_bubble,
		thought_index,
		allow_tags = false,
		message
	}: {
		latex_delimiters: {
			left: string;
			right: string;
			display: boolean;
		}[];
		sanitize_html: boolean;
		_fetch: typeof fetch;
		i18n: I18nFormatter;
		line_breaks: boolean;
		upload: Client["upload"];
		target: HTMLElement | null;
		theme_mode: "light" | "dark" | "system";
		_components: Record<string, ComponentType<SvelteComponent>>;
		render_markdown: boolean;
		scroll: () => void;
		allow_file_downloads: boolean;
		display_consecutive_in_same_bubble: boolean;
		thought_index: number;
		allow_tags?: string[] | boolean;
		message: NormalisedMessage;
	} = $props();
</script>

{#if message.type === "text"}
	<div class="message-content">
		<Markdown
			message={message.content}
			{latex_delimiters}
			{sanitize_html}
			{render_markdown}
			{line_breaks}
			onload={scroll}
			{allow_tags}
			{theme_mode}
		/>
	</div>
{:else if message.type === "component" && message.content.component in _components}
	<Component
		{target}
		{theme_mode}
		props={message.content.props}
		type={message.content.component}
		components={_components}
		value={message.content.value}
		display_icon_button_wrapper_top_corner={thought_index > 0 &&
			display_consecutive_in_same_bubble}
		{i18n}
		{upload}
		{_fetch}
		onload={scroll}
		{allow_file_downloads}
	/>
{:else if message.type === "component" && message.content.component === "file"}
	{#each message.content.value as file_}
		{@const file: FileData = file_ as FileData}
		<div class="file-container">
			<div class="file-icon">
				<File />
			</div>
			<div class="file-info">
				<a
					data-testid="chatbot-file"
					class="file-link"
					href={file.url}
					target="_blank"
					download={window.__is_colab__
						? null
						: file?.orig_name || file?.path.split("/").pop() || "file"}
				>
					<span class="file-name"
						>{file?.orig_name || file?.path.split("/").pop() || "file"}</span
					>
				</a>
				<span class="file-type"
					>{(file.orig_name || file.path || "")
						.split(".")
						.pop()
						?.toUpperCase() ?? "FILE"}</span
				>
			</div>
		</div>
	{/each}
{/if}

<style>
	.file-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		padding: var(--spacing-lg);
		border-radius: var(--radius-lg);
		width: fit-content;
		margin: var(--spacing-sm) 0;
	}

	.file-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--body-text-color);
	}

	.file-icon :global(svg) {
		width: var(--size-7);
		height: var(--size-7);
	}

	.file-info {
		display: flex;
		flex-direction: column;
	}

	.file-link {
		text-decoration: none;
		color: var(--body-text-color);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.file-name {
		font-family: var(--font);
		font-size: var(--text-md);
		font-weight: 500;
	}

	.file-type {
		font-family: var(--font);
		font-size: var(--text-sm);
		color: var(--body-text-color-subdued);
		text-transform: uppercase;
	}
</style>
