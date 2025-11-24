<script context="module" lang="ts">
	export { default as BaseCode } from "./shared/Code.svelte";
	export { default as BaseCopy } from "./shared/Copy.svelte";
	export { default as BaseDownload } from "./shared/Download.svelte";
	export { default as BaseWidget } from "./shared/Widgets.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import type { CodeProps, CodeEvents } from "./types";
	import { StatusTracker } from "@gradio/statustracker";

	import Code from "./shared/Code.svelte";
	import Widget from "./shared/Widgets.svelte";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { Code as CodeIcon } from "@gradio/icons";

	const props = $props();
	const gradio = new Gradio<CodeEvents, CodeProps>(props);

	let dark_mode = gradio.shared.theme === "dark";

	let label = $derived(gradio.shared.label || gradio.i18n("code.code"));
	let old_value = $state(gradio.props.value);
	let first_change = true;

	$effect(() => {
		if (first_change) {
			first_change = false;
			return;
		}
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});
</script>

<Block
	height={gradio.props.max_lines && "fit-content"}
	variant={"solid"}
	padding={false}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	visible={gradio.shared.visible}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on_clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>

	{#if gradio.shared.show_label}
		<BlockLabel
			Icon={CodeIcon}
			show_label={gradio.shared.show_label}
			{label}
			float={false}
		/>
	{/if}

	{#if !gradio.props.value && !gradio.shared.interactive}
		<Empty unpadded_box={true} size="large">
			<CodeIcon />
		</Empty>
	{:else}
		<Widget language={gradio.props.language} value={gradio.props.value} />

		<Code
			bind:value={gradio.props.value}
			language={gradio.props.language}
			lines={gradio.props.lines}
			max_lines={gradio.props.max_lines}
			{dark_mode}
			wrap_lines={gradio.props.wrap_lines}
			show_line_numbers={gradio.props.show_line_numbers}
			autocomplete={gradio.props.autocomplete}
			readonly={!gradio.shared.interactive}
			on:blur={() => gradio.dispatch("blur")}
			on:focus={() => gradio.dispatch("focus")}
			on:input={() => gradio.dispatch("input")}
		/>
	{/if}
</Block>
