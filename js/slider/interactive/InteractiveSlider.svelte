<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import Slider from "../shared";
	import { Block } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	export let gradio: Gradio<{
		change: never;
		input: never;
		release: number;
	}>;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = 0;
	export let label = gradio.i18n("slider.slider");
	export let info: string | undefined = undefined;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let minimum: number;
	export let maximum: number;
	export let step: number;
	export let show_label: boolean;

	export let loading_status: LoadingStatus;
	export let value_is_output = false;
</script>

<Block {visible} {elem_id} {elem_classes} {container} {scale} {min_width}>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	<Slider
		bind:value
		bind:value_is_output
		{label}
		{info}
		{show_label}
		{minimum}
		{maximum}
		{step}
		on:input={() => gradio.dispatch("input")}
		on:change={() => gradio.dispatch("change")}
		on:release={(e) => gradio.dispatch("release", e.detail)}
	/>
</Block>
