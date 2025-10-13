<svelte:options accessors={true} />

<script context="module" lang="ts">
	export { default as BaseTextbox } from "./shared/Textbox.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio, SelectData, CopyData } from "@gradio/utils";
	import TextBox from "./shared/Textbox.svelte";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { InputHTMLAttributes } from "./shared/types";

	// export let gradio: Gradio<{
	// 	change: string;
	// 	submit: never;
	// 	blur: never;
	// 	select: SelectData;
	// 	input: never;
	// 	focus: never;
	// 	stop: never;
	// 	clear_status: LoadingStatus;
	// 	copy: CopyData;
	// }>;
	// export let label = "Textbox";
	// export let info: string | undefined = undefined;
	// export let elem_id = "";
	// export let elem_classes: string[] = [];
	// export let visible: boolean | "hidden" = true;
	// export let value = "";
	// export let lines: number;
	// export let placeholder = "";
	// export let show_label: boolean;
	// export let max_lines: number | undefined = undefined;
	// export let type: "text" | "password" | "email" = "text";
	// export let container = true;
	// export let scale: number | null = null;
	// export let min_width: number | undefined = undefined;
	// export let submit_btn: string | boolean | null = null;
	// export let stop_btn: string | boolean | null = null;
	// export let show_copy_button = false;
	// export let loading_status: LoadingStatus | undefined = undefined;
	// export let value_is_output = false;
	// export let rtl = false;
	// export let text_align: "left" | "right" | undefined = undefined;
	// export let autofocus = false;
	// export let autoscroll = true;
	// export let interactive: boolean;
	// export let max_length: number | undefined = undefined;
	// export let html_attributes: InputHTMLAttributes | null = null;
	// export let validation_error: string | null = null;

	export function get_value() {
		return _state.value;
	}

	export function set_value(values: Partial<typeof rest>) {
		console.log("textbox -- set_value", values);
		for (const val in values) {
			const _val = val as keyof typeof values;
			_state[_val] = values[_val];
		}
	}

	function handle_change(value: string): void {
		gradio.dispatch("change", value);
	}

	let {
		gradio,
		...rest
	}: {
		gradio: Gradio<{
			change: string;
			submit: never;
			blur: never;
			select: SelectData;
			input: never;
			focus: never;
			stop: never;
			clear_status: LoadingStatus;
			copy: CopyData;
		}>;
		value: string;
		visible: boolean;
		elem_id: string;
		elem_classes: string[];
		scale: number;
		min_width: number;
		container: boolean;
		loading_status: LoadingStatus;
		value_is_output: boolean;
		label: string;
		info: string;
		show_label: boolean;
		lines: number;
		type: "text" | "password" | "email" | undefined;
		rtl: boolean;
		text_align: "right" | "left";
		max_lines: number;
		placeholder: string;
		submit_btn: string;
		stop_btn: string;
		show_copy_button: boolean;
		autofocus: boolean;
		autoscroll: boolean;
		max_length: number;
		html_attributes: InputHTMLAttributes;
		validation_error: string | null;
		interactive: boolean;
	} = $props();

	// const __state = rest;

	let __state = $state.snapshot(rest);
	let _state = $state(__state);

	$inspect(_state);
</script>

<Block
	visible={_state.visible}
	elem_id={_state.elem_id}
	elem_classes={_state.elem_classes}
	scale={_state.scale}
	min_width={_state.min_width}
	allow_overflow={false}
	padding={_state.container}
>
	{#if _state.loading_status}
		<StatusTracker
			autoscroll={gradio.autoscroll}
			i18n={gradio.i18n}
			{..._state.loading_status}
			show_validation_error={false}
			on:clear_status={() =>
				gradio.dispatch("clear_status", _state.loading_status)}
		/>
	{/if}

	<TextBox
		bind:value={_state.value}
		bind:value_is_output={_state.value_is_output}
		label={_state.label}
		info={_state.info}
		show_label={_state.show_label}
		lines={_state.lines}
		type={_state.type}
		rtl={_state.rtl}
		text_align={_state.text_align}
		max_lines={_state.max_lines}
		placeholder={_state.placeholder}
		submit_btn={_state.submit_btn}
		stop_btn={_state.stop_btn}
		show_copy_button={_state.show_copy_button}
		autofocus={_state.autofocus}
		container={_state.container}
		autoscroll={_state.autoscroll}
		max_length={_state.max_length}
		html_attributes={_state.html_attributes}
		validation_error={_state.loading_status?.validation_error ||
			_state.validation_error}
		on:change={(e) => handle_change(e.detail)}
		on:input={() => gradio.dispatch("input")}
		on:submit={() => {
			_state.validation_error = null;
			gradio.dispatch("submit");
		}}
		on:blur={() => gradio.dispatch("blur")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
		on:focus={() => gradio.dispatch("focus")}
		on:stop={() => gradio.dispatch("stop")}
		on:copy={(e) => gradio.dispatch("copy", e.detail)}
		disabled={!_state.interactive}
	/>
</Block>
