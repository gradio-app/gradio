<script lang="ts">
	import { copy, css_units } from "@gradio/utils";
	import { Copy, Check } from "@gradio/icons";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { IconButton, IconButtonWrapper } from "@gradio/atoms";
	import type { ThemeMode } from "@gradio/core";

	import { MarkdownCode } from "@gradio/markdown-code";

	let {
		elem_classes = [],
		visible = true,
		value,
		min_height = undefined,
		rtl = false,
		sanitize_html = true,
		line_breaks = false,
		latex_delimiters = [],
		header_links = false,
		height = undefined,
		show_copy_button = false,
		loading_status = undefined,
		theme_mode,
		onchange = () => {},
		oncopy = (val) => {}
	}: {
		elem_classes: string[];
		visible: boolean | "hidden";
		value: string;
		min_height: number | string | undefined;
		rtl: boolean;
		sanitize_html: boolean;
		line_breaks: boolean;
		latex_delimiters: {
			left: string;
			right: string;
			display: boolean;
		}[];
		header_links: boolean;
		height: number | string | undefined;
		show_copy_button: boolean | undefined;
		loading_status: LoadingStatus | undefined;
		theme_mode: ThemeMode;
		onchange: () => void;
		oncopy: (val: any) => void;
	} = $props();

	let copied = $state(false);
	let timer: NodeJS.Timeout;

	$effect(() => {
		if (value) {
			onchange();
		}
	});

	async function handle_copy(): Promise<void> {
		if ("clipboard" in navigator) {
			await navigator.clipboard.writeText(value);
			oncopy({ value: value });
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
		{theme_mode}
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
