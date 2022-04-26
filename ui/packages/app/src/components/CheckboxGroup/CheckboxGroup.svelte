<script lang="ts">
	import { CheckboxGroup } from "@gradio/form";

	export let value: Array<string> = [];
	export let default_value: Array<string> = [];
	export let choices: Array<string>;

	export let mode: "static" | "dynamic";
	export let style: string = "";
	export let label: string = "Checkbox Group";
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	if (default_value) value = default_value;
</script>

<CheckboxGroup
	{form_position}
	bind:value
	{choices}
	{style}
	{label}
	on:change
	disabled={mode === "static"}
/>
