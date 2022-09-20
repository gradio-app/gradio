<script lang="ts">
	import type { Styles } from "@gradio/utils";

	export let style: Styles = {};
	export let elem_id: string;
	export let visible: boolean = true;
	export let variant: "default" | "panel" | "box" = "default";
</script>

<div
	class="flex row w-full flex-wrap gap-4"
	class:gr-group={variant === "box"}
	class:gr-panel={variant === "panel"}
	class:unequal-height={style.equal_height === false}
	class:items-stretch={style.equal_height}
	class:!hidden={!visible}
	id={elem_id}
>
	<slot />
</div>
