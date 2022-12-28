<script lang="ts">
	export let edit: boolean;
	export let value: string | number = "";
	export let el: HTMLInputElement | null;
	export let header: boolean = false;
	export let datatype:
		| "str"
		| "markdown"
		| "html"
		| "number"
		| "bool"
		| "date" = "str";
</script>

{#if edit}
	<input
		class:header
		tabindex="-1"
		bind:value
		bind:this={el}
		on:keydown
		on:blur={({ currentTarget }) =>
			currentTarget.setAttribute("tabindex", "-1")}
	/>
{/if}
<span on:dblclick tabindex="-1" role="button" class:edit>
	{#if datatype === "markdown" || datatype === "html"}
		{@html value}
	{:else}
		{value}
	{/if}
</span>

<style>
	input {
		position: absolute;
		outline: none;
		top: var(--size-2);
		bottom: var(--size-2);
		left: var(--size-2);
		right: var(--size-2);
		background: transparent;
		border: none;
		transform: translateX(-0.1px);
		flex: 1 1 0%;
	}

	span {
		padding: var(--size-2);
		flex: 1 1 0%;
		outline: none;
	}

	.header {
		transform: translateX(0);
		font: var(--weight-bold);
	}

	.edit {
		opacity: 0;
		pointer-events: none;
	}
</style>
