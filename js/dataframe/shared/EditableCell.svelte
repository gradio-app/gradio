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
	export let max_chars: number | null = null;

	const dispatch = createEventDispatcher();
	let is_expanded = false;

	export let el: HTMLInputElement | null;
	$: _value = value;

	function truncate_text(
		text: string | number,
		max_length: number | null = null
	): string {
		const str = String(text);
		if (!max_length || str.length <= max_length) return str;
		return str.slice(0, max_length) + "...";
	}

	$: display_text = is_expanded
		? value
		: truncate_text(display_value || value, max_chars);

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
			if (edit) {
				value = _value;
				dispatch("blur");
			} else if (!header) {
				is_expanded = !is_expanded;
			}
		}
		dispatch("keydown", event);
	}

	function handle_click(): void {
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
	on:click={handle_click}
	on:keydown={handle_keydown}
	tabindex="0"
	role="button"
	class:edit
	class:expanded={is_expanded}
	class:multiline={header}
	on:focus|preventDefault
	style={styling}
	data-editable={editable}
	placeholder=" "
>
	{#if datatype === "html"}
		{@html display_text}
	{:else if datatype === "markdown"}
		<MarkdownCode
			message={display_text.toLocaleString()}
			{latex_delimiters}
			{line_breaks}
			chatbot={false}
			{root}
		/>
	{:else}
		{editable ? display_text : display_value || display_text}
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
		cursor: text;
	}

	span {
		flex: 1 1 0%;
		position: relative;
		display: inline-block;
		outline: none;
		-webkit-user-select: text;
		-moz-user-select: text;
		-ms-user-select: text;
		user-select: text;
		cursor: text;
		width: 100%;
		height: 100%;
	}

	span.expanded {
		height: auto;
		min-height: 100%;
		white-space: pre-wrap;
		word-break: break-word;
		white-space: normal;
	}

	.multiline {
		white-space: pre-line;
	}

	.header {
		transform: translateX(0);
		font-weight: var(--weight-bold);
		white-space: normal;
		word-break: break-word;
		margin-left: var(--size-1);
	}

	.edit {
		opacity: 0;
		pointer-events: none;
	}
</style>
