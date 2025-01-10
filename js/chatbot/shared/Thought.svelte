<script lang="ts">
	import type { Client } from "@gradio/client";
	import type { NormalisedMessage, ThoughtNode } from "../types";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import type { ComponentType, SvelteComponent } from "svelte";
	import MessageContent from "./MessageContent.svelte";
	import { DropdownCircularArrow } from "@gradio/icons";
	import { IconButton } from "@gradio/atoms";
	import { slide } from "svelte/transition";
	import { MarkdownCode as Markdown } from "@gradio/markdown-code";

	export let thought: NormalisedMessage;
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

	let expanded = true;

	function is_thought_node(msg: NormalisedMessage): msg is ThoughtNode {
		return "children" in msg;
	}

	let thought_node: ThoughtNode;
	$: thought_node = {
		...thought,
		children: is_thought_node(thought) ? thought.children : []
	} as ThoughtNode;

	function toggleExpanded(): void {
		expanded = !expanded;
	}
</script>

<div class="thought-group">
	<div
		class="title"
		class:expanded
		on:click|stopPropagation={toggleExpanded}
		aria-busy={thought_node.content === "" || thought_node.content === null}
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
		<Markdown
			message={thought_node.metadata?.title || ""}
			{render_markdown}
			{latex_delimiters}
			{sanitize_html}
			{root}
		/>
		{#if thought_node.content === "" || thought_node.content === null || thought_node.metadata?.status === "pending"}
			<span class="loading-spinner"></span>
		{/if}
		{#if thought_node?.metadata?.duration}
			<span class="duration">
				{#if Number.isInteger(thought_node.metadata.duration)}
					{thought_node.metadata.duration}s
				{:else if thought_node.metadata.duration >= 0.1}
					{thought_node.metadata.duration.toFixed(1)}s
				{:else}
					{(thought_node.metadata.duration * 1000).toFixed(1)}ms
				{/if}
			</span>
		{/if}
	</div>

	{#if expanded}
		<div class="content" transition:slide>
			<MessageContent
				message={thought_node}
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

			{#if thought_node.children?.length > 0}
				<div class="children">
					{#each thought_node.children as child, index}
						<svelte:self
							thought={child}
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
						/>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.thought-group {
		background: var(--background-fill-primary);
		border: 1px solid var(--border-color-primary);
		border-radius: var(--radius-sm);
		padding: var(--spacing-md);
		margin: var(--spacing-md) 0;
		font-size: var(--text-sm);
	}

	.children :global(.thought-group) {
		border: none;
		margin: 0;
		padding-bottom: 0;
	}

	.children {
		padding-left: var(--spacing-md);
	}

	.title {
		display: flex;
		align-items: center;
		color: var(--body-text-color);
		cursor: pointer;
		width: 100%;
	}

	.title :global(.md) {
		font-size: var(--text-sm) !important;
	}

	.content {
		overflow-wrap: break-word;
		word-break: break-word;
		margin-left: var(--spacing-lg);
		margin-bottom: var(--spacing-sm);
	}
	.content :global(*) {
		font-size: var(--text-sm);
		color: var(--body-text-color);
	}

	.thought-group :global(.thought:not(.nested)) {
		border: none;
		background: none;
	}

	.duration {
		color: var(--body-text-color-subdued);
		font-size: var(--text-sm);
		margin-left: var(--size-1);
	}

	.arrow {
		opacity: 0.8;
		width: var(--size-8);
		height: var(--size-8);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.arrow :global(button) {
		background-color: transparent;
	}

	.loading-spinner {
		display: inline-block;
		width: 12px;
		height: 12px;
		border: 2px solid var(--body-text-color);
		border-radius: 50%;
		border-top-color: transparent;
		animation: spin 1s linear infinite;
		margin: 0 var(--size-1) -1px var(--size-2);
		opacity: 0.8;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.thought-group :global(.message-content) {
		opacity: 0.8;
	}
</style>
