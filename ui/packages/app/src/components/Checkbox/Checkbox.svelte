<script lang="ts">
	import { Checkbox } from "@gradio/form";

	export let value: boolean = false;
	export let default_value: boolean = false;
	export let style: string = "";
	export let label: string = "Checkbox";
	export let mode: "static" | "dynamic";

	if (default_value) value = default_value;
</script>

<Checkbox {style} {label} bind:value on:change disabled={mode === "static"} />
