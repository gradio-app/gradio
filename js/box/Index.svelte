<script lang="ts">
	import type { Snippet } from "svelte";
	import { Block } from "@gradio/atoms";

	let {
		elem_id,
		elem_classes,
		visible = true,
		children
	}: {
		elem_id: string;
		elem_classes: string[];
		visible?: boolean | "hidden";
		children?: Snippet;
	} = $props();
</script>

<Block {elem_id} {elem_classes} {visible} explicit_call>
	{@render children?.()}
</Block>
