<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton } from "@gradio/atoms";
	import { Clear, Undo, Redo } from "@gradio/icons";

	/**
	 * Can the current image be undone?
	 */
	export let can_undo = false;
	/**
	 * Can the current image be redone?
	 */
	export let can_redo = false;

	const dispatch = createEventDispatcher<{
		/**
		 * Remove the current image.
		 */
		remove_image: void;
		/**
		 * Undo the last action.
		 */
		undo: void;
		/**
		 * Redo the last action.
		 */
		redo: void;
	}>();
</script>

<div>
	<IconButton
		disabled={!can_undo}
		Icon={Undo}
		label="Remove Image"
		on:click={(event) => {
			dispatch("undo");
			event.stopPropagation();
		}}
	/>
	<IconButton
		disabled={!can_redo}
		Icon={Redo}
		label="Remove Image"
		on:click={(event) => {
			dispatch("redo");
			event.stopPropagation();
		}}
	/>
	<IconButton
		Icon={Clear}
		label="Remove Image"
		on:click={(event) => {
			dispatch("remove_image");
			event.stopPropagation();
		}}
	/>
</div>

<style>
	div {
		display: flex;
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		justify-content: flex-end;
		gap: var(--spacing-sm);
		z-index: var(--layer-5);
	}
</style>
