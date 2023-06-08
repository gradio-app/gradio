<script lang="ts">
	import { marked, copy } from "./utils";
	import "katex/dist/katex.min.css";
	import DOMPurify from "dompurify";
	import render_math_in_element from "katex/dist/contrib/auto-render.js";
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import type { SelectData } from "@gradio/utils";
	import type { ThemeMode } from "js/app/src/components/types";
	import type { FileData } from "@gradio/upload";

	const code_highlight_css = {
		light: () => import("prismjs/themes/prism.css"),
		dark: () => import("prismjs/themes/prism-dark.css")
	};

	export let value: Array<
		[string | FileData | null, string | FileData | null]
	> | null;
	let old_value: Array<
		[string | FileData | null, string | FileData | null]
	> | null = null;
	export let pending_message: boolean = false;
	export let feedback: Array<string> | null = null;
	export let selectable: boolean = false;
	export let theme_mode: ThemeMode;

	$: if (theme_mode == "dark") {
		code_highlight_css.dark();
	} else {
		code_highlight_css.light();
	}

	let div: HTMLDivElement;
	let autoscroll: Boolean;

	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
	}>();

	beforeUpdate(() => {
		autoscroll =
			div && div.offsetHeight + div.scrollTop > div.scrollHeight - 100;
	});

	afterUpdate(() => {
		if (autoscroll) {
			div.scrollTo(0, div.scrollHeight);
			div.querySelectorAll("img").forEach((n) => {
				n.addEventListener("load", () => {
					div.scrollTo(0, div.scrollHeight);
				});
			});
		}

		render_math_in_element(div, {
			delimiters: [
				{ left: "$$", right: "$$", display: true },
				{ left: "$", right: "$", display: false }
			],
			throwOnError: false
		});
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
	) {
		dispatch("select", {
			index: [i, j],
			value: message
		});
	}
</script>

<div class="wrap" style:max-height="100%" bind:this={div}>
	<div class="message-wrap" use:copy>
		{#if value !== null}
			{#each value as message_pair, i}
				{#each message_pair as message, j}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<div
						data-testid={j == 0 ? "user" : "bot"}
						class:latest={i === value.length - 1}
						class="message {j == 0 ? 'user' : 'bot'}"
						class:hide={message === null}
						class:selectable
						on:click={() => handle_select(i, j, message)}
					>
						{#if typeof message === "string"}
							{@html DOMPurify.sanitize(marked.parse(message))}
							{#if feedback && j == 1}
								<div class="feedback">
									{#each feedback as f}
										<button>{f}</button>
									{/each}
								</div>
							{/if}
						{:else if message !== null && message.mime_type?.includes("audio")}
							<audio
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
							<img src={message.data} alt={message.alt_text} />
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
		border-color: var(--border-color-accent);
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
</style>
