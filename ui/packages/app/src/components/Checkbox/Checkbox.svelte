<script lang="ts">
	import { Checkbox } from "@gradio/form";

	export let value: boolean = false;
	export let theme: string;
	export let style: string | null;
	export let mode: "static" | "dynamic";

	if ($$props.default) value = $$props.default;
</script>

<Checkbox {theme} {style} bind:value on:change disabled={mode === "static"} />
