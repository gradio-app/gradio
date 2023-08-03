<script lang="ts">
	import { Block } from "@gradio/atoms";
	export let elem_id: string;
	export let elem_classes: string[];
	export let visible = true;
</script>

<Block {elem_id} {elem_classes} {visible} explicit_call>
	<slot />
</Block>
