<script lang="ts">
	import { Radio } from "@gradio/form";

	export let value: string;
	export let theme: string;
	export let choices: Array<string>;
</script>

<Radio bind:value {theme} {choices} on:change />
