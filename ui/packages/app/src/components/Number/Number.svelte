<script lang="ts">
	import { Number } from "@gradio/form";

	export let label: string = "Number";
	export let value: number = 0;
	export let default_value: number;
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	export let style: string = "";

	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
</script>

<Number
	{form_position}
	bind:value
	{label}
	{style}
	disabled={mode === "static"}
	on:change
	on:submit
/>
