<script lang="ts">
	import { Dropdown } from "@gradio/form";
	import { Block } from "@gradio/atoms";
	export let label: string = "Dropdown";
	export let value: string = "";
	export let default_value: string = "";
	export let style: string = "";
	export let choices: Array<string>;
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
</script>

<Block {form_position}>
	<Dropdown
		{form_position}
		bind:value
		{style}
		{choices}
		{label}
		on:change
		disabled={mode === "static"}
	/>
</Block>
