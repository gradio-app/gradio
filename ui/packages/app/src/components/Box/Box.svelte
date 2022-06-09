<script lang="ts">
	import { Block } from "@gradio/atoms";
	import { create_classes } from "@gradio/utils";
	export let parent: string | null = null;
	export let style: Record<string, unknown> = {};

	if (typeof style.mobile_collapse !== "boolean") {
		style.mobile_collapse = true;
	}
</script>

<Block explicit_call>
	<slot />
</Block>
