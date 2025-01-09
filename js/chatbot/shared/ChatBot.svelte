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
	import {
		createEventDispatcher,
		type SvelteComponent,
		type ComponentType,
		tick,
		onMount
	} from "svelte";

	import { Trash, Community, ScrollDownArrow } from "@gradio/icons";
	import { IconButtonWrapper, IconButton } from "@gradio/atoms";
	import type { SelectData, LikeData } from "@gradio/utils";
	import type { ExampleMessage } from "../types";
	import type { FileData, Client } from "@gradio/client";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import Pending from "./Pending.svelte";
	import { ShareError } from "@gradio/utils";
	import { Gradio } from "@gradio/utils";

	import Examples from "./Examples.svelte";

	export let value: NormalisedMessage[] | null = [];
	let old_value: NormalisedMessage[] | null = null;

	import CopyAll from "./CopyAll.svelte";

	export let _fetch: typeof fetch;
	export let load_component: Gradio["load_component"];
	export let allow_file_downloads: boolean;
	export let display_consecutive_in_same_bubble: boolean;

	let _components: Record<string, ComponentType<SvelteComponent>> = {};

	const is_browser = typeof window !== "undefined";

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
	export let feedback_options: string[];
	export let feedback_value: (string | null)[] | null = null;
	export let editable: "user" | "all" | null = null;
	export let show_share_button = false;
	export let show_copy_all_button = false;
	export let rtl = false;
	export let show_copy_button = false;
	export let avatar_images: [FileData | null, FileData | null] = [null, null];
	export let sanitize_html = true;
	export let render_markdown = true;
	export let line_breaks = true;
	export let autoscroll = true;
	export let theme_mode: "system" | "light" | "dark";
	export let i18n: I18nFormatter;
	export let layout: "bubble" | "panel" = "bubble";
	export let placeholder: string | null = null;
	export let upload: Client["upload"];
	export let msg_format: "tuples" | "messages" = "tuples";
	export let examples: ExampleMessage[] | null = null;
	export let _retryable = false;
	export let _undoable = false;
	export let like_user_message = false;
	export let root: string;

	let target: HTMLElement | null = null;
	let edit_index: number | null = null;
	let edit_message = "";

	onMount(() => {
		target = document.querySelector("div.gradio-container");
	});

	let div: HTMLDivElement;

	let show_scroll_button = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
		like: LikeData;
		edit: EditData;
		undo: UndoRetryData;
		retry: UndoRetryData;
		clear: undefined;
		share: any;
		error: string;
		example_select: SelectData;
		option_select: SelectData;
		copy: CopyData;
	}>();

	function is_at_bottom(): boolean {
		return div && div.offsetHeight + div.scrollTop > div.scrollHeight - 100;
	}

	function scroll_to_bottom(): void {
		if (!div) return;
		div.scrollTo(0, div.scrollHeight);
		show_scroll_button = false;
	}

	let scroll_after_component_load = false;

	async function scroll_on_value_update(): Promise<void> {
		if (!autoscroll) return;

		if (is_at_bottom()) {
			// Child components may be loaded asynchronously,
			// so trigger the scroll again after they load.
			scroll_after_component_load = true;

			await tick(); // Wait for the DOM to update so that the scrollHeight is correct
			scroll_to_bottom();
		} else {
			show_scroll_button = true;
		}
	}
	onMount(() => {
		scroll_on_value_update();
	});
	$: if (value || pending_message || _components) {
		scroll_on_value_update();
	}

	onMount(() => {
		function handle_scroll(): void {
			if (is_at_bottom()) {
				show_scroll_button = false;
			} else {
				scroll_after_component_load = false;
			}
		}

		div?.addEventListener("scroll", handle_scroll);
		return () => {
			div?.removeEventListener("scroll", handle_scroll);
		};
	});

	$: {
		if (!dequal(value, old_value)) {
			old_value = value;
			dispatch("change");
		}
	}
	$: groupedMessages = value && group_messages(value, msg_format);
	$: options = value && get_last_bot_options();

	function handle_action(
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
		} else if (selected == "edit") {
			edit_index = i;
			edit_message = message.content as string;
		} else if (selected == "edit_cancel") {
			edit_index = null;
		} else if (selected == "edit_submit") {
			edit_index = null;
			dispatch("edit", {
				index: message.index,
				value: edit_message,
				previous_value: message.content as string
			});
		} else {
			let feedback =
				selected === "Like"
					? true
					: selected === "Dislike"
						? false
						: selected || "";
			if (msg_format === "tuples") {
				dispatch("like", {
					index: message.index,
					value: message.content,
					liked: feedback
				});
			} else {
				if (!groupedMessages) return;

				const message_group = groupedMessages[i];
				const [first, last] = [
					message_group[0],
					message_group[message_group.length - 1]
				];

				dispatch("like", {
					index: first.index as number,
					value: message_group.map((m) => m.content),
					liked: feedback
				});
			}
		}
	}

	function get_last_bot_options(): Option[] | undefined {
		if (!value || !groupedMessages || groupedMessages.length === 0)
			return undefined;
		const last_group = groupedMessages[groupedMessages.length - 1];
		if (last_group[0].role !== "assistant") return undefined;
		return last_group[last_group.length - 1].options;
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
			/>
		{/if}
		<IconButton Icon={Trash} on:click={() => dispatch("clear")} label={"Clear"}
		></IconButton>
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
					{render_markdown}
					{rtl}
					{i}
					{value}
					{latex_delimiters}
					{_components}
					{generating}
					{msg_format}
					{feedback_options}
					{current_feedback}
					show_like={role === "user" ? likeable && like_user_message : likeable}
					show_retry={_retryable && is_last_bot_message(messages, value)}
					show_undo={_undoable && is_last_bot_message(messages, value)}
					show_edit={editable === "all" ||
						(editable == "user" &&
							role === "user" &&
							messages.length > 0 &&
							messages[messages.length - 1].type == "text")}
					in_edit_mode={edit_index === i}
					bind:edit_message
					{show_copy_button}
					handle_action={(selected) => handle_action(i, messages[0], selected)}
					scroll={is_browser ? scroll : () => {}}
					{allow_file_downloads}
					on:copy={(e) => dispatch("copy", e.detail)}
				/>
			{/each}
			{#if pending_message}
				<Pending {layout} {avatar_images} />
			{:else if options}
				<div class="options">
					{#each options as option, index}
						<button
							class="option"
							on:click={() =>
								dispatch("option_select", {
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
			{root}
			on:example_select={(e) => dispatch("example_select", e.detail)}
		/>
	{/if}
</div>

{#if show_scroll_button}
	<div class="scroll-down-button-container">
		<IconButton
			Icon={ScrollDownArrow}
			label="Scroll down"
			size="large"
			on:click={scroll_to_bottom}
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
		justify-content: end;
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
