<script context="module" lang="ts">
	export { default as BaseLabel } from "./shared/Label.svelte";
</script>

<script lang="ts">
	import type { LabelProps, LabelEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import Label from "./shared/Label.svelte";
	import { LineChart as LabelIcon } from "@gradio/icons";
	import { Block, BlockLabel, Empty, IconButtonWrapper } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";

	const props = $props();
	const gradio = new Gradio<LabelEvents, LabelProps>(props);

	let old_value = $state(gradio.props.value);
	let _label = $derived(gradio.props.value.label);

	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});
</script>

<Block
	test_id="label"
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	padding={false}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on_clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
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
			Icon={LabelIcon}
			label={gradio.shared.label || gradio.i18n("label.label")}
			disable={gradio.shared.container === false}
			float={gradio.props.show_heading === true}
		/>
	{/if}
	{#if _label !== undefined && _label !== null}
		<Label
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			selectable={gradio.props._selectable}
			value={gradio.props.value}
			color={gradio.props.color}
			show_heading={gradio.props.show_heading}
		/>
	{:else}
		<Empty unpadded_box={true}><LabelIcon /></Empty>
	{/if}
</Block>
