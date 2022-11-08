<script lang="ts">
	import { Block } from "@gradio/atoms";
	export let elem_id: string;
	export let visible: boolean = true;
</script>

<Block {elem_id} {visible} explicit_call>
	<slot />
</Block>
