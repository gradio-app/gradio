<script lang="ts">
	import { onDestroy } from "svelte";
	import { JSON as JSONIcon } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";
	import JSONNode from "./JSONNode.svelte";
	import { Copy, Check } from "@gradio/icons";

	export let value: any = {};
	export let open = false;
	export let theme_mode: "system" | "light" | "dark" = "system";
	export let show_indices = false;
	export let label_height: number;

	$: json_max_height = `calc(100% - ${label_height}px)`;

	let copied = false;
	let timer: NodeJS.Timeout;

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
			copy_feedback();
		}
	}

	function is_empty(obj: object): boolean {
		return (
			obj &&
			Object.keys(obj).length === 0 &&
			Object.getPrototypeOf(obj) === Object.prototype &&
			JSON.stringify(obj) === JSON.stringify({})
		);
	}

	onDestroy(() => {
		if (timer) clearTimeout(timer);
	});
</script>

{#if value && value !== '""' && !is_empty(value)}
	<button
		on:click={handle_copy}
		title="copy"
		class={copied ? "copied" : "copy-text"}
		aria-roledescription={copied ? "Copied value" : "Copy value"}
		aria-label={copied ? "Copied" : "Copy"}
	>
		{#if copied}
			<Check />
		{:else}
			<Copy />
		{/if}
	</button>
	<div class="json-holder" style:max-height={json_max_height}>
		<JSONNode
			{value}
			depth={0}
			is_root={true}
			{open}
			{theme_mode}
			{show_indices}
		/>
	</div>
{:else}
	<div class="empty-wrapper">
		<Empty>
			<JSONIcon />
		</Empty>
	</div>
{/if}

<style>
	:global(.copied svg) {
		animation: fade ease 300ms;
		animation-fill-mode: forwards;
	}

	@keyframes fade {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	.json-holder {
		padding: var(--size-2);
		overflow-y: auto;
	}

	.empty-wrapper {
		min-height: calc(var(--size-32) - 20px);
		height: 100%;
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
