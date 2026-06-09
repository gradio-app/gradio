<script lang="ts">
	import {
		format_chat_for_sharing,
		type UndoRetryData,
		type EditData,
		is_last_bot_message,
		group_messages,
		load_components,
		get_components_from_messages
	} from "./utils";
	import type { NormalisedMessage, Option } from "../types";
	import { copy } from "@gradio/utils";
	import type { CopyData } from "@gradio/utils";
	import Message from "./Message.svelte";

	import { dequal } from "dequal/lite";
	import { type SvelteComponent, type ComponentType, tick } from "svelte";

	import { Trash, Community, ScrollDownArrow } from "@gradio/icons";
	import { IconButtonWrapper, IconButton } from "@gradio/atoms";
	import type { CustomButton as CustomButtonType } from "@gradio/utils";
	import type { SelectData, LikeData } from "@gradio/utils";
	import type { ExampleMessage } from "../types";
	import type { FileData, Client } from "@gradio/client";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import Pending from "./Pending.svelte";
	import { ShareError } from "@gradio/utils";
	import { Gradio } from "@gradio/utils";

	import Examples from "./Examples.svelte";
	import CopyAll from "./CopyAll.svelte";

	let {
		value = null,
		_fetch,
		load_component,
		allow_file_downloads,
		display_consecutive_in_same_bubble,
		latex_delimiters,
		pending_message = false,
		generating = false,
		selectable = false,
		likeable = false,
		feedback_options,
		feedback_value = null,
		editable = null,
		show_share_button = false,
		show_copy_all_button = false,
		rtl = false,
		show_copy_button = false,
		buttons = null,
		on_custom_button_click = null,
		avatar_images = [null, null] as [FileData | null, FileData | null],
		sanitize_html = true,
		render_markdown = true,
		line_breaks = true,
		autoscroll = true,
		theme_mode,
		i18n,
		layout = "bubble",
		placeholder = null,
		upload,
		examples = null,
		_retryable = false,
		_undoable = false,
		like_user_message = false,
		allow_tags = false,
		watermark = null,
		show_progress = "full",
		onchange,
		onselect,
		onlike,
		onedit,
		onundo,
		onretry,
		onclear,
		onshare,
		onerror,
		onexampleselect,
		onoptionselect,
		oncopy
	}: {
		value?: NormalisedMessage[] | null;
		_fetch: typeof fetch;
		load_component: Gradio["load_component"];
		allow_file_downloads: boolean;
		display_consecutive_in_same_bubble: boolean;
		latex_delimiters: {
			left: string;
			right: string;
			display: boolean;
		}[];
		pending_message?: boolean;
		generating?: boolean;
		selectable?: boolean;
		likeable?: boolean;
		feedback_options: string[];
		feedback_value?: (string | null)[] | null;
		editable?: "user" | "all" | null;
		show_share_button?: boolean;
		show_copy_all_button?: boolean;
		rtl?: boolean;
		show_copy_button?: boolean;
		buttons?: (string | CustomButtonType)[] | null;
		on_custom_button_click?: ((id: number) => void) | null;
		avatar_images?: [FileData | null, FileData | null];
		sanitize_html?: boolean;
		render_markdown?: boolean;
		line_breaks?: boolean;
		autoscroll?: boolean;
		theme_mode: "system" | "light" | "dark";
		i18n: I18nFormatter;
		layout?: "bubble" | "panel";
		placeholder?: string | null;
		upload: Client["upload"];
		examples?: ExampleMessage[] | null;
		_retryable?: boolean;
		_undoable?: boolean;
		like_user_message?: boolean;
		allow_tags?: string[] | boolean;
		watermark?: string | null;
		show_progress?: "full" | "minimal" | "hidden";
		onchange?: () => void;
		onselect?: (data: SelectData) => void;
		onlike?: (data: LikeData) => void;
		onedit?: (data: EditData) => void;
		onundo?: (data: UndoRetryData) => void;
		onretry?: (data: UndoRetryData) => void;
		onclear?: () => void;
		onshare?: (data: any) => void;
		onerror?: (message: string) => void;
		onexampleselect?: (data: SelectData) => void;
		onoptionselect?: (data: SelectData) => void;
		oncopy?: (data: CopyData) => void;
	} = $props();

	let old_value: NormalisedMessage[] | null = $state(null);
	let _components: Record<string, ComponentType<SvelteComponent>> = $state({});

	const is_browser = typeof window !== "undefined";

	async function update_components(): Promise<void> {
		_components = await load_components(
			get_components_from_messages(value),
			_components,
			load_component
		);
	}

	$effect(() => {
		get_components_from_messages(value);
		update_components();
	});

	let target: HTMLElement | null = $state(null);
	let edit_index: number | null = $state(null);
	let edit_messages: string[] = $state([]);

	$effect(() => {
		target = document.querySelector("div.gradio-container");
	});

	let div: HTMLDivElement;
	let show_scroll_button = $state(false);

	function is_at_bottom(): boolean {
		return div && div.offsetHeight + div.scrollTop > div.scrollHeight - 100;
	}

	function scroll_to_bottom(): void {
		if (!div) return;
		div.scrollTo(0, div.scrollHeight);
		show_scroll_button = false;
	}

	let scroll_after_component_load = $state(false);

	async function scroll_on_value_update(): Promise<void> {
		if (!autoscroll) return;
		if (is_at_bottom()) {
			scroll_after_component_load = true;
			await tick();
			await new Promise((resolve) => setTimeout(resolve, 300));
			scroll_to_bottom();
		}
	}

	$effect(() => {
		if (autoscroll && div) {
			scroll_to_bottom();
		}
		value;
		pending_message;
		_components;
		scroll_on_value_update();
	});

	$effect(() => {
		if (!div) return;
		function handle_scroll(): void {
			if (is_at_bottom()) {
				show_scroll_button = false;
			} else {
				scroll_after_component_load = false;
				show_scroll_button = true;
			}
		}

		div.addEventListener("scroll", handle_scroll);
		return () => {
			div.removeEventListener("scroll", handle_scroll);
		};
	});

	$effect(() => {
		if (!dequal(value, old_value)) {
			old_value = value;
			onchange?.();
		}
	});

	let groupedMessages = $derived(
		value ? group_messages(value, display_consecutive_in_same_bubble) : null
	);

	let options = $derived.by(() => {
		if (!value || !groupedMessages || groupedMessages.length === 0)
			return undefined;
		const last_group = groupedMessages[groupedMessages.length - 1];
		if (last_group[0].role !== "assistant") return undefined;
		return last_group[last_group.length - 1].options;
	});

	function handle_action(
		i: number,
		message: NormalisedMessage,
		selected: string | null
	): void {
		if (selected === "undo" || selected === "retry") {
			const val_ = value as NormalisedMessage[];
			let last_index = val_.length - 1;
			while (val_[last_index].role === "assistant") {
				last_index--;
			}
			const handler = selected === "undo" ? onundo : onretry;
			handler?.({
				index: val_[last_index].index,
				value: val_[last_index].content
			});
		} else if (selected == "edit") {
			edit_index = i;
			edit_messages.push(message.content as string);
		} else if (selected == "edit_cancel") {
			edit_index = null;
		} else if (selected == "edit_submit") {
			edit_index = null;
			onedit?.({
				index: message.index,
				_dispatch_value: [{ type: "text", text: edit_messages[i].slice() }],
				value: edit_messages[i].slice(),
				previous_value: message.content as string
			});
		} else {
			let feedback =
				selected === "Like"
					? true
					: selected === "Dislike"
						? false
						: selected || "";
			if (!groupedMessages) return;

			const message_group = groupedMessages[i];
			const [first] = [message_group[0], message_group[message_group.length - 1]];

			onlike?.({
				index: first.index as number,
				value: message_group.map((m) => m.content),
				liked: feedback
			});
		}
	}
