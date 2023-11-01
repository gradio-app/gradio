<script context="module" lang="ts">
	export { default as BaseLabel } from "./shared/Label.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import Label from "./shared/Label.svelte";
	import { LineChart as LabelIcon } from "@gradio/icons";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let gradio: Gradio<{
		change: never;
		select: SelectData;
	}>;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let color: undefined | string = undefined;
	export let value: {
		label?: string;
		confidences?: { label: string; confidence: number }[];
	} = {};
	export let label = gradio.i18n("label.label");
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let show_label = true;
	export let _selectable = false;

	$: ({ confidences, label: _label } = value);
	$: _label, confidences, gradio.dispatch("change");
</script>

<Block
	test_id="label"
	{visible}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
	padding={false}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>
	{#if show_label}
		<BlockLabel Icon={LabelIcon} {label} disable={container === false} />
	{/if}
	{#if _label !== undefined && _label !== null}
		<Label
			on:select={({ detail }) => gradio.dispatch("select", detail)}
			selectable={_selectable}
			{value}
			{color}
		/>
	{:else}
		<Empty unpadded_box={true}><LabelIcon /></Empty>
	{/if}
</Block>
