<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { MarkdownCode } from "@gradio/markdown-code";
	import type { I18nFormatter } from "@gradio/utils";
	import SelectionButtons from "./icons/SelectionButtons.svelte";
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
		| "date"
		| "image" = "str";
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let line_breaks = true;
	export let editable = true;
	export let is_static = false;
	export let root: string;
	export let max_chars: number | null = null;
	export let components: Record<string, any> = {};
	export let i18n: I18nFormatter;
	export let is_dragging = false;
	export let wrap_text = false;

	export let show_selection_buttons = false;
	export let coords: [number, number];
	export let on_select_column: ((col: number) => void) | null = null;
	export let on_select_row: ((row: number) => void) | null = null;

	const dispatch = createEventDispatcher<{
		blur: { blur_event: FocusEvent; coords: [number, number] };
		keydown: KeyboardEvent;
	}>();

	let is_expanded = false;

	export let el: HTMLInputElement | null;

	function truncate_text(
		text: string | number,
		max_length: number | null = null,
		is_image = false
	): string {
		if (is_image) return String(text);
		const str = String(text);
		if (!max_length || max_length <= 0) return str;
		if (str.length <= max_length) return str;
		return str.slice(0, max_length) + "...";
	}

	$: should_truncate =
		!edit && !is_expanded && max_chars !== null && max_chars > 0;

	$: display_content = editable
		? value
		: display_value !== null
			? display_value
			: value;

	$: display_text = should_truncate
		? truncate_text(display_content, max_chars, datatype === "image")
		: display_content;

	function use_focus(node: HTMLInputElement): any {
		requestAnimationFrame(() => {
			node.focus();
		});

		return {};
	}

	function handle_blur(event: FocusEvent): void {
		dispatch("blur", {
			blur_event: event,
			coords: coords
		});
	}

	function handle_keydown(event: KeyboardEvent): void {
		if (event.key === "Enter") {
			if (!header) {
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
		readonly={is_static}
		aria-readonly={is_static}
		role="textbox"
		aria-label={is_static ? "Cell is read-only" : "Edit cell"}
		bind:this={el}
		bind:value
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
	class:dragging={is_dragging}
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
	data-max-chars={max_chars}
	data-expanded={is_expanded}
	placeholder=" "
	class:text={datatype === "str"}
	class:wrap={wrap_text}
>
	{#if datatype === "image" && components.image}
		<svelte:component
			this={components.image}
			value={{ url: display_text }}
			show_label={false}
			label="cell-image"
			show_download_button={false}
			{i18n}
			gradio={{ dispatch: () => {} }}
		/>
	{:else if datatype === "html"}
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
		{display_text}
	{/if}
</span>
{#if show_selection_buttons && coords && on_select_column && on_select_row}
	<SelectionButtons
		position="column"
		{coords}
		on_click={() => on_select_column(coords[1])}
	/>
	<SelectionButtons
		position="row"
		{coords}
		on_click={() => on_select_row(coords[0])}
	/>
{/if}

<style>
	.dragging {
		cursor: crosshair !important;
	}

	input {
		position: absolute;
		flex: 1 1 0%;
		transform: translateX(-0.1px);
		outline: none;
		border: none;
		background: transparent;
		cursor: text;
		width: calc(100% - var(--size-2));
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
		overflow: hidden;
	}

	span.text.expanded {
		height: auto;
		min-height: 100%;
		white-space: pre-wrap;
		word-break: break-word;
		overflow: visible;
	}

	.multiline {
		white-space: pre;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.header {
		transform: translateX(0);
		font-weight: var(--weight-bold);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-left: var(--size-1);
	}

	.edit {
		opacity: 0;
		pointer-events: none;
	}

	span :global(img) {
		max-height: 100px;
		width: auto;
		object-fit: contain;
	}

	input:read-only {
		cursor: not-allowed;
	}

	.wrap,
	.wrap.expanded {
		white-space: normal;
		word-wrap: break-word;
		overflow-wrap: break-word;
		word-wrap: break-word;
	}
</style>
