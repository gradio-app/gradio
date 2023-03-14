<script lang="ts">
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import type { Styles, SelectData } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";

	export let value: Array<
		[string | FileData | null, string | FileData | null]
	> | null;
	let old_value: Array<
		[string | FileData | null, string | FileData | null]
	> | null = null;
	export let pending_message: boolean = false;
	export let feedback: Array<string> | null = null;
	export let style: Styles = {};
	export let selectable: boolean = false;

	let div: HTMLDivElement;
	let autoscroll: Boolean;

	const dispatch = createEventDispatcher<{
		change: undefined;
		select: SelectData;
	}>();

	beforeUpdate(() => {
		autoscroll =
			div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
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
	});

	$: {
		if (value !== old_value) {
			old_value = value;
			dispatch("change");
		}
	}
</script>

<div
	class="wrap"
	style:height={`${style.height}px`}
	style:max-height={`${style.height}px`}
	bind:this={div}
>
	<div class="message-wrap">
		{#if value !== null}
			{#each value as message_pair, i}
				{#each message_pair as message, j}
					<div
						data-testid={j == 0 ? "user" : "bot"}
						class:latest={i === value.length - 1}
						class="message {j == 0 ? 'user' : 'bot'}"
						class:hide={message === null}
						class:selectable
						on:click={() =>
							dispatch("select", { index: [i, j], value: message })}
					>
						{#if typeof message === "string"}
							{@html message}
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
		height: 100%;
		max-height: 480px;
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
		background-color: var(--color-background-secondary);
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
		border-color: var(--color-border-primary);
		background-color: var(--color-background-secondary);
	}
	.user {
		border-color: var(--color-border-accent);
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
		color: var(--text-color-subdued);
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
</style>
