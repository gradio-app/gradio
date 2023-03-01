<script lang="ts">
	import { onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { JSON as JSONIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import JSONNode from "./JSONNode.svelte";

	export let value: any = {};
	export let copy_to_clipboard: string = "copy json";

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
	<div class="json-holder">
		<JSONNode {value} depth={0} />
	</div>
{:else}
	<Empty>
		<JSONIcon />
	</Empty>
{/if}

<style>
	.json-holder {
		padding: var(--size-2);
	}
	button {
		display: flex;
		position: absolute;
		top: var(--block-label-margin);
		right: var(--block-label-margin);
		align-items: center;
		transition: 150ms;
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--color-border-primary);
		border-top: none;
		border-right: none;
		border-radius: var(--block-label-right-radius);
		background: var(--block-label-background);
		padding: var(--block-label-padding);
		overflow: hidden;
		color: var(--block-label-color);
		font: var(--font-sans);
		font-size: var(--button-small-text-size);
	}

	.copy-success {
		display: block;
		position: absolute;
		background: var(--block-label-background);
		width: var(--size-full);
		color: var(--functional-success-color);
		text-align: left;
	}
</style>
