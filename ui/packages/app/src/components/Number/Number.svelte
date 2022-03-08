<script lang="ts">
	import { Number } from "@gradio/form";
	export let value: number;
	export let theme: string;
</script>

<Number bind:value {theme} on:change />
