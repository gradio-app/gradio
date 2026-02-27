<script module lang="ts">
	export { default as BaseHighlightedText } from "./shared/HighlightedText.svelte";
</script>

<script lang="ts">
	import HighlightedText from "./shared/HighlightedText.svelte";
	import { Block, BlockLabel, Empty, IconButtonWrapper } from "@gradio/atoms";
	import { TextHighlight } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import { Gradio } from "@gradio/utils";
	import { merge_elements } from "./shared/utils";
	import type { HighlightedTextProps, HighlightedTextEvents } from "./types";

	const props = $props();
	const gradio = new Gradio<HighlightedTextEvents, HighlightedTextProps>(props);

	let old_value = $state(gradio.props.value);

	$effect(() => {
		if (old_value !== gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});

	let value = $derived.by(() =>
		gradio.props.combine_adjacent
			? merge_elements(gradio.props.value || [], "equal")
			: gradio.props.value
	);
</script>

<Block
	variant={gradio.shared.interactive ? "dashed" : "solid"}
	test_id="highlighted-text"
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	padding={false}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	rtl={gradio.props.rtl}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		onclearstatus={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>

	{#if gradio.shared.interactive && gradio.shared.label && gradio.shared.show_label && gradio.props.buttons?.length}
		<IconButtonWrapper
			buttons={gradio.props.buttons}
			on_custom_button_click={(id) =>
				gradio.dispatch("custom_button_click", { id })}
		/>
	{/if}

	{#if gradio.shared.label && gradio.shared.show_label}
		<BlockLabel
			Icon={TextHighlight}
			label={gradio.shared.label ||
				gradio.i18n("highlighted_text.highlighted_text")}
			float={false}
			disable={gradio.shared.container === false}
			show_label={gradio.shared.show_label}
			rtl={gradio.props.rtl}
		/>
	{/if}

	{#if value}
		<HighlightedText
			bind:value
			interactive={gradio.shared.interactive}
			show_legend={gradio.props.show_legend}
			show_inline_category={gradio.props.show_inline_category}
			show_whitespaces={gradio.props.show_whitespaces}
			color_map={gradio.props.color_map}
			onselect={(detail) => gradio.dispatch("select", detail)}
			onchange={() => {
				gradio.props.value = value;
				gradio.dispatch("change");
			}}
		/>
	{:else}
		<Empty
			size={gradio.shared.interactive ? "small" : "large"}
			unpadded_box={gradio.shared.interactive}
		>
			<TextHighlight />
		</Empty>
	{/if}
</Block>
