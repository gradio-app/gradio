<script lang="ts">
	import { styleClasses } from "../../utils";

	export let style: Record<string, any> = {};
	export let elem_id: string = "";
	export let variant: "primary" | "secondary" = "secondary";
	export let size: "sm" | "lg" = "lg";
</script>

<button
	on:click
	class={`gr-button gr-button-${size} gr-button-${variant} self-start flex-1` +
		styleClasses(style)}
	id={elem_id}
>
	<slot />
</button>
