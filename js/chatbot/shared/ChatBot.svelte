<script lang="ts">
	import { format_chat_for_sharing } from "./utils";
	import { copy } from "@gradio/utils";

	import { dequal } from "dequal/lite";
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import { ShareButton } from "@gradio/atoms";
	import type { SelectData, LikeData } from "@gradio/utils";
	import { MarkdownCode as Markdown } from "@gradio/markdown";
	import { get_fetchable_url_or_file, type FileData } from "@gradio/client";
	import Copy from "./Copy.svelte";
	import type { I18nFormatter } from "js/app/src/gradio_helper";
	import LikeDislike from "./LikeDislike.svelte";
	import Pending from "./Pending.svelte";

	export let value:
		| [
				string | { file: FileData; alt_text: string | null } | null,
				string | { file: FileData; alt_text: string | null } | null
		  ][]
		| null;
	let old_value:
		| [
				string | { file: FileData; alt_text: string | null } | null,
				string | { file: FileData; alt_text: string | null } | null
		  ][]
		| null = null;
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
	export let avatar_images: [string | null, string | null] = [null, null];
	export let sanitize_html = true;
	export let bubble_full_width = true;
	export let render_markdown = true;
	export let line_breaks = true;
	export let root: string;
	export let proxy_url: null | string;
	export let i18n: I18nFormatter;
	export let layout: "bubble" | "panel" = "bubble";

	let div: HTMLDivElement;
	let autoscroll: boolean;

	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
		like: LikeData;
	}>();

	beforeUpdate(() => {
		autoscroll =
			div && div.offsetHeight + div.scrollTop > div.scrollHeight - 100;
	});

	const scroll = (): void => {
		if (autoscroll) {
			div.scrollTo(0, div.scrollHeight);
		}
	};
	afterUpdate(() => {
		if (autoscroll) {
			scroll();
			div.querySelectorAll("img").forEach((n) => {
				n.addEventListener("load", () => {
					scroll();
				});
			});
		}
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
		message: string | { file: FileData; alt_text: string | null } | null
	): void {
		dispatch("select", {
			index: [i, j],
			value: message
		});
	}

	function handle_like(
		i: number,
		j: number,
		message: string | { file: FileData; alt_text: string | null } | null,
		liked: boolean
	): void {
		dispatch("like", {
			index: [i, j],
			value: message,
			liked: liked
		});
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
	bind:this={div}
	role="log"
	aria-label="chatbot conversation"
	aria-live="polite"
>
	<div class="message-wrap" class:bubble-gap={layout === "bubble"} use:copy>
		{#if value !== null}
			{#each value as message_pair, i}
				{#each message_pair as message, j}
					{#if message !== null}
						<div class="message-row {layout} {j == 0 ? 'user-row' : 'bot-row'}">
							{#if avatar_images[j] !== null}
								<div class="avatar-container">
									<img
										class="avatar-image"
										src={get_fetchable_url_or_file(
											avatar_images[j],
											root,
											proxy_url
										)}
										alt="{j == 0 ? 'user' : 'bot'} avatar"
									/>
								</div>
							{/if}

							<div
								class="message {j == 0 ? 'user' : 'bot'}"
								class:message-fit={layout === "bubble" && !bubble_full_width}
								class:panel-full-width={layout === "panel"}
								class:message-bubble-border={layout === "bubble"}
								class:message-markdown-disabled={!render_markdown}
							>
								<button
									data-testid={j == 0 ? "user" : "bot"}
									class:latest={i === value.length - 1}
									class:message-markdown-disabled={!render_markdown}
									style:user-select="text"
									class:selectable
									style:text-align="left"
									on:click={() => handle_select(i, j, message)}
									on:keydown={(e) => {
										if (e.key === "Enter") {
											handle_select(i, j, message);
										}
									}}
									dir={rtl ? "rtl" : "ltr"}
									aria-label={(j == 0 ? "user" : "bot") +
										"'s message:' " +
										message}
								>
									{#if typeof message === "string"}
										<Markdown
											{message}
											{latex_delimiters}
											{sanitize_html}
											{render_markdown}
											{line_breaks}
											on:load={scroll}
										/>
									{:else if message !== null && message.file?.mime_type?.includes("audio")}
										<audio
											data-testid="chatbot-audio"
											controls
											preload="metadata"
											src={message.file?.url}
											title={message.alt_text}
											on:play
											on:pause
											on:ended
										/>
									{:else if message !== null && message.file?.mime_type?.includes("video")}
										<video
											data-testid="chatbot-video"
											controls
											src={message.file?.url}
											title={message.alt_text}
											preload="auto"
											on:play
											on:pause
											on:ended
										>
											<track kind="captions" />
										</video>
									{:else if message !== null && message.file?.mime_type?.includes("image")}
										<img
											data-testid="chatbot-image"
											src={message.file?.url}
											alt={message.alt_text}
										/>
									{:else if message !== null && message.file?.url !== null}
										<a
											data-testid="chatbot-file"
											href={message.file?.url}
											target="_blank"
											download={window.__is_colab__
												? null
												: message.file?.orig_name || message.file?.path}
										>
											{message.file?.orig_name || message.file?.path}
										</a>
									{/if}
								</button>
							</div>
							{#if (likeable && j !== 0) || (show_copy_button && message && typeof message === "string")}
								<div
									class="message-buttons-{j == 0
										? 'user'
										: 'bot'} message-buttons-{layout} {avatar_images[j] !==
										null && 'with-avatar'}"
									class:message-buttons-fit={layout === "bubble" &&
										!bubble_full_width}
									class:bubble-buttons-user={layout === "bubble"}
								>
									{#if likeable && j == 1}
										<LikeDislike
											action="like"
											handle_action={() => handle_like(i, j, message, true)}
										/>
										<LikeDislike
											action="dislike"
											handle_action={() => handle_like(i, j, message, false)}
										/>
									{/if}
									{#if show_copy_button && message && typeof message === "string"}
										<Copy value={message} />
									{/if}
								</div>
							{/if}
						</div>
					{/if}
				{/each}
			{/each}
			{#if pending_message}
				<Pending {layout} />
			{/if}
		{/if}
	</div>
</div>

<style>
	.bubble-wrap {
		padding: var(--block-padding);
		width: 100%;
		overflow-y: auto;
	}

	.panel-wrap {
		width: 100%;
		overflow-y: auto;
	}

	.message-wrap {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.bubble-gap {
		gap: calc(var(--spacing-xxl) + var(--spacing-lg));
	}

	.message-wrap > div :not(.avatar-container) :global(img) {
		border-radius: 13px;
		max-width: 30vw;
	}

	.message-wrap > div :global(p:not(:first-child)) {
		margin-top: var(--spacing-xxl);
	}

	.message-wrap :global(audio) {
		width: 100%;
	}

	.message {
		position: relative;
		display: flex;
		flex-direction: column;
		align-self: flex-end;
		text-align: left;
		background: var(--background-fill-secondary);
		width: calc(100% - var(--spacing-xxl));
		color: var(--body-text-color);
		font-size: var(--text-lg);
		line-height: var(--line-lg);
		overflow-wrap: break-word;
		overflow-x: hidden;
		padding-right: calc(var(--spacing-xxl) + var(--spacing-md));
		padding: calc(var(--spacing-xxl) + var(--spacing-sm));
	}

	.message-bubble-border {
		border-width: 1px;
		border-radius: var(--radius-xxl);
	}

	.message-fit {
		width: fit-content !important;
	}

	.panel-full-width {
		padding: calc(var(--spacing-xxl) * 2);
		width: 100%;
	}
	.message-markdown-disabled {
		white-space: pre-line;
	}

	@media (max-width: 480px) {
		.panel-full-width {
			padding: calc(var(--spacing-xxl) * 2);
		}
	}

	.user {
		align-self: flex-start;
		border-bottom-right-radius: 0;
		text-align: right;
	}
	.bot {
		border-bottom-left-radius: 0;
	}

	/* Colors */
	.bot {
		border-color: var(--border-color-primary);
		background: var(--background-fill-secondary);
	}

	.user {
		border-color: var(--border-color-accent-subdued);
		background-color: var(--color-accent-soft);
	}
	.message-row {
		display: flex;
		flex-direction: row;
		position: relative;
	}

	.message-row.panel.user-row {
		background: var(--color-accent-soft);
	}

	.message-row.panel.bot-row {
		background: var(--background-fill-secondary);
	}

	.message-row:last-of-type {
		margin-bottom: var(--spacing-xxl);
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
			width: auto;
		}
	}
	.avatar-container {
		align-self: flex-end;
		position: relative;
		justify-content: center;
		width: 35px;
		height: 35px;
		flex-shrink: 0;
		bottom: 0;
	}
	.user-row.bubble > .avatar-container {
		order: 2;
		margin-left: 10px;
	}
	.bot-row.bubble > .avatar-container {
		margin-right: 10px;
	}

	.panel > .avatar-container {
		margin-left: 25px;
		align-self: center;
	}
	img.avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	.message-buttons-user,
	.message-buttons-bot {
		border-radius: var(--radius-md);
		display: flex;
		align-items: center;
		bottom: 0;
		height: var(--size-7);
		align-self: self-end;
		position: absolute;
		bottom: -15px;
		margin: 2px;
		padding-left: 5px;
		z-index: 1;
	}
	.message-buttons-bot {
		left: 10px;
	}
	.message-buttons-user {
		right: 5px;
	}

	.message-buttons-bot.message-buttons-bubble.with-avatar {
		left: 50px;
	}
	.message-buttons-user.message-buttons-bubble.with-avatar {
		right: 50px;
	}

	.message-buttons-bubble {
		border: 1px solid var(--border-color-accent);
		background: var(--background-fill-secondary);
	}

	.message-buttons-panel {
		left: unset;
		right: 0px;
		top: 0px;
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
	.message-wrap .message :global(img) {
		margin: var(--size-2);
		max-height: 200px;
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

	/* Lists */
	.message-wrap :global(ol),
	.message-wrap :global(ul) {
		padding-inline-start: 2em;
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
		padding: 5px;
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
</style>
