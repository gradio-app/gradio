<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { copy } from "@gradio/utils";
	import { Copy, Check } from "@gradio/icons";

	import MarkdownCode from "./MarkdownCode.svelte";
	import { fade } from "svelte/transition";

	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string;
	export let min_height = false;
	export let rtl = false;
	export let sanitize_html = true;
	export let line_breaks = false;
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let header_links = false;
	export let height: number | string | undefined = undefined;
	export let show_copy_button = false;

	let copied = false;
	let timer: NodeJS.Timeout;

	const dispatch = createEventDispatcher<{ change: undefined }>();

	const css_units = (dimension_value: string | number): string => {
		return typeof dimension_value === "number"
			? dimension_value + "px"
			: dimension_value;
	};

	$: value, dispatch("change");

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			copy_feedback();
		}
	}

	function copy_feedback(): void {
		copied = true;
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			copied = false;
		}, 1000);
	}
</script>

<div
	class:min={min_height}
	class="prose {elem_classes.join(' ')}"
	class:hide={!visible}
	data-testid="markdown"
	dir={rtl ? "rtl" : "ltr"}
	use:copy
	style={height ? `max-height: ${css_units(height)}; overflow-y: auto;` : ""}
>
	{#if show_copy_button}
		{#if copied}
			<button
				in:fade={{ duration: 300 }}
				aria-label="Copied"
				aria-roledescription="Text copied"><Check /></button
			>
		{:else}
			<button
				on:click={handle_copy}
				aria-label="Copy"
				aria-roledescription="Copy text"><Copy /></button
			>
		{/if}
	{/if}
	<MarkdownCode
		message={value}
		{latex_delimiters}
		{sanitize_html}
		{line_breaks}
		chatbot={false}
		{header_links}
	/>
</div>

<style>
	div :global(.math.inline) {
		fill: var(--body-text-color);
		display: inline-block;
		vertical-align: middle;
		padding: var(--size-1-5) -var(--size-1);
		color: var(--body-text-color);
	}

	div :global(.math.inline svg) {
		display: inline;
		margin-bottom: 0.22em;
	}

	div {
		max-width: 100%;
	}

	.min {
		min-height: var(--size-24);
	}
	.hide {
		display: none;
	}

	button {
		display: flex;
		position: absolute;
		top: -10px;
		right: -10px;
		align-items: center;
		box-shadow: var(--shadow-drop);
		border: 1px solid var(--color-border-primary);
		border-top: none;
		border-right: none;
		border-radius: var(--block-label-right-radius);
		background: var(--block-label-background-fill);
		padding: 5px;
		width: 22px;
		height: 22px;
		overflow: hidden;
		color: var(--block-label-color);
		font: var(--font-sans);
		font-size: var(--button-small-text-size);
	}
</style>
