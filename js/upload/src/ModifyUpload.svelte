<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import { Edit, Clear, Undo } from "@gradio/icons";

	import { createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";

	export let editable = false;
	export let undoable = false;
	export let absolute = true;

	const dispatch = createEventDispatcher<{
		edit: never;
		clear: never;
		undo: never;
	}>();
</script>

<div
	class:not-absolute={!absolute}
	style:position={absolute ? "absolute" : "static"}
>
	{#if editable}
		<IconButton
			Icon={Edit}
			label={$_("common.edit")}
			on:click={() => dispatch("edit")}
		/>
	{/if}

	{#if undoable}
		<IconButton
			Icon={Undo}
			label={$_("common.undo")}
			on:click={() => dispatch("undo")}
		/>
	{/if}

	<IconButton
		Icon={Clear}
		label={$_("common.clear")}
		on:click={(event) => {
			dispatch("clear");
			event.stopPropagation();
		}}
	/>
</div>

<style>
	div {
		display: flex;
		top: var(--size-2);
		right: var(--size-2);
		justify-content: flex-end;
		gap: var(--spacing-sm);
		z-index: var(--layer-1);
	}

	.not-absolute {
		margin: var(--size-1);
	}
</style>
