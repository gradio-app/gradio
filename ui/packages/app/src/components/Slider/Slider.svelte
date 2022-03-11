<script lang="ts">
	import { Range } from "@gradio/form";

	export let value: number = 0;
	export let theme: string;
	export let minimum: number;
	export let maximum: number;
	export let step: number;
	export let mode: "static" | "dynamic";
</script>

<Range
	bind:value
	{theme}
	{minimum}
	{maximum}
	{step}
	disabled={mode === "static"}
	on:change
/>
