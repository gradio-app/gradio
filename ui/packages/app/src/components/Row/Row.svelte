<script lang="ts">
	import { create_classes } from "@gradio/utils";
	export let parent: string | null = null;
	export let style: Record<string, unknown> = {};

	if (typeof style.mobile_collapse !== "boolean") {
		style.mobile_collapse = true;
	}

	$: console.log(style, $$props);
</script>

<div
	class="flex md:flex-row gr-gap gr-form-gap row w-full {create_classes(style)}"
	class:mobile-row={style.mobile_collapse === false}
	class:unequal-height={style.equal_height === false}
	class:flex-col={style.mobile_collapse}
>
	<slot />
</div>
