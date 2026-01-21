<script context="module" lang="ts">
	export { default as BaseHTML } from "./shared/HTML.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import HTML from "./shared/HTML.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import { Block, BlockLabel, IconButtonWrapper } from "@gradio/atoms";
	import { Code as CodeIcon } from "@gradio/icons";
	import { css_units } from "@gradio/utils";
	import type { HTMLProps, HTMLEvents } from "./types.ts";

	let props = $props();
	const gradio = new Gradio<HTMLEvents, HTMLProps>(props);

	let _props = $derived({
		value: gradio.props.value || "",
		label: gradio.shared.label,
		visible: gradio.shared.visible,
		...gradio.props.props
	});

	let old_value = $state(gradio.props.value);
	$effect(() => {
		if (JSON.stringify(old_value) !== JSON.stringify(gradio.props.value)) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={gradio.shared.container}
	overflow_behavior="visible"
>
	{#if gradio.shared.show_label && gradio.props.buttons && gradio.props.buttons.length > 0}
		<IconButtonWrapper
			buttons={gradio.props.buttons}
			on_custom_button_click={(id) => {
				gradio.dispatch("custom_button_click", { id });
			}}
		/>
	{/if}
	{#if gradio.shared.show_label}
		<BlockLabel
			Icon={CodeIcon}
			show_label={gradio.shared.show_label}
			label={gradio.shared.label}
			float={true}
		/>
	{/if}

	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		variant="center"
		on_clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	<div
		class="html-container"
		class:pending={gradio.shared.loading_status?.status === "pending" &&
			gradio.shared.loading_status?.show_progress !== "hidden"}
		style:min-height={gradio.props.min_height &&
		gradio.shared.loading_status?.status !== "pending"
			? css_units(gradio.props.min_height)
			: undefined}
		style:max-height={gradio.props.max_height
			? css_units(gradio.props.max_height)
			: undefined}
		style:overflow-y={gradio.props.max_height ? "auto" : undefined}
		class:label-padding={gradio.shared.show_label ?? undefined}
	>
		<HTML
			props={_props}
			html_template={gradio.props.html_template}
			css_template={gradio.props.css_template}
			js_on_load={gradio.props.js_on_load}
			elem_classes={gradio.shared.elem_classes}
			visible={gradio.shared.visible}
			autoscroll={gradio.shared.autoscroll}
			apply_default_css={gradio.props.apply_default_css}
			component_class_name={gradio.props.component_class_name}
			on:event={(e) => {
				gradio.dispatch(e.detail.type, e.detail.data);
			}}
			on:update_value={(e) => {
				if (e.detail.property === "value") {
					gradio.props.value = e.detail.data;
				} else if (e.detail.property === "label") {
					gradio.shared.label = e.detail.data;
				} else if (e.detail.property === "visible") {
					gradio.shared.visible = e.detail.data;
				}
			}}
		/>
	</div>
</Block>

<style>
	.html-container {
		padding: var(--block-padding);
	}

	.label-padding {
		padding-top: var(--spacing-xxl);
	}

	div {
		transition: 150ms;
	}

	.pending {
		opacity: 0.2;
	}
</style>
