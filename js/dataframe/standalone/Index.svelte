<script lang="ts">
	import Table from "../shared/Table.svelte";
	import type { Datatype, DataframeValue } from "../shared/utils/utils";
	import type { I18nFormatter } from "@gradio/utils";
	import { default_i18n } from "./default_i18n";

	export let i18n: I18nFormatter | undefined;
	const i18n_fn = (key: string | null | undefined): string => {
		if (!key) return "";
		if (typeof i18n === "function") return (i18n as any)(key);
		if (i18n && typeof i18n === "object")
			return (i18n as any)[key] ?? default_i18n[key] ?? key;
		return default_i18n[key] ?? key;
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

<!-- for testing / fix this -->
<style global>
	.gradio-dataframe-standalone {
		--table-radius: 8px;
		--border-color-primary: #e5e7eb;
		--background-fill-primary: #ffffff;
		--background-fill-secondary: #f8fafc;
		--color-accent: #7c3aed;
		--color-accent-soft: #f3e8ff;
		--color-accent-copied: #faf5ff;
		--body-text-color: #111827;
		--block-background-fill: #ffffff;
		--table-even-background-fill: #ffffff;
		--table-odd-background-fill: #f9fafb;
		--radius-sm: 6px;
		--size-1: 4px;
		--size-2: 8px;
		--size-4: 16px;
		--size-6: 24px;
		--size-8: 32px;
		--size-12: 48px;
		--input-text-size: 0.95rem;
		--line-md: 1.5;
		--line-lg: 1.75;
	}

	/* Scoped Reset Styles */
	.gradio-dataframe-standalone *,
	.gradio-dataframe-standalone *::before,
	.gradio-dataframe-standalone *::after {
		box-sizing: border-box;
		border-width: 0;
		border-style: solid;
	}

	/* Screen-reader only utility */
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

	a {
		color: inherit;
		text-decoration: inherit;
	}

	b,
	code,
	table {
		border-color: inherit;

		text-indent: 0;
	}

	button,
	input,
	button,
	select {
		text-transform: none;
	}

	button,
	[type="button"],
	[type="reset"],
	[type="submit"] {
		-webkit-appearance: button;
		background-image: none;
		background-color: transparent;
	}

	:-moz-focusring {
		outline: auto;
	}

	:-moz-ui-invalid {
		box-shadow: none;
	}

	::-webkit-inner-spin-button,
	::-webkit-outer-spin-button {
		height: auto;
	}

	[type="search"] {
		-webkit-appearance: textfield;
		outline-offset: -2px;
	}

	::-webkit-search-decoration {
		-webkit-appearance: none;
	}

	::-webkit-file-upload-button {
		-webkit-appearance: button;
		font: inherit;
	}

	textarea {
		resize: vertical;
	}

	input::placeholder,
	textarea::placeholder {
		opacity: 1;
		color: --color-var(--color-grey-400);
	}

	button,
	[role="button"] {
		cursor: pointer;
	}

	:disabled {
		cursor: default;
	}

	img,
	svg,
	video,
	canvas,
	audio,
	iframe,
	embed,
	img,
	[hidden] {
		display: none;
	}

	[type="text"],
	[type="email"],
	[type="url"],
	[type="password"],
	[type="number"],
	[type="date"],
	[type="datetime-local"],
	[type="month"],
	[type="search"],
	[type="tel"],
	[type="time"],
	[type="week"],
	[multiple],
	textarea,
	select {
		border-width: 1px;
		border-color: #6b7280;
		border-radius: 0px;
		background-color: #fff;
		padding-top: 0.5rem;
		padding-right: 0.75rem;
		padding-bottom: 0.5rem;
		padding-left: 0.75rem;
		font-size: 1rem;
		line-height: 1.5rem;
	}

	[type="checkbox"],
	[type="radio"] {
		color-adjust: exact;
		display: inline-block;
		flex-shrink: 0;
		vertical-align: middle;
		appearance: none;
		border-width: 1px;
		background-origin: border-box;

		padding: 0;
		width: 1rem;
		height: 1rem;
		color: #2563eb;
		user-select: none;
	}
	[type="checkbox"]:checked {
		background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
	}

	[type="radio"]:checked {
		background-image: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3ccircle cx='8' cy='8' r='3'/%3e%3c/svg%3e");
	}

	select {
		background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
		background-position: right 0.5rem center;
		background-size: 1.5em 1.5em;
		background-repeat: no-repeat;
		padding-right: 2.5rem;
	}

	[type="checkbox"]:checked,
	[type="radio"]:checked {
		background-position: center;
		background-size: 100% 100%;
		background-repeat: no-repeat;
	}

	[type="checkbox"]:checked:hover,
	[type="checkbox"]:checked:focus,
	[type="radio"]:checked:hover,
	[type="radio"]:checked:focus {
		border-color: transparent;
	}

	[type="checkbox"]:focus-visible,
	[type="checkbox"]:focus-visible,
	[type="radio"]:focus-visible,
	[type="radio"]:focus-visible {
		outline: none;
	}

	:root {
		--font: "Source Sans Pro", ui-sans-serif, system-ui, -apple-system,
			BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial,
			"Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
			"Segoe UI Symbol", "Noto Color Emoji";
		--font-mono: IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Monaco,
			Consolas, "Liberation Mono", "Courier New", monospace;
		--weight-semibold: 600;
		--weight-bold: 700;
		--line-sm: 1.4;
		--line-md: 1.5;
		--line-lg: 1.625;
		--size-1: 4px;
		--size-2: 8px;
		--size-3: 12px;
		--size-4: 16px;
		--size-5: 20px;
		--size-6: 24px;
		--size-8: 32px;
		--size-9: 36px;
		--size-12: 48px;
		--size-full: 100%;
		--size-1-5: 6px;
		--size-2-5: 10px;
		--radius-sm: 4px;
		--layer-1: 10;
		--layer-3: 30;
	}

	/* Typography */
	.prose {
		font-weight: var(--prose-text-weight);
		font-size: var(--text-md);
	}

	.prose * {
		color: var(--body-text-color);
	}

	.prose p {
		margin-bottom: var(--spacing-sm);
		line-height: var(--line-lg);
	}

	/* headings
–––––––––––––––––––––––––––––––––––––––––––––––––– */

	.prose h1,
	.prose h2,
	.prose h3,
	.prose h4,
	.prose h5 {
		margin: var(--spacing-xxl) 0 var(--spacing-lg);
		font-weight: var(--prose-header-text-weight);
		line-height: 1.3;
		color: var(--body-text-color);
	}

	.prose > *:first-child {
		margin-top: 0;
	}

	.prose h1 {
		font-size: var(--text-xxl);
	}

	.prose h2 {
		font-size: var(--text-xl);
	}

	.prose h3 {
		font-size: var(--text-lg);
	}

	.prose h4 {
		font-size: 1.1em;
	}

	.prose h5 {
		font-size: 1.05em;
	}

	/* lists
–––––––––––––––––––––––––––––––––––––––––––––––––– */
	.prose ul {
		list-style: circle inside;
	}
	.prose ol {
		list-style: decimal inside;
	}

	.prose ul > p,
	.prose li > p {
		display: inline;
	}
	.prose ol,
	.prose ul {
		margin-top: 0;
		padding-left: 0;
	}
	.prose ul ul,
	.prose ul ol,
	.prose ol ol,
	.prose ol ul {
		margin: 0.5em 0 0.5em 0em;
		font-size: 90%;
		padding-inline-start: 2em;
	}
	.prose li {
		margin-bottom: 0.5em;
	}

	/* code
–––––––––––––––––––––––––––––––––––––––––––––––––– */

	/* tables
–––––––––––––––––––––––––––––––––––––––––––––––––– */
	.prose th,
	.prose td {
		border-bottom: 1px solid #e1e1e1;
		padding: var(--text-xs) var(--text-md);
		text-align: left;
	}

	/* spacing
–––––––––––––––––––––––––––––––––––––––––––––––––– */
	.prose button,
	.prose .button {
		margin-bottom: var(--spacing-sm);
	}
	.prose input,
	.prose textarea,
	.prose select,
	.prose fieldset {
		margin-bottom: var(--spacing-sm);
	}
	.prose pre,
	.prose blockquote,
	.prose dl,
	.prose figure,
	.prose table,
	.prose p,
	.prose ul,
	.prose ol,
	.prose form {
		margin-bottom: var(--spacing-md);
	}

	.prose table,
	.prose tr,
	.prose td,
	.prose th {
		border: 1px solid var(--body-text-color);
	}
	.prose table {
		border-collapse: collapse;
		margin-bottom: var(--spacing-xxl);
	}

	/* links
–––––––––––––––––––––––––––––––––––––––––––––––––– */
	.prose a {
		color: var(--link-text-color);
		text-decoration: underline;
	}

	.prose a:visited {
		color: var(--link-text-color-visited);
	}

	.prose a:hover {
		color: var(--link-text-color-hover);
	}
	.prose a:active {
		color: var(--link-text-color-active);
	}

	/* misc
–––––––––––––––––––––––––––––––––––––––––––––––––– */

	.prose hr {
		margin-top: 3em;
		margin-bottom: 3.5em;
		border-width: 0;
		border-top: 1px solid #e1e1e1;
	}

	.prose blockquote {
		margin: var(--size-6) 0 !important;
		border-left: 5px solid var(--border-color-primary);
		padding-left: var(--size-2);
	}

	.prose :last-child {
		margin-bottom: 0 !important;
	}

	:root {
		--spacing-xs: 2px;
		--spacing-sm: 4px;
		--radius-sm: 4px;
		--text-sm: 12px;
		--text-lg: 16px;
		--font-mono: "IBM Plex Mono", ui-monospace, Consolas, monospace;
		--body-text-color: var(--neutral-800);
		--color-accent: var(--primary-500);
		--color-accent-soft: var(--primary-50);
		--background-fill-primary: white;
		--background-fill-secondary: var(--neutral-50);
		--border-color-accent: var(--primary-300);
		--border-color-primary: var(--neutral-200);
		--body-text-color-subdued: var(--neutral-400);
		--shadow-drop: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
		--shadow-drop-lg: 0 1px 3px 0 rgb(0 0 0 / 0.1),
			0 1px 2px -1px rgb(0 0 0 / 0.1);
		--block-background-fill: var(--background-fill-primary);
		--block-label-text-color: var(--neutral-500);
		--block-label-text-size: var(--text-sm);
		--block-radius: var(--radius-sm);
		--shadow-inset: rgba(0, 0, 0, 0.05) 0px 2px 4px 0px inset;
		--input-text-size: var(--text-md);
		--table-border-color: var(--neutral-300);
		--table-even-background-fill: white;
		--table-odd-background-fill: var(--neutral-50);
		--table-radius: var(--radius-sm);
		--button-secondary-background-fill: var(--neutral-200);
	}
</style>
