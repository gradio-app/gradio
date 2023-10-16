<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import Number from "../shared";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let gradio: Gradio<{
		change: never;
		input: never;
		submit: never;
		blur: never;
		focus: never;
	}>;
	export let label = gradio.i18n("number.number");
	export let info: string | undefined = undefined;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let value = 0;
	export let show_label: boolean;
	export let minimum: number | undefined = undefined;
	export let maximum: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let value_is_output = false;
	export let step: number | null = null;
</script>

<Block
	{visible}
	{elem_id}
	{elem_classes}
	padding={container}
	allow_overflow={false}
	{scale}
	{min_width}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	<Number
		bind:value
		bind:value_is_output
		{label}
		{info}
		{show_label}
		{minimum}
		{maximum}
		{step}
		{container}
		on:change={() => gradio.dispatch("change")}
		on:input={() => gradio.dispatch("input")}
		on:submit={() => gradio.dispatch("submit")}
		on:blur={() => gradio.dispatch("blur")}
		on:focus={() => gradio.dispatch("focus")}
	/>
</Block>
