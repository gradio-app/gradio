<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { copy, css_units } from "@gradio/utils";
	import type { CopyData } from "@gradio/utils";
	import { Copy, Check } from "@gradio/icons";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { IconButton, IconButtonWrapper } from "@gradio/atoms";

	import { MarkdownCode } from "@gradio/markdown-code";

	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string;
	export let min_height: number | string | undefined = undefined;
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
	export let root: string;
	export let loading_status: LoadingStatus | undefined = undefined;

	let copied = false;
	let timer: NodeJS.Timeout;

	const dispatch = createEventDispatcher<{
		change: undefined;
		copy: CopyData;
	}>();

	$: value, dispatch("change");

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			dispatch("copy", { value: value });
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
	class="prose {elem_classes?.join(' ') || ''}"
	class:hide={!visible}
	data-testid="markdown"
	dir={rtl ? "rtl" : "ltr"}
	use:copy
	style={height ? `max-height: ${css_units(height)}; overflow-y: auto;` : ""}
	style:min-height={min_height && loading_status?.status !== "pending"
		? css_units(min_height)
		: undefined}
>
	{#if show_copy_button}
		<IconButtonWrapper>
			<IconButton
				Icon={copied ? Check : Copy}
				on:click={handle_copy}
				label={copied ? "Copied conversation" : "Copy conversation"}
			></IconButton>
		</IconButtonWrapper>
	{/if}
	<MarkdownCode
		message={value}
		{latex_delimiters}
		{sanitize_html}
		{line_breaks}
		chatbot={false}
		{header_links}
		{root}
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

	.hide {
		display: none;
	}
</style>
