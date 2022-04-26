<svelte:options accessors={true} />

<script lang="ts">
	import { TextBox } from "@gradio/form";

	export let label: string = "Textbox";
	export let value: string = " ";
	export let style: string = "";
	export let lines: number;
	export let placeholder: string = "";

	export let mode: "static" | "dynamic";
</script>

<TextBox
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
