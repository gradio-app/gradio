<script lang="ts">
	import type { FileData, Client } from "@gradio/client";
	import type { NormalisedMessage } from "../types";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { ComponentType, SvelteComponent } from "svelte";
	import MessageContent from "./MessageContent.svelte";
	import { is_last_bot_message } from "./utils";
	import { DropdownCircularArrow } from "@gradio/icons";
	import { IconButton } from "@gradio/atoms";
	import { slide } from "svelte/transition";

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
	export let nested_messages: NormalisedMessage[] = [];

	let expanded = is_last_bot_message([message], value);
	let is_nested = !!message.metadata?.parent_id;
	let has_content = message.content !== "" && message.content !== null;

	// Filter out null messages and duplicates
	$: filtered_nested_messages = nested_messages.filter(
		(m) =>
			// Must have content and title
			m.content !== null &&
			m.content !== "" &&
			m.metadata?.title &&
			// Must be a direct child of this thought
			m.metadata?.parent_id === message.metadata?.id &&
			// Prevent duplicates and circular references
			m.metadata?.id !== message.metadata?.id &&
			m.metadata?.id !== message.metadata?.parent_id
	);

	function toggleExpanded(): void {
		expanded = !expanded;
	}
</script>

<div
	class="thought"
	class:nested={is_nested}
	class:hidden={is_nested && !parent_expanded}
	class:orphaned={is_nested &&
		!value.some((m) => m.metadata?.id === message.metadata?.parent_id)}
>
	{#if message.metadata?.title}
		<div class="box" style:text-align={rtl ? "right" : "left"}>
			<div
				class="title"
				class:expanded
				on:click|stopPropagation={toggleExpanded}
				role="button"
				tabindex="0"
				on:keydown={(e) => e.key === "Enter" && toggleExpanded()}
			>
				<span
					class="arrow"
					style:transform={expanded ? "rotate(180deg)" : "rotate(0deg)"}
				>
					<IconButton Icon={DropdownCircularArrow} />
				</span>
				<span class="title-text">
					{message.metadata?.title}
					{#if message.content === "" || message.content === null}
						<span class="loading-spinner"></span>
					{/if}
					{#if message?.duration}
						<span class="duration">{message.duration}s</span>
					{/if}
				</span>
			</div>
			{#if expanded}
				<div class="content" transition:slide>
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
					{#each filtered_nested_messages as child_message}
						<svelte:self
							message={child_message}
							{value}
							{rtl}
							{sanitize_html}
							{latex_delimiters}
							{render_markdown}
							{_components}
							{upload}
							thought_index={thought_index + 1}
							{target}
							{root}
							{theme_mode}
							{_fetch}
							{scroll}
							{allow_file_downloads}
							{display_consecutive_in_same_bubble}
							{i18n}
							{line_breaks}
							parent_expanded={expanded}
							nested_messages={value.filter(
								(m) => m.metadata?.parent_id === child_message.metadata?.id
							)}
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.thought {
		width: 100%;
		box-sizing: border-box;
		border: none;
		margin: 0;
		padding: 0;
		display: block;
		overflow: hidden;
	}

	.thought.hidden {
		display: none;
	}

	.thought:not(.nested) {
		border: 1px solid var(--border-color-primary);
		background: var(--background-fill-primary);
		margin-top: var(--spacing-sm);
		border-radius: var(--radius-sm);
		padding-bottom: var(--spacing-sm);
	}

	.thought.nested {
		width: 100%;
		margin: 0;
		margin-left: var(--spacing-lg);
		margin-top: var(--spacing-md);
	}

	.thought.nested .title {
		position: relative;
	}

	.box {
		max-width: 100%;
		border-radius: var(--radius-sm);
	}

	.thought.nested .box {
		background: none;
	}

	.title {
		display: flex;
		align-items: center;
		color: var(--body-text-color);
		cursor: pointer;
		width: 100%;
	}

	.content {
		margin-top: var(--spacing-sm);
		overflow-wrap: break-word;
		word-break: break-word;
		padding: var(--spacing-sm) var(--spacing-lg);
		padding-top: 0;
	}

	.content :global(*) {
		font-size: var(--text-md);
	}

	.title-text {
		flex: 1;
		min-width: 0;
		padding-right: var(--spacing-sm);
		font-size: var(--text-lg);
	}

	.duration {
		color: var(--body-text-color-subdued);
		margin-left: var(--spacing-sm);
	}

	.arrow {
		width: var(--size-8);
		height: var(--size-8);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 2px solid var(--body-text-color);
		border-radius: 50%;
		border-top-color: transparent;
		animation: spin 1s linear infinite;
		margin: 0 var(--size-1) -1px var(--size-1);
		opacity: 0.8;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
