<script lang="ts">
	import type { FileData } from "./types";
	import edit from "./edit.svg";
	import clear from "./clear.svg";

	import { createEventDispatcher } from "svelte";

	export let editable: boolean = false;
	export let theme: string;
	export let absolute = true;

	const dispatch = createEventDispatcher<{ edit: FileData; clear: null }>();
</script>

<div
	class="modify-upload z-10 top-0 right-0 flex justify-end"
	class:absolute
	{theme}
>
	{#if editable}
		<button
			class="edit bg-opacity-30 hover:bg-opacity-100 transition p-1"
			on:click={() => dispatch("edit")}
		>
			<img class="h-4 filter dark:invert" src={edit} alt="Edit" />
		</button>
	{/if}
	<button
		class="clear bg-opacity-30 hover:bg-opacity-100 transition p-1"
		on:click={() => dispatch("clear")}
	>
		<img class="h-4 filter dark:invert" src={clear} alt="Clear" />
	</button>
</div>

<style lang="postcss">
	.modify-upload[theme="default"] {
		@apply m-1 flex gap-1;
	}
	.edit {
		@apply bg-amber-500 dark:bg-red-600 rounded shadow;
	}
	.clear {
		@apply bg-gray-50 dark:bg-gray-500 rounded shadow;
	}
</style>
