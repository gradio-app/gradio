<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import Checkbox from "../shared";
	import { Block, Info } from "@gradio/atoms";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { SelectData } from "@gradio/utils";

	export let gradio: Gradio<{
		change: never;
		select: SelectData;
		input: never;
	}>;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value = false;
	export let value_is_output = false;
	export let label = gradio.i18n("checkbox.checkbox");
	export let info: string | undefined = undefined;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
</script>

<Block {visible} {elem_id} {elem_classes} {container} {scale} {min_width}>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
	/>

	{#if info}
		<Info>{info}</Info>
	{/if}
	<Checkbox
		{label}
		bind:value
		bind:value_is_output
		on:change={() => gradio.dispatch("change")}
		on:input={() => gradio.dispatch("input")}
		on:select={(e) => gradio.dispatch("select", e.detail)}
	/>
</Block>
