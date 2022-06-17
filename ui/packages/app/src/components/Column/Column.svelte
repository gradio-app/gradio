<script lang="ts">
	import { create_classes } from "@gradio/utils";

	export let elem_id: string = "";
	export let visible: boolean = true;
	export let variant: "default" | "panel" = "default";
	export let parent: string | null = null;
	export let style: Record<string, unknown> = {};
</script>

<div
	id={elem_id}
	class:bg-gray-50={variant === "panel"}
	class:p-2={variant === "panel"}
	class:rounded-lg={variant === "panel"}
	class="flex flex-col gr-gap gr-form-gap relative col w-full {create_classes(
		style
	)}"
	class:!hidden={!visible}
>
	<slot />
</div>
