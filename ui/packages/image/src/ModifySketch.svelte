<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton } from "@gradio/atoms";

	import undo from "./undo.svg";
	import clear from "./clear.svg";

	const dispatch = createEventDispatcher();
</script>

<div class="z-50 top-2 right-2 justify-end flex gap-1 absolute">
	<IconButton
		image={undo}
		alt="undo sketch"
		on:click={() => dispatch("undo")}
	/>
	<IconButton
		image={clear}
		alt="clear sketch"
		on:click={() => dispatch("clear")}
	/>
</div>
