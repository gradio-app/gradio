<script lang="ts">
	import type { FileData } from "./types";

	import { IconButton } from "@gradio/atoms";
	import { Edit, Clear } from "@gradio/icons";

	import { createEventDispatcher } from "svelte";

	export let editable: boolean = false;
	export let absolute: boolean = true;

	const dispatch = createEventDispatcher<{ edit: FileData; clear: null }>();
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
