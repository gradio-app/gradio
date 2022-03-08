<script lang="ts">
	import { Checkbox } from "@gradio/form";
	export let value: boolean;
	export let theme: string;
</script>

<Checkbox {theme} bind:value on:change />
