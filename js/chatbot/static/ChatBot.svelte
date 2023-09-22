<script lang="ts">
	import { format_chat_for_sharing } from "../utils";
	import { copy } from "@gradio/utils";

	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import { ShareButton } from "@gradio/atoms";
	import type { SelectData, LikeData } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";
	import { MarkdownCode as Markdown } from "@gradio/markdown/static";
	import { get_fetchable_url_or_file } from "@gradio/upload";
	import Copy from "./Copy.svelte";
	import type { I18nFormatter } from "js/app/src/gradio_helper";
	import { Like, Dislike, Check } from "@gradio/icons";

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
	export let root: string;
	export let root_url: null | string;
	export let i18n: I18nFormatter;

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
		if (value !== old_value) {
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

<div class="wrap" bind:this={div}>
	<div class="message-wrap" use:copy>
		{#if value !== null}
			{#each value as message_pair, i}
				{#each message_pair as message, j}
					<div
						class="message-row {j == 0 ? 'user-row' : 'bot-row'}"
						class:hide={message === null}
					>
						{#if avatar_images[j] !== null}
							<div class="avatar-container">
								<img
									class="avatar-image"
									src={get_fetchable_url_or_file(
										avatar_images[j],
										root,
										root_url
									)}
									alt="avatar-{j == 0 ? 'user' : 'bot'}"
								/>
							</div>
						{/if}
						<!-- TODO: fix-->
						<!-- svelte-ignore a11y-no-static-element-interactions-->
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<div
							data-testid={j == 0 ? "user" : "bot"}
							class:latest={i === value.length - 1}
							class="message {j == 0 ? 'user' : 'bot'}"
							class:message-fit={!bubble_full_width}
							class:selectable
							on:click={() => handle_select(i, j, message)}
							dir={rtl ? "rtl" : "ltr"}
						>
							<div
								class="message-buttons-{j == 0 ? 'user' : 'bot'}"
								class:message-buttons-fit={!bubble_full_width}
								class:hide={message === null}
							>
								{#if likeable && j == 1}
									<div class="like">
										<button on:click={() => handle_like(i, j, message, true)}
											><Like /></button
										>
										<button on:click={() => handle_like(i, j, message, false)}
											><Dislike /></button
										>
									</div>
								{/if}

								{#if show_copy_button && message && typeof message === "string"}
									<div class="copy-button">
										<Copy value={message} />
									</div>
								{/if}
							</div>
							{#if typeof message === "string"}
								<Markdown
									{message}
									{latex_delimiters}
									{sanitize_html}
									on:load={scroll}
								/>
							{:else if message !== null && message.file.mime_type?.includes("audio")}
								<audio
									data-testid="chatbot-audio"
									controls
									preload="metadata"
									src={message.file.data}
									title={message.alt_text}
									on:play
									on:pause
									on:ended
								/>
							{:else if message !== null && message.file.mime_type?.includes("video")}
								<video
									data-testid="chatbot-video"
									controls
									src={message.file.data}
									title={message.alt_text}
									preload="auto"
									on:play
									on:pause
									on:ended
								>
									<track kind="captions" />
								</video>
							{:else if message !== null && message.file.mime_type?.includes("image")}
								<img
									data-testid="chatbot-image"
									src={message.file.data}
									alt={message.alt_text}
								/>
							{:else if message !== null && message.file.data !== null}
								<a
									data-testid="chatbot-file"
									href={message.file.data}
									target="_blank"
									download={window.__is_colab__
										? null
										: message.file.orig_name || message.file.name}
								>
									{message.file.orig_name || message.file.name}
								</a>
							{/if}
						</div>
					</div>
				{/each}
			{/each}
		{/if}
		{#if pending_message}
			<div class="message pending">
				<div class="dot-flashing" />
				&nbsp;
				<div class="dot-flashing" />
				&nbsp;
				<div class="dot-flashing" />
			</div>
		{/if}
	</div>
</div>

<style>
	.wrap {
		padding: var(--block-padding);
		width: 100%;
		overflow-y: auto;
	}

	.message-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxl);
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
		align-self: flex-start;
		border-width: 1px;
		border-radius: var(--radius-xxl);
		background: var(--background-fill-secondary);
		padding: var(--spacing-xxl);
		padding-right: calc(var(--spacing-xxl) + var(--spacing-md));
		width: calc(100% - var(--spacing-xxl));
		color: var(--body-text-color);
		font-size: var(--text-lg);
		line-height: var(--line-lg);
		overflow-wrap: break-word;
		overflow-x: hidden;
	}
	.message-fit {
		width: fit-content !important;
	}
	.message-fit.user {
		margin-left: auto;
	}
	.user {
		align-self: flex-end;
		border-bottom-right-radius: 0;
	}
	.bot {
		border-bottom-left-radius: 0;
		padding-left: var(--spacing-xxl);
	}

	/* Colors */
	.bot,
	.pending {
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
	}

	@media (max-width: 480px) {
		.user-row {
			align-self: flex-end;
		}

		.bot-row {
			align-self: flex-start;
		}
		.message {
			width: auto;
		}
		.bot {
			padding-left: var(--spacing-xxl);
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
	.user-row > .avatar-container {
		order: 2;
		margin-left: 10px;
	}
	.bot-row > .avatar-container {
		margin-right: 10px;
	}
	img.avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		border-radius: 50%;
	}

	.message-buttons-user,
	.message-buttons-bot {
		display: flex;
		position: relative;
		justify-content: flex-end;
	}
	.message-buttons-bot {
		margin-right: 15px;
	}
	.message-buttons-fit {
		margin-right: 0px;
	}
	.copy-button {
		margin-top: -10px;
		margin-bottom: -10px;
	}
	.share-button {
		position: absolute;
		top: 4px;
		right: 6px;
	}
	.like {
		display: flex;
		height: var(--size-8);
		width: var(--size-8);
		margin-top: -10px;
		margin-bottom: -10px;
	}
	.like button {
		color: var(--body-text-color-subdued);
	}
	.like button:hover,
	button:focus {
		color: var(--body-text-color);
	}

	.selectable {
		cursor: pointer;
	}

	.pending {
		display: flex;
		justify-content: center;
		align-items: center;
		align-self: center;
		gap: 2px;
	}
	.dot-flashing {
		animation: dot-flashing 1s infinite linear alternate;
		border-radius: 5px;
		background-color: var(--body-text-color);
		width: 5px;
		height: 5px;
		color: var(--body-text-color);
	}
	.dot-flashing:nth-child(2) {
		animation-delay: 0.33s;
	}
	.dot-flashing:nth-child(3) {
		animation-delay: 0.66s;
	}

	/* Small screen */
	@media (max-width: 480px) {
		.user {
			align-self: flex-end;
		}
		.bot {
			align-self: flex-start;
			padding-left: var(--size-3);
		}
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

	.hide {
		display: none;
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
