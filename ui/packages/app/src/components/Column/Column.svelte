<script lang="ts">
	import { create_classes } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let variant: "default" | "panel" = "default";
	export let style: Styles = {};

	let calculated_width: string | null = null;
	if (typeof style.width === "number") {
		if (style.width > 1) {
			calculated_width = style.width + "px";
		} else {
			calculated_width = style.width * 100 + "%";
		}
	}
</script>

<div
	id={elem_id}
	class:bg-gray-50={variant === "panel"}
	class:p-2={variant === "panel"}
	class:rounded-lg={variant === "panel"}
	class="overflow-hidden flex flex-col gr-gap gr-form-gap relative col {create_classes(
		style
	)} {calculated_width !== null ? 'flex-initial' : 'flex-1'}"
	class:!hidden={!visible}
	style={calculated_width !== null
		? `flex-basis: ${calculated_width}; width: ${calculated_width}`
		: ""}
>
	<slot />
</div>
