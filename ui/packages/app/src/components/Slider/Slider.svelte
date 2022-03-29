<script lang="ts">
	import { Range } from "@gradio/form";

	export let value: number = 0;

	export let default_value: number;
	export let theme: string;
	export let style: string | null;
	export let minimum: number;
	export let maximum: number;
	export let step: number;
	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
</script>

<Range
	bind:value
	{theme}
	{style}
	{minimum}
	{maximum}
	{step}
	disabled={mode === "static"}
	on:change
/>
