<script lang="ts">
	import { beforeUpdate, afterUpdate, createEventDispatcher } from "svelte";
	import { colors } from "@gradio/theme";
	import type { Styles } from "@gradio/utils";

	export let value: Array<[string, string]>;
	export let style: Styles = {};

	let div: HTMLDivElement;
	let autoscroll: Boolean;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	beforeUpdate(() => {
		autoscroll =
			div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight);
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
		{#each value as message, i}
			<div
				data-testid="user"
				class:latest={i === value.length - 1}
				class="message user"
				style={"background-color:" + _colors[0]}
			>
				{@html message[0]}
			</div>
			<div
				data-testid="bot"
				class:latest={i === value.length - 1}
				class="message bot"
				style={"background-color:" + _colors[1]}
			>
				{@html message[1]}
			</div>
		{/each}
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
		border-width: var(--internal-border-width);
		border-style: solid;
		border-radius: var(--rounded-xl);
		padding: var(--size-2) var(--size-3);
		font-size: var(--scale-00);
		line-height: var(--line-xs);
	}

	.user {
		border-color: var(--chatbot-user-border-color-base);
		border-bottom-right-radius: 0;
		background: var(--color-accent-light);
		color: var(--chatbot-user-text-color-base);
	}

	.bot {
		place-self: start;
		border-color: var(--chatbot-bot-border-color-base);
		border-bottom-left-radius: 0;
		background: var(--chatbot-bot-background-base);
		color: var(--chatbot-bot-text-color-base);
	}
</style>
