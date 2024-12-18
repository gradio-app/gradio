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

	let expanded = is_last_bot_message([message], value);

	function toggleExpanded(): void {
		expanded = !expanded;
	}
</script>

<button class="thought" on:click={toggleExpanded}>
	<div class="box" style:text-align={rtl ? "right" : "left"}>
		<div
			class="title"
			on:click|stopPropagation={toggleExpanded}
			role="button"
			tabindex="0"
			on:keydown={(e) => e.key === "Enter" && toggleExpanded()}
		>
			{#if message.content === ""}
				<span class="loading-spinner"></span>
			{/if}
			<span class="title-text">{message.metadata?.title}</span>
			<span
				style:transform={expanded ? "rotate(0deg)" : "rotate(-90deg)"}
				class="arrow"
			>
				<IconButton Icon={DropdownArrow} />
				<!-- <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
					<path
						d="M2 4L6 8L10 4"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg> -->
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
		border-radius: calc(var(--radius-md) - 1px);
		border-bottom-left-radius: 0;
		padding: var(--spacing-sm) var(--spacing-xl) var(--spacing-sm)
			var(--spacing-xl);
	}

	.box {
		max-width: max-content;
		font-size: 0.8em;
	}

	.title {
		display: inline-flex;
		color: var(--body-text-color);
		opacity: 0.8;
		cursor: pointer;
	}

	.content :global(*) {
		font-size: 0.8em;
	}

	.title-text {
		padding-right: var(--spacing-lg);
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
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
