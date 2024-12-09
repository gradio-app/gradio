<script context="module" lang="ts">
	export { default as BaseStaticHighlightedText } from "./shared/StaticHighlightedtext.svelte";
	export { default as BaseInteractiveHighlightedText } from "./shared/InteractiveHighlightedtext.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData, I18nFormatter } from "@gradio/utils";
	import StaticHighlightedText from "./shared/StaticHighlightedtext.svelte";
	import InteractiveHighlightedText from "./shared/InteractiveHighlightedtext.svelte";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { TextHighlight } from "@gradio/icons";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import { merge_elements } from "./shared/utils";

	export let gradio: Gradio<{
		select: SelectData;
		change: never;
		clear_status: LoadingStatus;
	}>;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: {
		token: string;
		class_or_confidence: string | number | null;
	}[];
	let old_value: typeof value;
	export let show_legend: boolean;
	export let show_inline_category: boolean;
	export let color_map: Record<string, string> = {};
	export let label = gradio.i18n("highlighted_text.highlighted_text");
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let _selectable = false;
	export let combine_adjacent = false;
	export let interactive: boolean;
	export let show_label = true;

	$: if (!color_map && Object.keys(color_map).length) {
		color_map = color_map;
	}

	export let loading_status: LoadingStatus;

	$: {
		if (value !== old_value) {
			old_value = value;
			gradio.dispatch("change");
		}
	}

	$: if (value && combine_adjacent) {
		value = merge_elements(value, "equal");
	}
</script>

{#if !interactive}
	<Block
		variant={"solid"}
		test_id="highlighted-text"
		{visible}
		{elem_id}
		{elem_classes}
		padding={false}
		{container}
		{scale}
		{min_width}
	>
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{...loading_status}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>
		{#if label && show_label}
			<BlockLabel
				Icon={TextHighlight}
				{label}
				float={false}
				disable={container === false}
				{show_label}
			/>
		{/if}

		{#if value}
			<StaticHighlightedText
				on:select={({ detail }) => gradio.dispatch("select", detail)}
				selectable={_selectable}
				{value}
				{show_legend}
				{show_inline_category}
				{color_map}
			/>
		{:else}
			<Empty>
				<TextHighlight />
			</Empty>
		{/if}
	</Block>
{:else}
	<Block
		variant={interactive ? "dashed" : "solid"}
		test_id="highlighted-text"
		{visible}
		{elem_id}
		{elem_classes}
		padding={false}
		{container}
		{scale}
		{min_width}
	>
		<StatusTracker
			autoscroll={gradio.autoscroll}
			{...loading_status}
			i18n={gradio.i18n}
			on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
		/>
		{#if label && show_label}
			<BlockLabel
				Icon={TextHighlight}
				{label}
				float={false}
				disable={container === false}
				{show_label}
			/>
		{/if}

		{#if value}
			<InteractiveHighlightedText
				bind:value
				on:change={() => gradio.dispatch("change")}
				selectable={_selectable}
				{show_legend}
				{color_map}
			/>
		{:else}
			<Empty size="small" unpadded_box={true}>
				<TextHighlight />
			</Empty>
		{/if}
	</Block>
{/if}
