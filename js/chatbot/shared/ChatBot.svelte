<script lang="ts">
	import {
		format_chat_for_sharing,
		type UndoRetryData,
		is_last_bot_message,
		group_messages,
		load_components,
		get_components_from_messages
	} from "./utils";
	import type { NormalisedMessage } from "../types";
	import { copy } from "@gradio/utils";
	import Message from "./Message.svelte";

	import { dequal } from "dequal/lite";
	import {
		beforeUpdate,
		afterUpdate,
		createEventDispatcher,
		type SvelteComponent,
		type ComponentType,
		tick,
		onMount
	} from "svelte";
	import { Image } from "@gradio/image/shared";

	import { Clear, Trash, Community } from "@gradio/icons";
	import { IconButtonWrapper, IconButton } from "@gradio/atoms";
	import type { SelectData, LikeData } from "@gradio/utils";
	import type { SuggestionMessage } from "../types";
	import { MarkdownCode as Markdown } from "@gradio/markdown";
	import type { FileData, Client } from "@gradio/client";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import Pending from "./Pending.svelte";
	import { ShareError } from "@gradio/utils";
	import { Gradio } from "@gradio/utils";

	export let value: NormalisedMessage[] | null = [];
	let old_value: NormalisedMessage[] | null = null;

	import CopyAll from "./CopyAll.svelte";

	export let _fetch: typeof fetch;
	export let load_component: Gradio["load_component"];

	let _components: Record<string, ComponentType<SvelteComponent>> = {};

	async function update_components(): Promise<void> {
		_components = await load_components(
			get_components_from_messages(value),
			_components,
			load_component
		);
	}

	$: value, update_components();

	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let pending_message = false;
	export let generating = false;
	export let selectable = false;
	export let likeable = false;
	export let show_share_button = false;
	export let show_copy_all_button = false;
	export let rtl = false;
	export let show_copy_button = false;
	export let avatar_images: [FileData | null, FileData | null] = [null, null];
	export let sanitize_html = true;
	export let bubble_full_width = true;
	export let render_markdown = true;
	export let line_breaks = true;
	export let theme_mode: "system" | "light" | "dark";
	export let i18n: I18nFormatter;
	export let layout: "bubble" | "panel" = "bubble";
	export let placeholder: string | null = null;
	export let upload: Client["upload"];
	export let msg_format: "tuples" | "messages" = "tuples";
	export let suggestions: SuggestionMessage[] | null = null;
	export let _retryable = false;
	export let _undoable = false;
	export let like_user_message = false;
	export let root: string;

	let target: HTMLElement | null = null;

	onMount(() => {
		target = document.querySelector("div.gradio-container");
	});

	let div: HTMLDivElement;
	let autoscroll: boolean;

	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
		like: LikeData;
		undo: UndoRetryData;
		retry: UndoRetryData;
		clear: undefined;
		share: any;
		error: string;
		suggestion_select: SelectData;
	}>();

	beforeUpdate(() => {
		autoscroll =
			div && div.offsetHeight + div.scrollTop > div.scrollHeight - 100;
	});

	async function scroll(): Promise<void> {
		if (!div) return;
		await tick();
		requestAnimationFrame(() => {
			if (autoscroll) {
				div?.scrollTo(0, div.scrollHeight);
			}
		});
	}

	let image_preview_source: string;
	let image_preview_source_alt: string;
	let is_image_preview_open = false;

	$: if (value || autoscroll || _components) {
		scroll();
	}
	afterUpdate(() => {
		if (!div) return;
		div.querySelectorAll("img").forEach((n) => {
			n.addEventListener("click", (e) => {
				const target = e.target as HTMLImageElement;
				if (target) {
					image_preview_source = target.src;
					image_preview_source_alt = target.alt;
					is_image_preview_open = true;
				}
			});
		});
	});

	$: {
		if (!dequal(value, old_value)) {
			old_value = value;
			dispatch("change");
		}
	}

	$: groupedMessages = value && group_messages(value, msg_format);

	function handle_suggestion_select(
		i: number,
		suggestion: SuggestionMessage
	): void {
		dispatch("suggestion_select", {
			index: i,
			value: { text: suggestion.text, files: suggestion.files }
		});
	}

	function handle_like(
		i: number,
		message: NormalisedMessage,
		selected: string | null
	): void {
		if (selected === "undo" || selected === "retry") {
			const val_ = value as NormalisedMessage[];
			// iterate through messages until we find the last user message
			// the index of this message is where the user needs to edit the chat history
			let last_index = val_.length - 1;
			while (val_[last_index].role === "assistant") {
				last_index--;
			}
			dispatch(selected, {
				index: val_[last_index].index,
				value: val_[last_index].content
			});
			return;
		}

		if (msg_format === "tuples") {
			dispatch("like", {
				index: message.index,
				value: message.content,
				liked: selected === "like"
			});
		} else {
			if (!groupedMessages) return;

			const message_group = groupedMessages[i];
			const [first, last] = [
				message_group[0],
				message_group[message_group.length - 1]
			];

			dispatch("like", {
				index: [first.index, last.index] as [number, number],
				value: message_group.map((m) => m.content),
				liked: selected === "like"
			});
		}
	}
</script>

