<script lang="ts">
	import { create_classes } from "../../utils";

	export let style: Record<string, any> = {};
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
