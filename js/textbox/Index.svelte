<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseTextbox } from "./shared/Textbox.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import TextBox from "./shared/Textbox.svelte";
	import StatusTracker from "@gradio/statustracker";
	import { Block } from "@gradio/atoms";
	import { Gradio } from "@gradio/utils";
	import type { TextboxProps, TextboxEvents } from "./types";

	let _props = $props();
	const gradio = new Gradio<TextboxEvents, TextboxProps>(_props);

	let label = $derived(gradio.shared.label || "Textbox");
	// Need to set the value to "" otherwise a change event gets
	// dispatched when the child sets it to ""
	gradio.props.value = gradio.props.value ?? "";
	let old_value = $state(gradio.props.value);

	$effect(() => {
		if (old_value !== gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change", $state.snapshot(gradio.props.value));
		}
	});

	function handle_change(value: string): void {
		if (!gradio.shared || !gradio.props) return;
		gradio.set_data({ validation_error: null });
		gradio.set_data({ value });
	}
</script>

<Block
	visible={gradio.shared.visible}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={false}
	padding={gradio.shared.container}
>
	{#if gradio.shared.loading_status}
		<StatusTracker
			autoscroll={gradio.shared.autoscroll}
			i18n={gradio.i18n}
			{...gradio.shared.loading_status}
			show_validation_error={false}
			on:clear_status={() =>
				gradio.dispatch("clear_status", gradio.shared.loading_status)}
		/>
	{/if}

	<TextBox
		value={gradio.props.value}
		{label}
		info={gradio.props.info}
		show_label={gradio.shared.show_label}
		lines={gradio.props.lines}
		type={gradio.props.type}
		rtl={gradio.props.rtl}
		text_align={gradio.props.text_align}
		max_lines={gradio.props.max_lines}
		placeholder={gradio.props.placeholder}
		submit_btn={gradio.props.submit_btn}
		stop_btn={gradio.props.stop_btn}
		show_copy_button={gradio.props.show_copy_button}
		autofocus={gradio.props.autofocus}
		container={gradio.shared.container}
		autoscroll={gradio.shared.autoscroll}
		max_length={gradio.props.max_length}
		html_attributes={gradio.props.html_attributes}
		validation_error={gradio.shared?.loading_status?.validation_error ||
			gradio.shared?.validation_error}
		on:change={(e) => handle_change(e.detail)}
		on:input={() => gradio.dispatch("input")}
		on:submit={() => {
			gradio.shared.validation_error = null;
			gradio.dispatch("submit");
		}}
		on:blur={() => gradio.dispatch("blur")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
		on:focus={() => gradio.dispatch("focus")}
		on:stop={() => gradio.dispatch("stop")}
		on:copy={(e) => gradio.dispatch("copy", e.detail)}
		disabled={!gradio.shared.interactive}
	/>
</Block>

<!-- bind:value_is_output={gradio.props.value_is_output} -->
