<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton } from "@gradio/atoms";
	import { Undo, Clear, Erase } from "@gradio/icons";

	const dispatch = createEventDispatcher();

	export let show_eraser = false;
</script>

<div>
	<IconButton Icon={Undo} label="Undo" on:click={() => dispatch("undo")} />

	{#if show_eraser}
		<IconButton
			Icon={Erase}
			label="Clear"
			on:click={(event) => {
				dispatch("clear_mask");
				event.stopPropagation();
			}}
		/>
	{/if}

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