</script>

{#if value !== null && value.length > 0}
	<IconButtonWrapper {buttons} {on_custom_button_click}>
		{#if show_share_button}
			<IconButton
				Icon={Community}
				onclick={async () => {
					try {
						// @ts-ignore
						const formatted = await format_chat_for_sharing(value);
						onshare?.({
							description: formatted
						});
					} catch (e) {
						console.error(e);
						let message = e instanceof ShareError ? e.message : "Share failed.";
						onerror?.(message);
					}
				}}
			/>
		{/if}
		<IconButton
			Icon={Trash}
			onclick={() => onclear?.()}
			label={i18n("chatbot.clear")}
		/>
		{#if show_copy_all_button}
			<CopyAll {value} {watermark} />
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
				{@const feedback_index = groupedMessages
					.slice(0, i)
					.filter((m) => m[0].role === "assistant").length}
				{@const current_feedback =
					role === "bot" && feedback_value && feedback_value[feedback_index]
						? feedback_value[feedback_index]
						: null}
				<Message
					{messages}
					{display_consecutive_in_same_bubble}
					{opposite_avatar_img}
					{avatar_img}
					{role}
					{layout}
					{onselect}
					{i18n}
					{_fetch}
					{line_breaks}
					{theme_mode}
					{target}
					{upload}
					{selectable}
					{sanitize_html}
					{render_markdown}
					{rtl}
					{i}
					{value}
					{latex_delimiters}
					{_components}
					{generating}
					{feedback_options}
					{current_feedback}
					{allow_tags}
					{watermark}
					show_like={role === "user" ? likeable && like_user_message : likeable}
					show_retry={_retryable && is_last_bot_message(messages, value)}
					show_undo={_undoable && is_last_bot_message(messages, value)}
					show_edit={editable === "all" ||
						(editable == "user" &&
							role === "user" &&
							messages.length > 0 &&
							messages[messages.length - 1].type == "text")}
					in_edit_mode={edit_index === i}
					bind:edit_messages
					{show_copy_button}
					handle_action={(selected) => {
						if (selected == "edit") {
							edit_messages.splice(0, edit_messages.length);
						}
						if (selected === "edit" || selected === "edit_submit") {
							messages.forEach((msg, index) => {
								handle_action(selected === "edit" ? i : index, msg, selected);
							});
						} else {
							handle_action(i, messages[0], selected);
						}
					}}
					scroll={is_browser ? scroll_to_bottom : () => {}}
					{allow_file_downloads}
					{oncopy}
				/>
				{#if show_progress !== "hidden" && generating && messages[messages.length - 1].role === "assistant" && messages[messages.length - 1].metadata?.status === "done"}
					<Pending {layout} {avatar_images} />
				{/if}
			{/each}
			{#if show_progress !== "hidden" && pending_message}
				<Pending {layout} {avatar_images} />
			{:else if options}
				<div class="options">
					{#each options as option, index}
						<button
							class="option"
							onclick={() =>
								onoptionselect?.({
									index: index,
									value: option.value
								})}
						>
							{option.label || option.value}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<Examples
			{examples}
			{placeholder}
			{latex_delimiters}
			{onexampleselect}
		/>
	{/if}
</div>

{#if show_scroll_button}
	<div class="scroll-down-button-container">
		<IconButton
			Icon={ScrollDownArrow}
			label="Scroll down"
			size="large"
			onclick={scroll_to_bottom}
		/>
	</div>
{/if}

<style>
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

	@media (prefers-color-scheme: dark) {
		.bubble-wrap {
			background: var(--background-fill-secondary);
		}
	}

	.message-wrap :global(.prose.chatbot.md) {
		opacity: 0.8;
		overflow-wrap: break-word;
	}

	.message-wrap :global(.message-row .md img) {
		border-radius: var(--radius-xl);
		margin: var(--size-2);
		width: 400px;
		max-width: 30vw;
		max-height: 30vw;
	}

	/* link styles */
	.message-wrap :global(.message a) {
		color: var(--color-text-link);
		text-decoration: underline;
	}

	/* table styles */
	.message-wrap :global(.bot:not(:has(.table-wrap)) table),
	.message-wrap :global(.bot:not(:has(.table-wrap)) tr),
	.message-wrap :global(.bot:not(:has(.table-wrap)) td),
	.message-wrap :global(.bot:not(:has(.table-wrap)) th) {
		border: 1px solid var(--border-color-primary);
	}

	.message-wrap :global(.user table),
	.message-wrap :global(.user tr),
	.message-wrap :global(.user td),
	.message-wrap :global(.user th) {
		border: 1px solid var(--border-color-accent);
	}

	/* KaTeX */
	.message-wrap :global(span.katex) {
		font-size: var(--text-lg);
		direction: ltr;
	}

	.message-wrap :global(span.katex-display) {
		margin-top: 0;
	}

	.message-wrap :global(pre) {
		position: relative;
	}

	.message-wrap :global(.grid-wrap) {
		max-height: 80% !important;
		max-width: 600px;
		object-fit: contain;
	}

	.message-wrap > div :global(p:not(:first-child)) {
		margin-top: var(--spacing-xxl);
	}

	.message-wrap {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		margin-bottom: var(--spacing-xxl);
		direction: ltr;
	}

	.panel-wrap :global(.message-row:first-child) {
		padding-top: calc(var(--spacing-xxl) * 2);
	}

	.scroll-down-button-container {
		position: absolute;
		bottom: 10px;
		left: 50%;
		transform: translateX(-50%);
		z-index: var(--layer-top);
	}
	.scroll-down-button-container :global(button) {
		border-radius: 50%;
		box-shadow: var(--shadow-drop);
		transition:
			box-shadow 0.2s ease-in-out,
			transform 0.2s ease-in-out;
	}
	.scroll-down-button-container :global(button:hover) {
		box-shadow:
			var(--shadow-drop),
			0 2px 2px rgba(0, 0, 0, 0.05);
		transform: translateY(-2px);
	}

	.options {
		margin-left: auto;
		padding: var(--spacing-xxl);
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-xxl);
		max-width: calc(min(4 * 200px + 5 * var(--spacing-xxl), 100%));
		justify-content: flex-end;
	}

	.option {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--spacing-xl);
		border: 1px dashed var(--border-color-primary);
		border-radius: var(--radius-md);
		background-color: var(--background-fill-secondary);
		cursor: pointer;
		transition: var(--button-transition);
		max-width: var(--size-56);
		width: 100%;
		justify-content: center;
	}

	.option:hover {
		background-color: var(--color-accent-soft);
		border-color: var(--border-color-accent);
	}
</style>
