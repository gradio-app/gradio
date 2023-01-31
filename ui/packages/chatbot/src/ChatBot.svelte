<script lang="ts">
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import { colors } from "@gradio/theme";
	import type { Styles } from "@gradio/utils";

	export let value: Array<[string, string]> | null;
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

	$: value && dispatch("change");

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
				class:latest={i === _value.length - 1}
				class="message user"
				style={"background-color:" + _colors[0]}
			>
				{@html message[0]}
			</div>
			<div
				data-testid="bot"
				class:latest={i === _value.length - 1}
				class="message bot"
				style={"background-color:" + _colors[1]}
			>
				{@html message[1]}
			</div>
		{/each}
		{#if pending_message}
			<div
				data-testid="bot"
				class="message user pending"
				style={"background-color:" + _colors[0]}
			>
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
		height: var(--size-80);
		overflow-y: auto;
	}

	.message-wrap {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		padding: var(--size-3);
	}

	.message-wrap > * + * {
		margin-top: var(--size-4);
	}
	.message-wrap > div :global(img) {
		border-radius: 13px;
		max-width: 30vw;
	}

	.message {
		border-width: var(--chatbot-border-width);
		border-style: solid;
		border-radius: var(--chatbot-border-radius);
		padding: var(--size-2) var(--size-3);
		font-size: var(--scale-00);
		line-height: var(--line-xs);
	}

	.user {
		border-color: var(--chatbot-user-border-color-base);
		border-bottom-right-radius: 0;
		background: var(--chatbot-user-background-base);
		color: var(--chatbot-user-text-color-base);
	}

	.user.latest {
		border-color: var(--chatbot-user-border-color-latest);
		background: var(--chatbot-user-background-latest);
		color: var(--chatbot-user-text-color-latest);
	}

	.bot {
		place-self: start;
		border-color: var(--chatbot-bot-border-color-base);
		border-bottom-left-radius: 0;
		background: var(--chatbot-bot-background-base);
		color: var(--chatbot-bot-text-color-base);
	}

	.bot.latest {
		border-color: var(--chatbot-bot-border-color-latest);
		background: var(--chatbot-bot-background-latest);
		color: var(--chatbot-bot-text-color-latest);
	}

	.pending {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 2px;
	}
	.dot-flashing {
		animation: dot-flashing 1s infinite linear alternate;
		border-radius: 5px;
		background-color: white;
		width: 5px;
		height: 5px;
		color: white;
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
</style>
