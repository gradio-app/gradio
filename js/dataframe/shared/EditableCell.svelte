<script lang="ts">
	import { MarkdownCode } from "@gradio/markdown-code";
	import type { I18nFormatter } from "@gradio/utils";
	import type { CellValue } from "./types";
	import SelectionButtons from "./icons/SelectionButtons.svelte";
	import BooleanCell from "./BooleanCell.svelte";

	let {
		edit,
		value = $bindable(""),
		display_value = null,
		styling = "",
		header = false,
		datatype = "str",
		latex_delimiters,
		line_breaks = true,
		editable = true,
		is_static = false,
		max_chars = null,
		components = {},
		i18n,
		is_dragging = false,
		wrap_text = false,
		show_selection_buttons = false,
		coords,
		on_select_column = null,
		on_select_row = null,
		el = $bindable(null),
		onblur,
		onkeydown,
		pad_left = false
	}: {
		edit: boolean;
		value?: CellValue;
		display_value?: string | null;
		styling?: string;
		header?: boolean;
		datatype?:
			| "str"
			| "markdown"
			| "html"
			| "number"
			| "bool"
			| "date"
			| "image";
		latex_delimiters: {
			left: string;
			right: string;
			display: boolean;
		}[];
		line_breaks?: boolean;
		editable?: boolean;
		is_static?: boolean;
		max_chars?: number | null;
		components?: Record<string, any>;
		i18n: I18nFormatter;
		is_dragging?: boolean;
		wrap_text?: boolean;
		show_selection_buttons?: boolean;
		coords: [number, number];
		on_select_column?: ((col: number) => void) | null;
		on_select_row?: ((row: number) => void) | null;
		el?: HTMLTextAreaElement | null;
		onblur?: (detail: {
			blur_event: FocusEvent;
			coords: [number, number];
		}) => void;
		onkeydown?: (event: KeyboardEvent) => void;
		pad_left: boolean;
	} = $props();

	function truncate_text(
		text: CellValue,
		max_length: number | null = null,
		is_image = false
	): string {
		if (is_image) return String(text);
		const str = String(text);
		if (!max_length || max_length <= 0) return str;
		if (str.length <= max_length) return str;
		return str.slice(0, max_length) + "...";
	}

	let should_truncate = $derived(!edit && max_chars !== null && max_chars > 0);

	let display_content = $derived(
		editable ? value : display_value !== null ? display_value : value
	);

	let display_text = $derived(
		should_truncate
			? truncate_text(display_content, max_chars, datatype === "image")
			: display_content
	);

	function use_focus(node: HTMLTextAreaElement): any {
		requestAnimationFrame(() => {
			node.focus();
		});

		return {};
	}

	function handle_blur(event: FocusEvent): void {
		onblur?.({
			blur_event: event,
			coords: coords
		});
	}

	function handle_keydown(event: KeyboardEvent): void {
		onkeydown?.(event);
	}

	function commit_change(checked: boolean): void {
		handle_blur({ target: { value } } as unknown as FocusEvent);
	}

	$effect(() => {
		if (!edit) {
			// Shim blur on removal for Safari and Firefox
			handle_blur({ target: { value } } as unknown as FocusEvent);
		}
	});
</script>

{#if edit && datatype !== "bool"}
	<textarea
		readonly={is_static}
		aria-readonly={is_static}
		aria-label={is_static ? "Cell is read-only" : "Edit cell"}
		bind:this={el}
		bind:value
		class:header
		tabindex="-1"
		onblur={handle_blur}
		onmousedown={(e: MouseEvent) => e.stopPropagation()}
		onclick={(e: MouseEvent) => e.stopPropagation()}
		use:use_focus
		onkeydown={handle_keydown}
		class:pad_left
	/>
{/if}

{#if datatype === "bool" && typeof value === "boolean"}
	<BooleanCell bind:value {editable} on_change={commit_change} />
{:else}
	<span
		class:dragging={is_dragging}
		onkeydown={handle_keydown}
		tabindex="0"
		role="button"
		class:edit
		class:expanded={edit}
		class:multiline={header}
		onfocus={(e) => e.preventDefault()}
		style={styling}
		data-editable={editable}
		data-max-chars={max_chars}
		data-expanded={edit}
		placeholder=" "
		class:text={datatype === "str"}
		class:wrap={wrap_text}
	>
		{#if datatype === "image" && components.image}
			{@const ImageComponent = components.image}
			<ImageComponent
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
			/>
		{:else}
			{display_text}
		{/if}
	</span>
{/if}

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

	textarea {
		position: absolute;
		flex: 1 1 0%;
		transform: translate(0.2px, -0.5px);
		outline: none;
		border: none;
		background: transparent;
		cursor: text;
		width: calc(100% - var(--size-2));
		resize: none;
		height: 100%;
		padding-left: 0;
		font-size: inherit;
		font-weight: inherit;
		line-height: var(--line-lg);
		left: var(--size-2);
		user-select: text;
	}

	textarea:focus {
		outline: none;
	}

	textarea.pad_left {
		margin-left: var(--size-7);
	}

	span {
		flex: 1 1 0%;
		position: relative;
		display: block;
		outline: none;
		cursor: text;
		width: 100%;
		overflow-wrap: break-word;
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
		font-weight: var(--weight-bold);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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

	textarea:read-only {
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
