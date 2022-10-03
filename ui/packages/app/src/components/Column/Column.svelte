<script lang="ts">
	import { create_classes } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let scale: number = 1;
	export let min_width: number = 0;
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let variant: "default" | "panel" | "box" = "default";
	export let style: Styles = {};
</script>

<div
	id={elem_id}
	class="overflow-hidden flex flex-col relative col {create_classes(style)}"
	class:gap-4={style.gap !== false}
	class:gr-group={variant === "box"}
	class:gr-panel={variant === "panel"}
	class:!hidden={!visible}
	style={`min-width: min(${min_width}px, 100%); flex-grow: ${scale}`}
>
	<slot />
</div>
