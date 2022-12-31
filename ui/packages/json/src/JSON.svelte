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
		console.log("IS_EMPTY", obj);
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
				class="copy-success ">COPIED</span
			>
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
		font: var(--font-sans);
		display: flex;
		align-items: center;
		position: absolute;
		right: 0;
		top: 0;
		overflow: hidden;
		background: var(--block_label-background);
		border: 1px solid var(--block_label-border-color);
		border-bottom-left-radius: var(--block_label-border-radius);
		border-top: none;
		border-right: none;
		border-bottom-left-radius: var(--block_label-border-radius);
		box-shadow: var(--shadow-drop);
		font-size: var(--scale-000);
		color: var(--color-text-label);
		transition: 150ms;
	}

	.copy-text {
		padding: var(--size-1) var(--size-2);
	}

	.copy-success {
		font-weight: bold;
		color: var(--color-functional-success);
		padding: var(--size-1) var(--size-2);
		position: absolute;
		display: block;
		width: var(--size-full);
		text-align: left;
		background: var(--block_label-background);
	}
</style>
