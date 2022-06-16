<script lang="ts">
	import { create_classes, get_styles } from "../../utils";
	import type { Styles } from "@gradio/utils";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let variant: "primary" | "secondary" = "secondary";
	export let size: "sm" | "lg" = "lg";

	$: ({ classes } = get_styles(style, [
		"border",
		"full_width",
		"rounded",
		"margin"
	]));
</script>

<button
	on:click
	class="gr-button gr-button-{size} gr-button-{variant} self-start
		{classes}"
	class:hidden={!visible}
	id={elem_id}
>
	<slot />
</button>
