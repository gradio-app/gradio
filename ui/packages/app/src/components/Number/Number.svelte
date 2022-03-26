<script lang="ts">
	import { Number } from "@gradio/form";
	export let value: number = 0;
	export let theme: string;
	export let style: string | null;
	export let mode: "static" | "dynamic";

	if ($$props.default) value = $$props.default;
</script>

<Number
	bind:value
	{theme}
	{style}
	disabled={mode === "static"}
	on:change
	on:submit
/>
