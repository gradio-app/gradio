<script lang="ts">
	import type { FileData, Client } from "@gradio/client";
	import type { NormalisedMessage } from "../types";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { ComponentType, SvelteComponent } from "svelte";
	import MessageContent from "./MessageContent.svelte";
	import { is_last_bot_message } from "./utils";
	import { DropdownArrow } from "@gradio/icons";
	import { IconButton } from "@gradio/atoms";

	export let message: NormalisedMessage;
	export let value: NormalisedMessage[];
	export let rtl = false;
	export let sanitize_html: boolean;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let render_markdown: boolean;
	export let _components: Record<string, ComponentType<SvelteComponent>>;
	export let upload: Client["upload"];
	export let thought_index: number;
	export let target: HTMLElement | null;
	export let root: string;
	export let theme_mode: "light" | "dark" | "system";
	export let _fetch: typeof fetch;
	export let scroll: () => void;
	export let allow_file_downloads: boolean;
	export let display_consecutive_in_same_bubble: boolean;
	export let i18n: I18nFormatter;
	export let line_breaks: boolean;
	export let parent_expanded = true;

	let expanded = is_last_bot_message([message], value);
	let is_nested = !!message.metadata?.parent_id;

	function toggleExpanded(): void {
		expanded = !expanded;
	}
</script>

<button
	class="thought"
	class:nested={is_nested}
	class:hidden={is_nested && !parent_expanded}
	on:click={toggleExpanded}
>
	<div class="box" style:text-align={rtl ? "right" : "left"}>
		<div
			class="title"
			on:click|stopPropagation={toggleExpanded}
			role="button"
			tabindex="0"
			on:keydown={(e) => e.key === "Enter" && toggleExpanded()}
		>
			<span class="title-text">
				{message.metadata?.title}
				{#if message.content === "" || message.content === null}
					<span class="loading-spinner"></span>
				{:else if message?.duration}
					<span class="duration">{message.duration || 0.16}s</span>
				{/if}
			</span>
			<span
				class="arrow"
				style:transform={expanded ? "rotate(0deg)" : "rotate(-90deg)"}
			>
				<IconButton Icon={DropdownArrow} />
			</span>
		</div>
		{#if expanded}
			<div class="content">
				<MessageContent
					{message}
					{sanitize_html}
					{latex_delimiters}
					{render_markdown}
					{_components}
					{upload}
					{thought_index}
					{target}
					{root}
					{theme_mode}
					{_fetch}
					{scroll}
					{allow_file_downloads}
					{display_consecutive_in_same_bubble}
					{i18n}
					{line_breaks}
				/>
			</div>
		{/if}
	</div>
</button>

<style>
	.thought {
		background: var(--color-accent-soft);
		width: 100%;
		box-sizing: border-box;
		border: none;
		opacity: 0.8;
		margin: 0;
		padding: 0;
		display: block;
	}

	.thought.hidden {
		display: none;
	}

	.thought.nested {
		width: calc(100% - var(--spacing-xl));
		border-left: 2px solid var(--border-color-primary);
		background: none;
		margin: var(--spacing-md);
		margin-left: var(--spacing-xl);
	}

	.thought:hover {
		opacity: 1;
	}

	.box {
		max-width: 100%;
		font-size: 0.8em;
		padding: var(--spacing-md) var(--spacing-xl);
	}

	.title {
		display: flex;
		align-items: center;
		color: var(--body-text-color);
		opacity: 0.8;
		cursor: pointer;
		width: 100%;
	}

	.content {
		margin-top: var(--spacing-md);
		overflow-wrap: break-word;
		word-break: break-word;
	}

	.content :global(*) {
		font-size: 0.8em;
	}

	.title-text {
		padding-right: var(--spacing-lg);
	}

	.duration {
		color: var(--body-text-color-subdued);
		margin-left: var(--spacing-sm);
		font-size: var(--text-sm);
	}

	.arrow {
		margin-left: auto;
		opacity: 0.8;
	}

	.loading-spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 2px solid var(--body-text-color);
		border-radius: 50%;
		border-top-color: transparent;
		animation: spin 1s linear infinite;
		margin-top: var(--spacing-xs);
		margin-right: var(--spacing-md);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
