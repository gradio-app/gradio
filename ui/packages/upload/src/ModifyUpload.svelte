<script lang="ts">
	import type { FileData } from "./types";

	import { IconButton } from "@gradio/atoms";
	import { Edit, Clear } from "@gradio/icons";

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
		<IconButton Icon={Edit} on:click={() => dispatch("edit")} />
	{/if}

	<IconButton Icon={Clear} on:click={() => dispatch("clear")} />
</div>
