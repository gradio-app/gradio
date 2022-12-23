<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton } from "@gradio/atoms";
	import { Undo, Clear } from "@gradio/icons";

	const dispatch = createEventDispatcher();
</script>

<div>
	<IconButton Icon={Undo} on:click={() => dispatch("undo")} />
	<IconButton
		Icon={Clear}
		on:click={(event) => {
			dispatch("clear");
			event.stopPropagation();
		}}
	/>
</div>

<style>
	div {
		z-index: var(--layer-5);
		top: var(--size-2);
		right: var(--size-2);
		display: flex;
		justify-content: flex-end;
		gap: var(--size-1);
		position: absolute;
	}
</style>
