<script lang="ts">
	import { MarkdownCode } from "@gradio/markdown";

	export let edit: boolean;
	export let value: string | number = "";
	export let header = false;
	export let datatype:
		| "str"
		| "markdown"
		| "html"
		| "number"
		| "bool"
		| "date" = "str";
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];

	export let el: HTMLInputElement | null;
</script>

{#if edit}
	<input
		bind:this={el}
		class:header
		tabindex="-1"
		{value}
		on:keydown
		on:blur={({ currentTarget }) => {
			value = currentTarget.value;
			currentTarget.setAttribute("tabindex", "-1");
		}}
	/>
{/if}

<span on:dblclick tabindex="-1" role="button" class:edit>
	{#if datatype === "html"}
		{@html value}
	{:else if datatype === "markdown"}
		<MarkdownCode
			message={value.toLocaleString()}
			{latex_delimiters}
			chatbot={false}
		/>
	{:else}
		{value}
	{/if}
</span>

<style>
	input {
		position: absolute;
		top: var(--size-2);
		right: var(--size-2);
		bottom: var(--size-2);
		left: var(--size-2);
		flex: 1 1 0%;
		transform: translateX(-0.1px);
		outline: none;
		border: none;
		background: transparent;
	}

	span {
		flex: 1 1 0%;
		outline: none;
		padding: var(--size-2);
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
