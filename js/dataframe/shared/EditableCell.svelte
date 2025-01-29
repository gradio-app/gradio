<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { MarkdownCode } from "@gradio/markdown-code";

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
	export let line_breaks = true;
	export let editable = true;
	export let root: string;

	const dispatch = createEventDispatcher();
	let is_expanded = false;

	export let el: HTMLInputElement | null;
	$: _value = value;

	function use_focus(node: HTMLInputElement): any {
		if (clear_on_focus) {
			_value = "";
		}

		requestAnimationFrame(() => {
			node.focus();
		});

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

	function handle_keydown(event: KeyboardEvent): void {
		if (event.key === "Enter") {
			value = _value;
			dispatch("blur");
		}
		dispatch("keydown", event);
	}

	function handle_double_click(): void {
		if (!edit && !header) {
			is_expanded = !is_expanded;
		}
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
		on:mousedown|stopPropagation
		on:mouseup|stopPropagation
		on:click|stopPropagation
		use:use_focus
		on:keydown={handle_keydown}
	/>
{/if}

<span
	on:dblclick={handle_double_click}
	tabindex="-1"
	role="button"
	class:edit
	class:expanded={is_expanded}
	on:focus|preventDefault
	style={styling}
	class="table-cell-text"
	data-editable={editable}
	placeholder=" "
>
	{#if datatype === "html"}
		{@html value}
	{:else if datatype === "markdown"}
		<MarkdownCode
			message={value.toLocaleString()}
			{latex_delimiters}
			{line_breaks}
			chatbot={false}
			{root}
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
		transform: translateX(-0.1px);
		outline: none;
		border: none;
		background: transparent;
		cursor: text;
	}

	span {
		position: relative;
		display: inline-block;
		outline: none;
		padding: var(--size-2);
		-webkit-user-select: text;
		-moz-user-select: text;
		-ms-user-select: text;
		user-select: text;
		cursor: text;
		width: 100%;
		height: 100%;
	}

	input:where(:not(.header), [data-editable="true"]) {
		width: calc(100% - var(--size-10));
	}

	span:not(.expanded):not(.header) {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	span.expanded {
		height: auto;
		min-height: 100%;
		white-space: pre-wrap;
		word-break: break-word;
	}

	.header {
		transform: translateX(0);
		font-weight: var(--weight-bold);
		white-space: normal;
		word-break: break-word;
	}

	.edit {
		opacity: 0;
		pointer-events: none;
		position: absolute;
	}
</style>
