<script context="module" lang="ts">
	export { default as BaseCheckbox } from "./shared/Checkbox.svelte";
</script>

<script lang="ts">
	import { Gradio } from "@gradio/utils";
	import { Block, Info } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { CheckboxProps, CheckboxEvents } from "./types";
	import BaseCheckbox from "./shared/Checkbox.svelte";

	let props = $props();
	const gradio = new Gradio<CheckboxEvents, CheckboxProps>(props);
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
>
	<StatusTracker
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		{...gradio.shared.loading_status}
		on:clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
	<BaseCheckbox
		{...gradio.props}
		label={gradio.shared.label}
		interactive={gradio.shared.interactive}
		on_change={() => gradio.dispatch("change")}
		on_input={() => gradio.dispatch("input")}
		on_select={(data) => gradio.dispatch("select", data)}
	/>
	{#if gradio.props.info}
		<Info info={gradio.props.info} />
	{/if}
</Block>
