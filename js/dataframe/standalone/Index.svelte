<script lang="ts">
	/** eslint-disable svelte/valid-compile */
	import Table from "../shared/Table.svelte";
	import type { Datatype, DataframeValue } from "../shared/utils/utils";
	import type { I18nFormatter } from "@gradio/utils";

	export let i18n: I18nFormatter;
	const i18n_fn = (key: string | null | undefined): string => {
		if (!key) return "";
		return i18n[key] ?? key;
	};

	export let value: DataframeValue = {
		data: [["", "", ""]],
		headers: ["1", "2", "3"],
		metadata: null
	};
	export let datatype: Datatype | Datatype[] = [];
	export let editable = true;
	export let show_row_numbers = false;
	export let max_height = 500;
	export let show_search: "none" | "search" | "filter" = "none";
	export let show_copy_button = false;
	export let show_fullscreen_button = false;
	export let wrap = false;
	export let line_breaks = true;
	export let column_widths: string[] = [];
	export let max_chars: number | undefined = undefined;
	export let pinned_columns = 0;
	export let static_columns: (string | number)[] = [];
	export let fullscreen = false;
	export let label: string | null = null;
	export let show_label = true;
	export let latex_delimiters: any[] = [];
	export let col_count: [number, "fixed" | "dynamic"];
	export let row_count: [number, "fixed" | "dynamic"];

	let root = "";
	let elem_id = "";
	let elem_classes: string[] = [];
</script>

<div class="gradio-dataframe-standalone">
	<Table
		values={value.data}
		{datatype}
		{editable}
		{show_row_numbers}
		{max_height}
		{show_search}
		{show_copy_button}
		{show_fullscreen_button}
		{wrap}
		{line_breaks}
		{column_widths}
		{max_chars}
		{pinned_columns}
		{static_columns}
		{fullscreen}
		{label}
		{show_label}
		{latex_delimiters}
		{col_count}
		{row_count}
		{root}
		i18n={i18n_fn}
		on:change
		on:blur
		on:keydown
		on:input
		on:select
		on:fullscreen
		upload={async () => null}
		stream_handler={() => new EventSource("about:blank")}
	/>
</div>

<style>
	.gradio-dataframe-standalone *,
	.gradio-dataframe-standalone *::before,
	.gradio-dataframe-standalone *::after {
		box-sizing: border-box;
		border-width: 0;
		border-style: solid;
	}

	.gradio-dataframe-standalone {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.gradio-dataframe-standalone .sr-only {
		position: absolute !important;
		width: 1px !important;
		height: 1px !important;
		padding: 0 !important;
		margin: -1px !important;
		overflow: hidden !important;
		clip: rect(0, 0, 0, 0) !important;
		white-space: nowrap !important;
		border: 0 !important;
	}

	.gradio-dataframe-standalone hr {
		border-top-width: 1px;
		height: 0;
		color: inherit;
	}
	.gradio-dataframe-standalone blockquote,
	.gradio-dataframe-standalone dl,
	.gradio-dataframe-standalone dd,
	.gradio-dataframe-standalone h1,
	.gradio-dataframe-standalone h2,
	.gradio-dataframe-standalone h3,
	.gradio-dataframe-standalone h4,
	.gradio-dataframe-standalone h5,
	.gradio-dataframe-standalone h6,
	.gradio-dataframe-standalone hr,
	.gradio-dataframe-standalone figure,
	.gradio-dataframe-standalone p,
	.gradio-dataframe-standalone pre {
		margin: 0;
	}

	.gradio-dataframe-standalone fieldset {
		margin: 0;
		padding: 0;
	}

	.gradio-dataframe-standalone legend {
		padding: 0;
	}

	.gradio-dataframe-standalone ol,
	.gradio-dataframe-standalone ul,
	.gradio-dataframe-standalone menu {
		margin: 0;
		padding: 0;
	}

	.gradio-dataframe-standalone textarea {
		resize: vertical;
	}

	.gradio-dataframe-standalone input::placeholder,
	.gradio-dataframe-standalone textarea::placeholder {
		opacity: 1;
		color: var(--color-grey-400, #9ca3af);
	}

	.gradio-dataframe-standalone button,
	.gradio-dataframe-standalone [role="button"] {
		cursor: pointer;
	}

	.gradio-dataframe-standalone :disabled {
		cursor: default;
	}

	.gradio-dataframe-standalone abbr[title] {
		text-decoration: underline dotted;
	}

	.gradio-dataframe-standalone a {
		color: inherit;
		text-decoration: inherit;
	}

	.gradio-dataframe-standalone b,
	.gradio-dataframe-standalone strong {
		font-weight: bolder;
	}

	.gradio-dataframe-standalone code,
	.gradio-dataframe-standalone kbd,
	.gradio-dataframe-standalone samp,
	.gradio-dataframe-standalone pre {
		font-family: monospace, monospace;
	}

	.gradio-dataframe-standalone small {
		font-size: 80%;
	}

	.gradio-dataframe-standalone sub,
	.gradio-dataframe-standalone sup {
		position: relative;
		vertical-align: baseline;
		font-size: 75%;
		line-height: 0;
	}
	.gradio-dataframe-standalone sub {
		bottom: -0.25em;
	}
	.gradio-dataframe-standalone sup {
		top: -0.5em;
	}

	.gradio-dataframe-standalone table {
		border-color: inherit;
		text-indent: 0;
	}

	.gradio-dataframe-standalone button,
	.gradio-dataframe-standalone input,
	.gradio-dataframe-standalone optgroup,
	.gradio-dataframe-standalone select,
	.gradio-dataframe-standalone textarea {
		margin: 0;
		padding: 0;
		color: inherit;
		font-weight: inherit;
		font-size: 100%;
		line-height: inherit;
		font-family: inherit;
	}

	.gradio-dataframe-standalone button,
	.gradio-dataframe-standalone select {
		text-transform: none;
	}

	.gradio-dataframe-standalone button,
	.gradio-dataframe-standalone [type="button"],
	.gradio-dataframe-standalone [type="reset"],
	.gradio-dataframe-standalone [type="submit"] {
		background-image: none;
		background-color: transparent;
	}

	.gradio-dataframe-standalone progress {
		vertical-align: baseline;
	}

	.gradio-dataframe-standalone img {
		display: block;
		vertical-align: middle;
	}

	.gradio-dataframe-standalone img {
		max-width: 100%;
		height: auto;
		margin: 0;
	}

	.gradio-dataframe-standalone [hidden] {
		display: none;
	}

	.gradio-dataframe-standalone :-moz-focusring {
		outline: auto;
	}

	.gradio-dataframe-standalone :-moz-ui-invalid {
		box-shadow: none;
	}

	.gradio-dataframe-standalone progress {
		vertical-align: baseline;
	}

	.gradio-dataframe-standalone ::-webkit-inner-spin-button,
	.gradio-dataframe-standalone ::-webkit-outer-spin-button {
		height: auto;
	}

	.gradio-dataframe-standalone [type="search"] {
		-webkit-appearance: textfield;
		outline-offset: -2px;
	}

	.gradio-dataframe-standalone ::-webkit-search-decoration {
		-webkit-appearance: none;
	}

	.gradio-dataframe-standalone ::-webkit-file-upload-button {
		-webkit-appearance: button;
		font: inherit;
	}
</style>
