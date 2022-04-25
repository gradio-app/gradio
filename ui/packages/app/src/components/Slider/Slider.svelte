<script lang="ts">
	import { Range } from "@gradio/form";
	import { Block } from "@gradio/atoms";

	export let value: number = 0;

	export let label: string = "Slider";
	export let default_value: number;

	export let style: string = "";
	export let minimum: number;
	export let maximum: number;
	export let step: number;
	export let mode: "static" | "dynamic";
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	export let loading_status: "complete" | "pending" | "error";

	if (default_value) value = default_value;
</script>

<Block {form_position}>
	<Range
		bind:value
		{label}
		{style}
		{minimum}
		{maximum}
		{step}
		disabled={mode === "static"}
		on:change
	/>
</Block>
