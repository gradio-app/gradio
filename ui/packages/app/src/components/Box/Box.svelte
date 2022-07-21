<script lang="ts">
	import { Block } from "@gradio/atoms";
	export let elem_id: string;
	export let visible: boolean = true;
	export let style: Record<string, unknown> = {};

	if (typeof style.mobile_collapse !== "boolean") {
		style.mobile_collapse = true;
	}
</script>

<Block {elem_id} {visible} explicit_call>
	<slot />
</Block>