{#if value !== null && value.length > 0}
	<IconButtonWrapper>
		{#if show_share_button}
			<IconButton
				Icon={Community}
				on:click={async () => {
					try {
						// @ts-ignore
						const formatted = await format_chat_for_sharing(value);
						dispatch("share", {
							description: formatted
						});
					} catch (e) {
						console.error(e);
						let message = e instanceof ShareError ? e.message : "Share failed.";
						dispatch("error", message);
					}
				}}
			>
				<Community />
			</IconButton>
		{/if}
		<IconButton Icon={Trash} on:click={() => dispatch("clear")}></IconButton>
		{#if show_copy_all_button}
			<CopyAll {value} />
		{/if}
	</IconButtonWrapper>
{/if}

<div
	class={layout === "bubble" ? "bubble-wrap" : "panel-wrap"}
	bind:this={div}
	role="log"
	aria-label="chatbot conversation"
	aria-live="polite"
>
	{#if value !== null && value.length > 0 && groupedMessages !== null}
		<div class="message-wrap" use:copy>
			{#each groupedMessages as messages, i}
				{@const role = messages[0].role === "user" ? "user" : "bot"}
				{@const avatar_img = avatar_images[role === "user" ? 0 : 1]}
				{@const opposite_avatar_img = avatar_images[role === "user" ? 0 : 1]}
				{#if is_image_preview_open}
					<div class="image-preview">
						<img src={image_preview_source} alt={image_preview_source_alt} />
						<button
							class="image-preview-close-button"
							on:click={() => {
								is_image_preview_open = false;
							}}><Clear /></button
						>
					</div>
				{/if}
				{@const show_like =
					role === "user" ? likeable && like_user_message : likeable}
				{@const show_retry = _retryable && is_last_bot_message(messages, value)}
				{@const show_undo = _undoable && is_last_bot_message(messages, value)}
				<Message
					{messages}
					{opposite_avatar_img}
					{avatar_img}
					{role}
					{layout}
					{dispatch}
					{i18n}
					{_fetch}
					{line_breaks}
					{theme_mode}
					{target}
					{root}
					{upload}
					{selectable}
					{sanitize_html}
					{bubble_full_width}
					{render_markdown}
					{rtl}
					{i}
					{value}
					{latex_delimiters}
					{_components}
					{generating}
					{msg_format}
					{show_like}
					{show_retry}
					{show_undo}
					{show_copy_button}
					handle_action={(selected) => handle_like(i, messages[0], selected)}
				/>
			{/each}
			{#if pending_message}
				<Pending {layout} />
			{/if}
		</div>
	{:else}
		<div class="placeholder-content">
			{#if placeholder !== null}
				<div class="placeholder">
					<Markdown message={placeholder} {latex_delimiters} {root} />
				</div>
			{/if}
			{#if suggestions !== null}
				<div class="suggestions">
					{#each suggestions as suggestion, i}
						<button
							class="suggestion"
							on:click={() => handle_suggestion_select(i, suggestion)}
						>
							{#if suggestion.icon !== undefined}
								<div class="suggestion-icon-container">
									<Image
										class="suggestion-icon"
										src={suggestion.icon.url}
										alt="suggestion-icon"
									/>
								</div>
							{/if}
							{#if suggestion.display_text !== undefined}
								<span class="suggestion-display-text"
									>{suggestion.display_text}</span
								>
							{:else}
								<span class="suggestion-text">{suggestion.text}</span>
								{#if suggestion.files !== undefined && suggestion.files.length > 1}
									<span class="suggestion-file"
										><em>{suggestion.files.length} Files</em></span
									>
								{:else if suggestion.files !== undefined && suggestion.files[0] !== undefined && suggestion.files[0].mime_type?.includes("image")}
									<Image
										class="suggestion-image"
										src={suggestion.files[0].url}
										alt="suggestion-image"
									/>
								{:else if suggestion.files !== undefined && suggestion.files[0] !== undefined}
									<span class="suggestion-file"
										><em>{suggestion.files[0].orig_name}</em></span
									>
								{/if}
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.placeholder-content {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.placeholder {
		align-items: center;
		display: flex;
		justify-content: center;
		height: 100%;
		flex-grow: 1;
	}

	.suggestions :global(img) {
		pointer-events: none;
	}

	.suggestions {
		margin: auto;
		padding: var(--spacing-xxl);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-xxl);
		max-width: calc(min(4 * 200px + 5 * var(--spacing-xxl), 100%));
	}

	.suggestion {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--spacing-md);
		border: 0.05px solid var(--border-color-primary);
		border-radius: var(--radius-xl);
		background-color: var(--background-fill-secondary);
		cursor: pointer;
		transition: var(--button-transition);
	}

	.suggestion:hover {
		background-color: var(--color-accent-soft);
		border-color: var(--border-color-accent);
	}

	.suggestion-icon-container {
		display: flex;
		align-self: flex-start;
		margin-left: var(--spacing-md);
		width: var(--size-6);
		height: var(--size-6);
	}

	.suggestion-image {
		max-height: var(--size-6);
		max-width: var(--size-6);
		object-fit: cover;
		border-radius: var(--radius-xl);
		margin-top: var(--spacing-md);
		align-self: flex-start;
	}

	.suggestion-display-text,
	.suggestion-text,
	.suggestion-file {
		font-size: var(--body-text-size);
		display: flex;
		align-self: flex-start;
		margin: var(--spacing-md);
		text-align: left;
		flex-grow: 1;
		text-overflow: ellipsis;
	}

	.panel-wrap {
		width: 100%;
		overflow-y: auto;
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
</style>
