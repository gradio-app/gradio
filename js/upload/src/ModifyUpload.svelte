<script lang="ts">
	import { IconButton } from "@gradio/atoms";
	import { Edit, Clear } from "@gradio/icons";

	import { createEventDispatcher } from "svelte";

	export let editable = false;
	export let absolute = true;

	const dispatch = createEventDispatcher<{ edit: never; clear: never }>();
</script>

<div
	class:not-absolute={!absolute}
	style:position={absolute ? "absolute" : "static"}
>
	{#if editable}
		<IconButton Icon={Edit} label="Edit" on:click={() => dispatch("edit")} />
	{/if}

	<IconButton
		Icon={Clear}
		label="Clear"
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
