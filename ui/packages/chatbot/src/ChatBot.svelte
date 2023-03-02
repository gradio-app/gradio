<script lang="ts">
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import { colors } from "@gradio/theme";
	import type { Styles } from "@gradio/utils";

	export let value: Array<[string | null, string | null]> | null;
	let old_value: Array<[string | null, string | null]> | null;
	export let feedback: Array<string> | null = null; // ["✕", "✓"];
	export let style: Styles = {};
	export let pending_message: boolean = false;

	let div: HTMLDivElement;
	let autoscroll: Boolean;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: _value = value || [];
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

	$: _colors = get_colors();

	function get_color(c: string) {
		if (c in colors) {
			return colors[c as keyof typeof colors].primary;
		} else {
			return c;
		}
	}

	function get_colors() {
		if (!style.color_map) {
			return ["#fb923c", "#9ca3af"];
		} else {
			return [get_color(style.color_map[0]), get_color(style.color_map[1])];
		}
	}
</script>

<div class="wrap" bind:this={div}>
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
		border-radius: var(--radius-xxl);
		background-color: var(--color-background-secondary);
		border-width: 1px;
		padding: var(--spacing-xl) var(--spacing-xxl);
		color: var(--body-text-color);
		font-size: var(--text-lg);
		line-height: var(--line-xs);
		overflow-wrap: break-word;
		width: calc(100% - var(--spacing-xxl));
		align-self: flex-start;
	}
	.user {
		border-bottom-right-radius: 0;
		align-self: flex-end;
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
	.bot, .pending {
		background-color: var(--color-background-secondary);
		border-color: var(--color-border-primary);
	}
	.user {
		background-color: var(--color-accent-soft);
		color: var(--color-accent);
		border-color: var(--color-border-accent);
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
		gap: 2px;
		align-self: center;
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

	.hide {
		display: none;
	}
</style>
