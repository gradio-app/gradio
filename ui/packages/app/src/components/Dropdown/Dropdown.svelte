<script lang="ts">
	import { Dropdown } from "@gradio/form";
	export let label: string = "";
	export let value: string = "";
	export let theme: string;
	export let style: string | null;
	export let choices: Array<string>;
</script>

<Dropdown bind:value {theme} {style} {choices} {label} on:change />
