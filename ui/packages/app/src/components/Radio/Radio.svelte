<script lang="ts">
	import { Radio } from "@gradio/form";

	export let value: string = "";
	export let default_value: string;
	export let theme: string;
	export let style: string | null;
	export let choices: Array<string> = [];
	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
</script>

<Radio
	bind:value
	{theme}
	{style}
	{choices}
	disabled={mode === "static"}
	on:change
/>
