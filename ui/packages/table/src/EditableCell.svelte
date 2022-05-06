<script lang="ts">
	// import { createEventDispatcher } from "svelte";
	export let edit: boolean;
	export let value: string | number = "";
	export let el: HTMLInputElement | null;
	export let header: boolean = false;

	// const dispatch = createEventDispatcher<{ keydown:  KeyboardEvent }>();
</script>

{#if edit}
	<input
		class="absolute flex-1 outline-none inset-2 bg-transparent border-0 translate-x-px"
		class:translate-x-px={!header}
		class:font-bold={header}
		tabindex="-1"
		bind:value
		bind:this={el}
		on:keydown
		on:blur={({ currentTarget }) =>
			currentTarget.setAttribute("tabindex", "-1")}
	/>
{/if}
<span
	tabindex="-1"
	role="button"
	class:opacity-0={edit}
	class="p-2  outline-none border-0">{value}</span
>
