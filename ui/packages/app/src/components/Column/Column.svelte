<script lang="ts">
	import { create_classes } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

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
	class="overflow-hidden flex flex-col gr-gap gr-form-gap relative col w-full {create_classes(
		style
	)}"
	class:!hidden={!visible}
>
	<slot />
</div>
