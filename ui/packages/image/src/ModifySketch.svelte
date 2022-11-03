<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton } from "@gradio/atoms";
	import { Undo, Clear } from "@gradio/icons";

	const dispatch = createEventDispatcher();
</script>

<div class="z-50 top-2 right-2 justify-end flex gap-1 absolute">
	<IconButton Icon={Undo} on:click={() => dispatch("undo")} />
	<IconButton
		Icon={Clear}
		on:click={(event) => {
			dispatch("clear");
			event.stopPropagation();
		}}
	/>
</div>
