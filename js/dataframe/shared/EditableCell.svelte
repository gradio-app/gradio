<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { MarkdownCode } from "@gradio/markdown";

	export let edit: boolean;
	export let value: string | number = "";
	export let display_value: string | null = null;
	export let styling = "";
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
	export let clear_on_focus = false;
	export let select_on_focus = false;
	export let line_breaks = true;
	export let editable = true;

	const dispatch = createEventDispatcher();

	export let el: HTMLInputElement | null;
	$: _value = value;

	function use_focus(node: HTMLInputElement): any {
		if (clear_on_focus) {
			_value = "";
		}
		if (select_on_focus) {
			node.select();
		}

		node.focus();

		return {};
	}

	function handle_blur({
		currentTarget
	}: Event & {
		currentTarget: HTMLInputElement;
	}): void {
		value = currentTarget.value;
		dispatch("blur");
	}
</script>

{#if edit}
	<input
		role="textbox"
		bind:this={el}
		bind:value={_value}
		class:header
		tabindex="-1"
		on:blur={handle_blur}
		use:use_focus
		on:keydown
	/>
{/if}

<span
	on:dblclick
	tabindex="-1"
	role="button"
	class:edit
	on:focus|preventDefault
	style={styling}
>
	{#if datatype === "html"}
		{@html value}
	{:else if datatype === "markdown"}
		<MarkdownCode
			message={value.toLocaleString()}
			{latex_delimiters}
			{line_breaks}
			chatbot={false}
		/>
	{:else}
		{editable ? value : display_value || value}
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
		-webkit-user-select: text;
		-moz-user-select: text;
		-ms-user-select: text;
		user-select: text;
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
