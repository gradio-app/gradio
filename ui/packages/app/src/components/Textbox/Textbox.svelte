<svelte:options accessors={true} />

<script lang="ts">
	import { TextBox } from "@gradio/form";

	export let label: string = "Textbox";
	export let value: string = " ";
	export let default_value: string | false = false;
	export let style: string = "";
	export let lines: number;
	export let placeholder: string = "";
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
</script>

<TextBox
	{form_position}
	bind:value
	{label}
	{style}
	{lines}
	autoheight={mode === "static"}
	{placeholder}
	on:change
	on:submit
	disabled={mode === "static"}
/>
