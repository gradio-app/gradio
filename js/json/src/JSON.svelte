<script lang="ts">
	import { onDestroy } from "svelte";
	import { fade } from "svelte/transition";
	import { JSON as JSONIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import JSONNode from "./JSONNode.svelte";
	import { Copy, Check } from "@gradio/icons";

	export let value: any = {};

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
		{#if copied}
			<span in:fade={{ duration: 300 }}>
				<Check />
			</span>
		{:else}
			<span class="copy-text"><Copy /></span>
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
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--border-color-primary);
		border-top: none;
		border-right: none;
		border-radius: var(--block-label-right-radius);
		background: var(--block-label-background-fill);
		padding: 5px;
		width: 22px;
		height: 22px;
		overflow: hidden;
		color: var(--block-label-text-color);
		font: var(--font);
		font-size: var(--button-small-text-size);
	}
</style>
