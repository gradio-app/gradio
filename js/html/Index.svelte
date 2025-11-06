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
	export let apply_default_css = true;

	export let html_template = "${value}";
	export let css_template = "";
	export let js_on_load: string | null = null;

	let _props: Record<string, any> = { value, label, visible, ...props };
	$: _props = { ..._props, ...props, value, label, visible };

	export let loading_status: LoadingStatus;
	export let gradio: Gradio<{
		change: never;
		click: never;
		submit: never;
		clear_status: LoadingStatus;
	}>;
	export let show_label = false;
	export let min_height: number | undefined = undefined;
	export let max_height: number | undefined = undefined;
	export let container = false;
	export let padding = true;
	export let autoscroll = false;

	let old_value = value;
	$: if (JSON.stringify(old_value) !== JSON.stringify(value)) {
		old_value = value;
		gradio.dispatch("change");
	}
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	{container}
	padding={true}
	overflow_behavior="visible"
>
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
			props={_props}
			{html_template}
			{css_template}
			{js_on_load}
			{elem_classes}
			{visible}
			{autoscroll}
			{apply_default_css}
			on:event={(e) => {
				gradio.dispatch(e.detail.type, e.detail.data);
			}}
			on:update_value={(e) => {
				if (e.detail.property === "value") {
					value = e.detail.data;
				} else if (e.detail.property === "label") {
					label = e.detail.data;
				} else if (e.detail.property === "visible") {
					visible = e.detail.data;
				}
			}}
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
