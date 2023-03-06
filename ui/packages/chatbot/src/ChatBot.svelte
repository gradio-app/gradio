<script lang="ts">
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import type { Styles } from "@gradio/utils";

	export let value: Array<[string | null, string | null]> | null;
	let old_value: Array<[string | null, string | null]> | null;
	export let pending_message: boolean = false;
	export let root: string;
	export let feedback: Array<string> | null = null;
	export let style: Styles = {};

	let div: HTMLDivElement;
	let autoscroll: Boolean;

	const dispatch = createEventDispatcher<{ change: undefined }>();
	const redirect_src_url = (src: string) =>
		src.replace('src="/file', `src="${root}file`);

	$: _value = value
		? value.map(([user_msg, bot_msg]) => [
				user_msg ? redirect_src_url(user_msg) : null,
				bot_msg ? redirect_src_url(bot_msg) : null
		  ])
		: [];
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
		{#each _value as message, i}
			<div
				data-testid="user"
				class="message user"
				class:hide={message[0] === null}
			>
				{@html message[0]}
			</div>
			<div
				data-testid="bot"
				class="message bot"
				class:hide={message[1] === null}
			>
				{@html message[1]}
				{#if feedback}
					<div class="feedback">
						{#each feedback as f}
							<button>{f}</button>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
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
