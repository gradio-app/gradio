<script lang="ts">
	import { Number } from "@gradio/form";
	export let value: number = 0;
	export let theme: string;
	export let mode: "static" | "dynamic";
</script>

<Number bind:value {theme} on:change disabled={mode === "static"} />
