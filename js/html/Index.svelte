<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import HTML from "./shared/HTML.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Code as CodeIcon } from "@gradio/icons";
	import { css_units } from "@gradio/utils";

	export let label = "HTML";
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible: boolean | "hidden" = true;
	export let value = "";
	export let props: Record<string, any> = {};

	export let html_template = "${value}";
	export let css_template = "";
	export let js_on_load: string | null = null;

	let _props: Record<string, any> = props;
	$: _props = { ..._props, ...props };

	$: html = (() => {
		try {
			const templateFunc = new Function('value', ...Object.keys(_props), `return \`${html_template}\`;`);
			return templateFunc(value, ...Object.values(_props));
		} catch (e) {
			console.error('Error evaluating html_template:', e);
			return value;
		}
	})();

	$: css = (() => {
		try {
			const templateFunc = new Function('value', ...Object.keys(_props), `return \`${css_template}\`;`);
			return templateFunc(value, ...Object.values(_props));
		} catch (e) {
			console.error('Error evaluating css_template:', e);
			return '';
		}
	})();

	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: never;
		click: never;
		clear_status: LoadingStatus;
	}>;
	export let show_label = false;
	export let min_height: number | undefined = undefined;
	export let max_height: number | undefined = undefined;
	export let container = false;
	export let padding = true;
	export let autoscroll = false;

	$: value, gradio.dispatch("change");
</script>

<Block {visible} {elem_id} {elem_classes} {container} padding={false}>
	{#if show_label}
		<BlockLabel Icon={CodeIcon} {show_label} {label} float={false} />
	{/if}

	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		variant="center"
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	<div
		class="html-container"
		class:padding
		class:pending={loading_status?.status === "pending"}
		style:min-height={min_height && loading_status?.status !== "pending"
			? css_units(min_height)
			: undefined}
		style:max-height={max_height ? css_units(max_height) : undefined}
	>
		<HTML
			{html}
			{css}
			{js_on_load}
			{elem_classes}
			{visible}
			{autoscroll}
			on:event={(e) => gradio.dispatch(e.detail.type, e.detail.data)}
		/>
	</div>
</Block>

<style>
	.padding {
		padding: var(--block-padding);
	}

	div {
		transition: 150ms;
	}

	.pending {
		opacity: 0.2;
	}
</style>
