<script lang="ts">
	import { Checkbox } from "@gradio/form";

	export let value: boolean = false;
	export let theme: string;
	export let mode: "static" | "dynamic";
</script>

<Checkbox {theme} bind:value on:change disabled={mode === "static"} />
