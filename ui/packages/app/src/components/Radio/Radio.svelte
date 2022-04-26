<script lang="ts">
	import { Radio } from "@gradio/form";

	export let label: string = "Radio";
	export let value: string = "";
	export let style: string = "";
	export let choices: Array<string> = [];
	export let mode: "static" | "dynamic";
</script>

<Radio
	bind:value
	{label}
	{style}
	{choices}
	disabled={mode === "static"}
	on:change
/>
