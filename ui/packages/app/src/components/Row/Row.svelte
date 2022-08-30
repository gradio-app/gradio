<script lang="ts">
	import { create_classes } from "@gradio/utils";
	import type { Styles } from "@gradio/utils";

	export let style: Styles = {};
	export let elem_id: string;
	export let visible: boolean = true;
</script>

<div
	class="flex gr-gap gr-form-gap row gap-4 w-full flex-wrap {create_classes(
		style
	)}"
	class:unequal-height={style.equal_height === false}
	class:!hidden={!visible}
	id={elem_id}
>
	<slot />
</div>
