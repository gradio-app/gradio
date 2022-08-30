<script lang="ts">
	import { create_classes } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let scale: number = 1;
	export let min_width: number = 0;
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let variant: "default" | "panel" = "default";
	export let style: Styles = {};
</script>

<div
	id={elem_id}
	class:bg-gray-50={variant === "panel"}
	class:p-2={variant === "panel"}
	class:rounded-lg={variant === "panel"}
	class="overflow-hidden flex flex-col gr-gap gr-form-gap relative col gap-4 {create_classes(
		style
	)}"
	class:!hidden={!visible}
	style={`min-width: min(${min_width}px, 100%); flex-grow: ${scale}`}
>
	<slot />
</div>
