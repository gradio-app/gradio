<script lang="ts">
	import { Dropdown } from "@gradio/form";
	export let label: string = "";
	export let value: string = "";
	export let theme: string;
	export let choices: Array<string>;
</script>

<Dropdown bind:value {theme} {choices} {label} on:change />
