<script lang="ts">
	import { format_chat_for_sharing, type NormalisedMessage } from "./utils";
	import { Gradio, copy } from "@gradio/utils";

	import { dequal } from "dequal/lite";
	import {
		beforeUpdate,
		afterUpdate,
		createEventDispatcher,
		type SvelteComponent,
		type ComponentType,
		tick
	} from "svelte";
	import { ShareButton } from "@gradio/atoms";
	import { Image } from "@gradio/image/shared";

	import { Clear } from "@gradio/icons";
	import type { SelectData, LikeData } from "@gradio/utils";
	import { MarkdownCode as Markdown } from "@gradio/markdown";
	import { type FileData, type Client } from "@gradio/client";
	import type { I18nFormatter } from "js/app/src/gradio_helper";
	import Pending from "./Pending.svelte";
	import Component from "./Component.svelte";
	import LikeButtons from "./ButtonPanel.svelte";
	import type { LoadedComponent } from "../../app/src/types";

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

	function get_components_from_messages(messages: typeof value): string[] {
		if (!messages) return [];
		let components: Set<string> = new Set();
		messages.forEach((message_pair) => {
			message_pair.forEach((message) => {
				if (
					typeof message === "object" &&
					message !== null &&
					"component" in message
				) {
					components.add(message.component);
				}
			});
		});

		return Array.from(components);
	}

	export let value: [NormalisedMessage, NormalisedMessage][] | null = [];
	let old_value: [NormalisedMessage, NormalisedMessage][] | null = null;

	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let pending_message = false;
	export let selectable = false;
	export let likeable = false;
	export let show_share_button = false;
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
	let target = document.querySelector("div.gradio-container");

	let div: HTMLDivElement;
	let autoscroll: boolean;

	$: adjust_text_size = () => {
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
	};

	$: adjust_text_size();

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

	afterUpdate(() => {
		if (autoscroll || _components) {
			scroll();
		}
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

	function handle_select(
		i: number,
		j: number,
		message: NormalisedMessage
	): void {
		dispatch("select", {
			index: [i, j],
			value: message
		});
	}

	function handle_like(
		i: number,
		j: number,
		message: NormalisedMessage,
		selected: string | null
	): void {
		dispatch("like", {
			index: [i, j],
			value: message,
			liked: selected === "like"
		});
	}

	function get_message_label_data(message: NormalisedMessage): string {
		if (message.type === "text") {
			return message.value;
		} else if (message.type === "component") {
			return `a component of type ${message.component}`;
		} else if (message.type === "file") {
			if (Array.isArray(message.file)) {
				return `file of extension type: ${message.file[0].orig_name?.split(".").pop()}`;
			}
			return (
				`file of extension type: ${message.file?.orig_name?.split(".").pop()}` +
				(message.file?.orig_name ?? "")
			);
		}
		return `a message of type ` + message.type ?? "unknown";
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

<div
	class={layout === "bubble" ? "bubble-wrap" : "panel-wrap"}
	class:placeholder-container={value === null || value.length === 0}
	bind:this={div}
	role="log"
	aria-label="chatbot conversation"
	aria-live="polite"
>
	<div class="message-wrap" use:copy>
		{#if value !== null && value.length > 0}
			{#each value as message_pair, i}
				{#each message_pair as message, j}
					{#if message.type !== "empty"}
						{#if is_image_preview_open}
							<div class="image-preview">
								<img
									src={image_preview_source}
									alt={image_preview_source_alt}
								/>
								<button
									class="image-preview-close-button"
									on:click={() => {
										is_image_preview_open = false;
									}}><Clear /></button
								>
							</div>
						{/if}
						<div
							class="message-row {layout} {j == 0 ? 'user-row' : 'bot-row'}"
							class:with_avatar={avatar_images[j] !== null}
							class:with_opposite_avatar={avatar_images[j === 0 ? 1 : 0] !==
								null}
						>
							{#if avatar_images[j] !== null}
								<div class="avatar-container">
									<Image
										class="avatar-image"
										src={avatar_images[j]?.url}
										alt="{j == 0 ? 'user' : 'bot'} avatar"
									/>
								</div>
							{/if}
							<div class="flex-wrap">
								<div
									class="message {j == 0 ? 'user' : 'bot'} {typeof message ===
										'object' &&
									message !== null &&
									'component' in message
										? message?.component
										: ''}"
									class:message-fit={!bubble_full_width}
									class:panel-full-width={true}
									class:message-markdown-disabled={!render_markdown}
									style:text-align={rtl && j == 0 ? "left" : "right"}
									class:component={typeof message === "object" &&
										message !== null &&
										"component" in message}
									class:html={typeof message === "object" &&
										message !== null &&
										"component" in message &&
										message.component === "html"}
								>
									<button
										data-testid={j == 0 ? "user" : "bot"}
										class:latest={i === value.length - 1}
										class:message-markdown-disabled={!render_markdown}
										style:user-select="text"
										class:selectable
										style:text-align={rtl ? "right" : "left"}
										on:click={() => handle_select(i, j, message)}
										on:keydown={(e) => {
											if (e.key === "Enter") {
												handle_select(i, j, message);
											}
										}}
										dir={rtl ? "rtl" : "ltr"}
										aria-label={(j == 0 ? "user" : "bot") +
											"'s message: " +
											get_message_label_data(message)}
									>
										{#if message.type === "text"}
											<Markdown
												message={message.value}
												{latex_delimiters}
												{sanitize_html}
												{render_markdown}
												{line_breaks}
												on:load={scroll}
											/>
										{:else if message.type === "component" && message.component in _components}
											<Component
												{target}
												{theme_mode}
												props={message.props}
												type={message.component}
												components={_components}
												value={message.value}
												{i18n}
												{upload}
												{_fetch}
												on:load={scroll}
											/>
										{:else if message.type === "component" && message.component === "file"}
											<a
												data-testid="chatbot-file"
												class="file-pil"
												href={message.value.url}
												target="_blank"
												download={window.__is_colab__
													? null
													: message.value?.orig_name ||
														message.value?.path.split("/").pop() ||
														"file"}
											>
												{message.value?.orig_name ||
													message.value?.path.split("/").pop() ||
													"file"}
											</a>
										{/if}
									</button>
								</div>
								<LikeButtons
									show={j === 1 && (likeable || show_copy_button)}
									handle_action={(selected) =>
										handle_like(i, j, message, selected)}
									{likeable}
									{show_copy_button}
									{message}
									position={j === 0 ? "right" : "left"}
									avatar={avatar_images[j]}
									{layout}
								/>
							</div>
						</div>
					{/if}
				{/each}
			{/each}
			{#if pending_message}
				<Pending {layout} />
			{/if}
		{:else if placeholder !== null}
			<center>
				<Markdown message={placeholder} {latex_delimiters} />
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

	.message :global(.prose) {
		font-size: var(--chatbot-body-text-size);
	}

	.message-bubble-border {
		border-width: 1px;
		border-radius: var(--radius-lg);
	}

	.bubble .user {
		border-width: 1px;
		border-radius: var(--radius-xl);
		align-self: flex-start;
		border-bottom-right-radius: 0;

		box-shadow: var(--shadow-drop-lg);
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

	.bubble .user {
		align-self: flex-start;
		border-bottom-right-radius: 0;
		text-align: right;
		padding: var(--spacing-sm) var(--spacing-xl);
	}

	.panel .user :global(*) {
		text-align: right;
	}

	/* Colors */
	.bubble .bot {
		border-color: var(--border-color-primary);
	}

	.bubble .user {
		border-color: var(--border-color-accent-subdued);
		background-color: var(--color-accent-soft);
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
		width: calc(100% - var(--spacing-xl) * 6);
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
