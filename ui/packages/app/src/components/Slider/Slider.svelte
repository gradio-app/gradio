<script lang="ts">
	import { Range } from "@gradio/form";

	export let value: number;
	export let theme: string;
	export let minimum: number;
	export let maximum: number;
	export let step: number;
</script>

<Range bind:value {theme} {minimum} {maximum} {step} on:change />
