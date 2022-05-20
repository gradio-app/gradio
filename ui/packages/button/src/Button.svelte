<script lang="ts">
	import { create_classes } from "../../utils";
	import type { Styles } from "@gradio/utils";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let variant: "primary" | "secondary" = "secondary";
	export let size: "sm" | "lg" = "lg";
</script>

<button
	on:click
	class={`gr-button gr-button-${size} gr-button-${variant} self-start` +
		create_classes(style)}
	id={elem_id}
>
	<slot />
</button>
