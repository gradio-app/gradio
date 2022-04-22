<script lang="ts">
	import { Radio } from "@gradio/form";

	export let label: string = "Radio";
	export let value: string = "";
	export let default_value: string;
	export let style: string = "";
	export let choices: Array<string> = [];
	export let mode: "static" | "dynamic";
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	if (default_value) value = default_value;
</script>

<Radio
	{form_position}
	bind:value
	{label}
	{style}
	{choices}
	disabled={mode === "static"}
	on:change
/>
