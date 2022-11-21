<script lang="ts">
	import { get_styles } from "../../utils";
	import type { Styles } from "@gradio/utils";

	export let style: Styles = {};
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let variant: "primary" | "secondary" | "stop" = "secondary";
	export let size: "sm" | "lg" = "lg";

	$: ({ classes } = get_styles(style, ["full_width"]));
</script>

<button
	on:click
	class:!hidden={!visible}
	class="gr-button gr-button-{size} gr-button-{variant}
		{classes}"
	id={elem_id}
>
	<slot />
</button>
