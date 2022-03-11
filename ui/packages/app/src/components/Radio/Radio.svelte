<script lang="ts">
	import { Radio } from "@gradio/form";

	export let value: string = "";
	export let theme: string;
	export let choices: Array<string> = [];
	export let mode: "static" | "dynamic";
</script>

<Radio bind:value {theme} {choices} disabled={mode === "static"} on:change />
