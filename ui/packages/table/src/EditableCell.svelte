<script lang="ts">
	export let edit: boolean;
	export let value: string | number = "";
	export let el: HTMLInputElement | null;
	export let header: boolean = false;
</script>

{#if edit}
	<input
		class="absolute outline-none inset-2 bg-transparent border-0 translate-x-px flex-1"
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
	on:dblclick
	tabindex="-1"
	role="button"
	class:opacity-0={edit}
	class:pointer-events-none={edit}
	class="p-2  outline-none border-0 flex-1">{value}</span
>
