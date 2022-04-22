<script lang="ts">
	import { Checkbox } from "@gradio/form";

	export let value: boolean = false;
	export let default_value: boolean = false;
	export let style: string = "";
	export let label: string = "Checkbox";
	export let mode: "static" | "dynamic";
	export let form_position: "first" | "last" | "mid" | "single" = "single";

	if (default_value) value = default_value;
</script>

<Checkbox
	{form_position}
	{style}
	{label}
	bind:value
	on:change
	disabled={mode === "static"}
/>
