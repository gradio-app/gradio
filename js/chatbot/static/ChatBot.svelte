<script lang="ts">
	import { copy, format_chat_for_sharing } from "../utils";
	import "katex/dist/katex.min.css";
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import { ShareButton } from "@gradio/atoms";
	import type { SelectData } from "@gradio/utils";
	import type { ThemeMode } from "js/app/src/components/types";
	import type { FileData } from "@gradio/upload";
	import Markdown from "./MarkdownCode.svelte";
	import Copy from "./Copy.svelte";

	const code_highlight_css = {
		light: (): Promise<typeof import("prismjs/themes/prism.css")> =>
			import("prismjs/themes/prism.css"),
		dark: (): Promise<typeof import("prismjs/themes/prism.css")> =>
			import("prismjs/themes/prism-dark.css")
	};

	export let value:
		| [string | FileData | null, string | FileData | null][]
		| null;
	let old_value: [string | FileData | null, string | FileData | null][] | null =
		null;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let pending_message = false;
	export let feedback: string[] | null = null;
	export let selectable = false;
	export let show_share_button = false;
	export let theme_mode: ThemeMode;
	export let rtl = false;
	export let show_copy_button = false;

	$: if (theme_mode == "dark") {
		code_highlight_css.dark();
	} else {
		code_highlight_css.light();
	}

	let div: HTMLDivElement;
	let autoscroll: boolean;

	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
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
		message: string | FileData | null
	): void {
		dispatch("select", {
			index: [i, j],
			value: message
		});
	}
</script>

{#if show_share_button && value !== null && value.length > 0}
	<div class="icon-button">
		<ShareButton
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
					<!-- TODO: fix-->
					<!-- svelte-ignore a11y-no-static-element-interactions-->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						data-testid={j == 0 ? "user" : "bot"}
						class:latest={i === value.length - 1}
						class="message {j == 0 ? 'user' : 'bot'}"
						class:hide={message === null}
						class:selectable
						on:click={() => handle_select(i, j, message)}
						dir={rtl ? "rtl" : "ltr"}
					>
						{#if typeof message === "string"}
							<Markdown {message} {latex_delimiters} on:load={scroll} />
							{#if feedback && j == 1}
								<div class="feedback">
									{#each feedback as f}
										<button>{f}</button>
									{/each}
								</div>
							{/if}

							{#if show_copy_button && message}
								<div class="icon-button">
									<Copy value={message} />
								</div>
							{/if}
						{:else if message !== null && message.mime_type?.includes("audio")}
							<audio
								data-testid="chatbot-audio"
								controls
								preload="metadata"
								src={message.data}
								title={message.alt_text}
								on:play
								on:pause
								on:ended
							/>
						{:else if message !== null && message.mime_type?.includes("video")}
							<video
								data-testid="chatbot-video"
								controls
								src={message.data}
								title={message.alt_text}
								preload="auto"
								on:play
								on:pause
								on:ended
							>
								<track kind="captions" />
							</video>
						{:else if message !== null && message.mime_type?.includes("image")}
							<img
								data-testid="chatbot-image"
								src={message.data}
								alt={message.alt_text}
							/>
						{:else if message !== null && message.data !== null}
							<a
								data-testid="chatbot-file"
								href={message.data}
								target="_blank"
								download={window.__is_colab__
									? null
									: message.orig_name || message.name}
							>
								{message.orig_name || message.name}
							</a>
						{/if}
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

	.message-wrap > div :global(img) {
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
		width: calc(100% - var(--spacing-xxl));
		color: var(--body-text-color);
		font-size: var(--text-lg);
		line-height: var(--line-lg);
		overflow-wrap: break-word;
	}
	.user {
		align-self: flex-end;
		border-bottom-right-radius: 0;
	}
	.bot {
		border-bottom-left-radius: 0;
		padding-left: calc(2 * var(--spacing-xxl));
	}
	@media (max-width: 480px) {
		.message {
			width: auto;
		}
		.bot {
			padding-left: var(--spacing-xxl);
		}
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
	.feedback {
		display: flex;
		position: absolute;
		top: var(--spacing-xl);
		right: calc(var(--spacing-xxl) + var(--spacing-xl));
		gap: var(--spacing-lg);
		font-size: var(--text-sm);
	}
	.feedback button {
		color: var(--body-text-color-subdued);
	}
	.feedback button:hover {
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

	/* Code blocks */
	.message-wrap :global(pre[class*="language-"]),
	.message-wrap :global(pre) {
		margin-top: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
		box-shadow: none;
		border: none;
		border-radius: var(--radius-md);
		background-color: var(--chatbot-code-background-color);
		padding: var(--spacing-xl) 10px;
		direction: ltr;
	}
	.message-wrap :global(code) {
		font-size: var(--text-md);
	}

	/* Tables */
	.message-wrap :global(table),
	.message-wrap :global(tr),
	.message-wrap :global(td),
	.message-wrap :global(th) {
		margin-top: var(--spacing-sm);
		margin-bottom: var(--spacing-sm);
		padding: var(--spacing-xl);
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
	.message-wrap :global(code > button) {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		z-index: 1;
		cursor: pointer;
		border-bottom-left-radius: var(--radius-sm);
		padding: 5px;
		padding: var(--spacing-md);
		width: 22px;
		height: 22px;
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

	.icon-button {
		position: absolute;
		top: 6px;
		right: 6px;
	}
</style>
