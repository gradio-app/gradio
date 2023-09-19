<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import Radio from "../shared";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let gradio: Gradio<{
		change: never;
		select: SelectData;
		input: never;
	}>;
	export let label = gradio.i18n("radio.radio");
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string | number | null = null;
	export let value_is_output = false;
	export let choices: [string, number][] = [];
	export let show_label: boolean;
	export let container = false;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
</script>

<Block
	{visible}
	type="fieldset"
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	<Radio
		bind:value
		bind:value_is_output
		{label}
		{info}
		{elem_id}
		{show_label}
		{choices}
		disabled
		on:change={() => gradio.dispatch("change")}
		on:input={() => gradio.dispatch("input")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
	/>
</Block>
