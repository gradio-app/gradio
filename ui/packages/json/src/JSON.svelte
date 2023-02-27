<script lang="ts">
	import { onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { JSON as JSONIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import JSONNode from "./JSONNode.svelte";

	export let value: any = {};
	export let copy_to_clipboard: string = "copy to clipboard";

	let copied = false;
	let timer: NodeJS.Timeout;

	function copy_feedback() {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	async function handle_copy() {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
			copy_feedback();
		}
	}

	function is_empty(obj: object) {
		return (
			obj &&
			Object.keys(obj).length === 0 &&
			Object.getPrototypeOf(obj) === Object.prototype
		);
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

{#if value && value !== '""' && !is_empty(value)}
	<button on:click={handle_copy}>
		<span class="copy-text">{copy_to_clipboard}</span>
		{#if copied}
			<span
				in:fade={{ duration: 100 }}
				out:fade={{ duration: 350 }}
				class="copy-success "
			>
				copied!
			</span>
		{/if}
	</button>

	<JSONNode {value} depth={0} />
{:else}
	<Empty>
		<JSONIcon />
	</Empty>
{/if}

<style>
	button {
		display: flex;
		position: absolute;
		top: 0;
		right: 0;
		align-items: center;
		transition: 150ms;
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--color-border-primary);
		border-top: none;
		border-right: none;
		border-radius: var(--radius-block-label-right);
		background: var(--block-label-background);
		overflow: hidden;
		color: var(--color-text-label);
		font: var(--font-sans);
		font-size: var(--text-xxs);
	}

	.copy-text {
		padding: var(--size-1) var(--size-2);
	}

	.copy-success {
		display: block;
		position: absolute;
		background: var(--block-label-background);
		padding: var(--size-1) var(--size-2);
		width: var(--size-full);
		color: var(--color-functional-success);
		font-weight: bold;
		text-align: left;
	}
</style>
