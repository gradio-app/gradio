<script lang="ts">
	import type { FileData } from "./types";

	import { IconButton } from "@gradio/atoms";

	import edit from "./edit.svg";
	import clear from "./clear.svg";

	import { createEventDispatcher } from "svelte";

	export let editable: boolean = false;
	export let absolute: boolean = true;

	export let style: string | null = "";

	const dispatch = createEventDispatcher<{ edit: FileData; clear: null }>();
</script>

<div
	class="modify-upload z-10 top-2 right-2 justify-end  flex gap-1"
	class:absolute
	class:m-1={!absolute}
>
	{#if editable}
		<IconButton
			image={edit}
			alt="edit image"
			on:click={() => dispatch("edit")}
		/>
	{/if}

	<IconButton
		image={clear}
		alt="clear image"
		on:click={() => dispatch("clear")}
	/>
</div>
