<script lang="ts">
	import { CheckboxGroup } from "@gradio/form";

	export let value: Array<string> = [];
	export let choices: Array<string>;

	export let mode: "static" | "dynamic";
	export let theme: string;
	export let style: string | null;
</script>

<CheckboxGroup
	bind:value
	{choices}
	{theme}
	{style}
	on:change
	disabled={mode === "static"}
/>
