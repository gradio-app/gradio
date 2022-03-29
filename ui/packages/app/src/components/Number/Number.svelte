<script lang="ts">
	import { Number } from "@gradio/form";
	export let value: number = 0;
	export let default_value: number;

	export let theme: string;
	export let style: string | null;
	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
</script>

<Number
	bind:value
	{theme}
	{style}
	disabled={mode === "static"}
	on:change
	on:submit
/>
