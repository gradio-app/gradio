<script lang="ts">
	import { format_chat_for_sharing, is_component_message } from "./utils";
	import type { NormalisedMessage } from "../types";
	import { Gradio, copy } from "@gradio/utils";

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

	import { Clear, Trash, Community } from "@gradio/icons";
	import { IconButtonWrapper, IconButton } from "@gradio/atoms";
	import type { SelectData, LikeData } from "@gradio/utils";
	import type { MessageRole } from "../types";
	import { MarkdownCode as Markdown } from "@gradio/markdown";
	import type { FileData, Client } from "@gradio/client";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import Pending from "./Pending.svelte";
	import { ShareError } from "@gradio/utils";

	export let value: NormalisedMessage[] | null = [];
	let old_value: NormalisedMessage[] | null = null;

	import LikeButtons from "./ButtonPanel.svelte";
	import type { LoadedComponent } from "../../core/src/types";
	import ChatBotBubble from "./ChatBotBubble.svelte";

	import CopyAll from "./CopyAll.svelte";
	import ChatBotPanel from "./ChatBotPanel.svelte";

	export let _fetch: typeof fetch;
	export let load_component: Gradio["load_component"];

	let _components: Record<string, ComponentType<SvelteComponent>> = {};

	async function load_components(component_names: string[]): Promise<void> {
		let names: string[] = [];
		let components: ReturnType<typeof load_component>["component"][] = [];
		component_names.forEach((component_name) => {
			if (_components[component_name] || component_name === "file") {
				return;
			}

			const { name, component } = load_component(component_name, "base");
			names.push(name);
			components.push(component);
			component_name;
		});

		const loaded_components: LoadedComponent[] = await Promise.all(components);
		loaded_components.forEach((component, i) => {
			_components[names[i]] = component.default;
		});
	}

	$: load_components(get_components_from_messages(value));

	function get_components_from_messages(
		messages: NormalisedMessage[] | null
	): string[] {
		if (!messages) return [];
		let components: Set<string> = new Set();
		messages.forEach((message) => {
			if (message.type === "component") {
				components.add(message.content.component);
			}
		});
		return Array.from(components);
	}

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
	export let render_markdown = true;
	export let line_breaks = true;
	export let theme_mode: "system" | "light" | "dark";
	export let i18n: I18nFormatter;
	export let layout: "bubble" | "panel" = "bubble";
	export let placeholder: string | null = null;
	export let upload: Client["upload"];
	export let msg_format: "tuples" | "messages" = "tuples";
	export let _retryable = false;
	export let _undoable = false;
	export let root: string;

	let target: HTMLElement | null = null;

	onMount(() => {
		target = document.querySelector("div.gradio-container");
		adjust_text_size();
	});

	let div: HTMLDivElement;
	let autoscroll: boolean;

	function adjust_text_size(): void {
		let style = getComputedStyle(document.body);
		let body_text_size = style.getPropertyValue("--body-text-size");
		let updated_text_size;

		switch (body_text_size) {
			case "13px":
				updated_text_size = 14;
				break;
			case "14px":
				updated_text_size = 16;
				break;
			case "16px":
				updated_text_size = 20;
				break;
			default:
				updated_text_size = 14;
				break;
		}

		document.body.style.setProperty(
			"--chatbot-body-text-size",
			updated_text_size + "px"
		);
	}

	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
		like: LikeData;
		undo: undefined;
		retry: undefined;
		clear: undefined;
		share: any;
		error: string;
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

	$: groupedMessages = value && group_messages(value);

	function is_last_bot_message(
		messages: NormalisedMessage[],
		total_length: number
	): boolean {
		const is_bot = messages[messages.length - 1].role === "assistant";
		const last_index = messages[messages.length - 1].index;
		let is_last;
		if (Array.isArray(last_index)) {
			is_last = 2 * last_index[0] + last_index[1] === total_length - 1;
		} else {
			is_last = last_index === total_length - 1;
		}
		return is_last && is_bot;
	}

	function handle_select(i: number, message: NormalisedMessage): void {
		dispatch("select", {
			index: message.index,
			value: message.content
		});
	}

	function handle_like(
		i: number,
		message: NormalisedMessage,
		selected: string | null
	): void {
		if (selected === "undo") {
			dispatch("undo");
			return;
		} else if (selected === "retry") {
			dispatch("retry");
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

	function group_messages(
		messages: NormalisedMessage[]
	): NormalisedMessage[][] {
		const groupedMessages: NormalisedMessage[][] = [];
		let currentGroup: NormalisedMessage[] = [];
		let currentRole: MessageRole | null = null;

		for (const message of messages) {
			if (msg_format === "tuples") {
				currentRole = null;
			}

			if (!(message.role === "assistant" || message.role === "user")) {
				continue;
			}
			if (message.role === currentRole) {
				currentGroup.push(message);
			} else {
				if (currentGroup.length > 0) {
					groupedMessages.push(currentGroup);
				}
				currentGroup = [message];
				currentRole = message.role;
			}
		}

		if (currentGroup.length > 0) {
			groupedMessages.push(currentGroup);
		}

		return groupedMessages;
	}

	let ChatbotLayout = layout === "bubble" ? ChatBotBubble : ChatBotPanel;
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
	class:placeholder-container={value === null || value.length === 0}
	bind:this={div}
	role="log"
	aria-label="chatbot conversation"
	aria-live="polite"
>
	<div class="chat-messages" use:copy>
		{#if value !== null && value.length > 0 && groupedMessages !== null}
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
				<div class="message-container">
					<ChatbotLayout
						{messages}
						{role}
						{avatar_img}
						{opposite_avatar_img}
						{render_markdown}
						{latex_delimiters}
						{sanitize_html}
						{line_breaks}
						{root}
						{is_component_message}
						{rtl}
						{handle_select}
						{value}
						{get_message_label_data}
						{i}
						{selectable}
						{target}
						{theme_mode}
						{upload}
						{_fetch}
						{i18n}
						{_components}
					/>

					<LikeButtons
						show={likeable ||
							(_retryable && is_last_bot_message(messages, value.length)) ||
							(_undoable && is_last_bot_message(messages, value.length)) ||
							show_copy_button}
						handle_action={(selected) => handle_like(i, messages[0], selected)}
						{likeable}
						_retryable={_retryable &&
							is_last_bot_message(messages, value.length)}
						_undoable={_undoable && is_last_bot_message(messages, value.length)}
						disable={generating}
						{show_copy_button}
						message={msg_format === "tuples" ? messages[0] : messages}
						position={role === "user" ? "right" : "left"}
						avatar={avatar_img}
						{layout}
					/>
				</div>
			{/each}
			{#if pending_message}
				<Pending {layout} />
			{/if}
		{:else if placeholder !== null}
			<center>
				<Markdown message={placeholder} {latex_delimiters} {root} />
			</center>
		{/if}
	</div>
</div>

<style>
	.message-container {
		position: relative;
	}

	.placeholder-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
	.panel-wrap,
	.bubble-wrap {
		width: 100%;
		overflow-y: auto;
	}

	.bubble-wrap {
		height: 100%;
		padding-top: var(--spacing-xxl);
	}

	:global(.dark) .bubble-wrap {
		background: var(--background-fill-secondary);
	}

	.chat-messages {
		display: flex;
		flex-direction: column;
		margin-bottom: var(--spacing-xxl);
	}

	.chat-messages > div :global(p:not(:first-child)) {
		margin-top: var(--spacing-xxl);
	}

	.chat-messages > .message :not(.image-button) :global(img),
	.chat-messages
		> div
		:not(.avatar-container)
		div
		:not(.image-button)
		:global(img) {
		margin: var(--size-2);
		max-height: 200px;
		border-radius: var(--radius-xl);
		max-width: 30vw;
		max-height: 30vw;
	}

	/* KaTeX */
	.chat-messages :global(span.katex) {
		font-size: var(--text-lg);
		direction: ltr;
	}

	.chat-messages :global(div[class*="code_wrap"] > button),
	.chat-messages :global(code > button > span) {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		z-index: 1;
		cursor: pointer;
	}
	.chat-messages :global(.check) {
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

	.chat-messages :global(pre) {
		position: relative;
	}

	.chat-messages :global(.grid-wrap) {
		max-height: 80%;
		max-width: 600px;
		object-fit: contain;
	}

	/* Image preview */
	:global(.message) :global(.preview) {
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
		background: var(--bg-color);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--button-secondary-border-color);
		border-radius: var(--radius-lg);
		cursor: pointer;
		height: 30px;
		width: 30px;
		padding: 3px;
	}

	:global(.prose.chatbot.md) {
		opacity: 0.8;
	}
</style>
