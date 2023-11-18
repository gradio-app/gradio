<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { IconButton } from "@gradio/atoms";
	import { Clear, Undo, Redo, Check } from "@gradio/icons";

	/**
	 * Can the current image be undone?
	 */
	export let can_undo = false;
	/**
	 * Can the current image be redone?
	 */
	export let can_redo = false;

	export let can_save = false;
	export let changeable = false;

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
		/**
		 * Save the current image.
		 */
		save: void;
	}>();
</script>

<div class="controls-wrap">
	<div class="row-wrap">
		<IconButton
			disabled={!can_undo}
			Icon={Undo}
			label="Undo"
			on:click={(event) => {
				dispatch("undo");
				event.stopPropagation();
			}}
		/>
		<IconButton
			disabled={!can_redo}
			Icon={Redo}
			label="Redo"
			on:click={(event) => {
				dispatch("redo");
				event.stopPropagation();
			}}
		/>
		<IconButton
			Icon={Clear}
			label="Clear canvas"
			on:click={(event) => {
				dispatch("remove_image");
				event.stopPropagation();
			}}
		/>
	</div>
	{#if changeable}
		<div class="row-wrap save">
			<IconButton
				disabled={!can_save}
				Icon={Check}
				label="Save changes"
				on:click={(event) => {
					dispatch("save");
					event.stopPropagation();
				}}
				background={"var(--color-green-500)"}
				color={"#fff"}
			/>
		</div>
	{/if}
</div>

<style>
	.controls-wrap {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
	}
	.row-wrap {
		display: flex;

		justify-content: flex-end;
		gap: var(--spacing-sm);
		z-index: var(--layer-5);
	}

	.save :global(svg) {
		transform: translateY(1px);
	}
</style>
