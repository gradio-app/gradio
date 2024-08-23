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
	import { ShareButton } from "@gradio/atoms";
	import { Image } from "@gradio/image/shared";

	import { Clear } from "@gradio/icons";
	import type { SelectData, LikeData } from "@gradio/utils";
	import type { MessageRole } from "../types";
	import { MarkdownCode as Markdown } from "@gradio/markdown";
	import type { FileData, Client } from "@gradio/client";
	import type { I18nFormatter } from "js/core/src/gradio_helper";
	import Pending from "./Pending.svelte";
	import MessageBox from "./MessageBox.svelte";

	export let value: NormalisedMessage[] | null = [];
	let old_value: NormalisedMessage[] | null = null;

	import Component from "./Component.svelte";
	import LikeButtons from "./ButtonPanel.svelte";
	import type { LoadedComponent } from "../../core/src/types";

	import CopyAll from "./CopyAll.svelte";

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
</script>

{#if show_share_button && value !== null && value.length > 0}
	<div class="share-button">
		<ShareButton
			{i18n}
			on:error
			on:share
			formatter={format_chat_for_sharing}
			{value}
		/>
	</div>
{/if}

{#if show_copy_all_button}
	<CopyAll {value} />
{/if}

<div
	class={layout === "bubble" ? "bubble-wrap" : "panel-wrap"}
	class:placeholder-container={value === null || value.length === 0}
	bind:this={div}
	role="log"
	aria-label="chatbot conversation"
	aria-live="polite"
>
	<div class="message-wrap" use:copy>
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
				<div
					class="message-row {layout} {role}-row"
					class:with_avatar={avatar_img !== null}
					class:with_opposite_avatar={opposite_avatar_img !== null}
				>
					{#if avatar_img !== null}
						<div class="avatar-container">
							<Image
								class="avatar-image"
								src={avatar_img?.url}
								alt="{role} avatar"
							/>
						</div>
					{/if}
					<div
						class="flex-wrap {role} "
						class:component-wrap={messages[0].type === "component"}
					>
						{#each messages as message, thought_index}
							{@const msg_type = messages[0].type}
							<div
								class="message {role} {is_component_message(message)
									? message?.content.component
									: ''}"
								class:message-fit={!bubble_full_width}
								class:panel-full-width={true}
								class:message-markdown-disabled={!render_markdown}
								style:text-align={rtl && role === "user" ? "left" : "right"}
								class:component={msg_type === "component"}
								class:html={is_component_message(message) &&
									message.content.component === "html"}
								class:thought={thought_index > 0}
							>
								<button
									data-testid={role}
									class:latest={i === value.length - 1}
									class:message-markdown-disabled={!render_markdown}
									style:user-select="text"
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
									aria-label={role +
										"'s message: " +
										get_message_label_data(message)}
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
				<LikeButtons
					show={likeable || show_copy_button}
					handle_action={(selected) => handle_like(i, messages[0], selected)}
					{likeable}
					{show_copy_button}
					message={msg_format === "tuples" ? messages[0] : messages}
					position={role === "user" ? "right" : "left"}
					avatar={avatar_img}
					{layout}
				/>
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
		align-self: flex-start;
		border-bottom-left-radius: 0;
		box-shadow: var(--shadow-drop);
		align-self: flex-start;
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
		/* flex-direction: column; */
		position: relative;
	}

	.message-row.user-row {
		align-self: flex-end;
	}
	.message-row.bubble {
		margin: calc(var(--spacing-xl) * 3);
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

	.message-row.panel.user-row {
		align-self: flex-end;
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

	.share-button {
		position: absolute;
		top: 4px;
		right: 6px;
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

	/* Copy button */
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

	/* Image preview */
	.message :global(.preview) {
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
		background: none;
		border: none;
		font-size: 1.5em;
		cursor: pointer;
		height: 30px;
		width: 30px;
		padding: 3px;
		background: var(--bg-color);
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--button-secondary-border-color);
		border-radius: var(--radius-lg);
	}

	.component {
		padding: 0;
		border-radius: var(--radius-md);
		width: fit-content;
		max-width: 80%;
		max-height: 80%;
		border: 1px solid var(--border-color-primary);
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
	}
	.html {
		padding: 0;
		border: none;
		background: none;
	}
</style>
