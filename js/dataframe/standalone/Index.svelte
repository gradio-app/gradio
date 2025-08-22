<script lang="ts">
	import { onMount } from "svelte";
	import Table from "../shared/Table.svelte";
	import type { Datatype, DataframeValue } from "../shared/utils/utils";
	import type { I18nFormatter } from "@gradio/utils";
	import { default_i18n } from "./default_i18n";

	export let i18n: I18nFormatter | undefined = undefined;
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
	export let datatype: Datatype | Datatype[] = "str";
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
	export let col_count: [number, "fixed" | "dynamic"] | undefined = undefined;
	export let row_count: [number, "fixed" | "dynamic"] | undefined = undefined;

	// mirrors default row count and column count logic in dataframe.py
	$: resolved_row_count = (() => {
		if (
			row_count &&
			Array.isArray(row_count) &&
			row_count.length === 2 &&
			typeof row_count[0] === "number" &&
			(row_count[1] === "fixed" || row_count[1] === "dynamic")
		) {
			return row_count as [number, "fixed" | "dynamic"];
		}
		return [1, "dynamic"] as [number, "fixed" | "dynamic"];
	})();
	$: resolved_col_count = (() => {
		if (
			col_count &&
			Array.isArray(col_count) &&
			col_count.length === 2 &&
			typeof col_count[0] === "number" &&
			(col_count[1] === "fixed" || col_count[1] === "dynamic")
		) {
			return col_count as [number, "fixed" | "dynamic"];
		}
		const headerLength =
			value && value.headers && typeof value.headers.length === "number"
				? value.headers.length
				: 3;
		return [headerLength, "dynamic"] as [number, "fixed" | "dynamic"];
	})();
	$: if (
		static_columns &&
		static_columns.length > 0 &&
		resolved_col_count[1] !== "fixed"
	) {
		resolved_col_count = [resolved_col_count[0], "fixed"];
	}

	let root = "";

	onMount(() => {
		const handler = (e: KeyboardEvent): void => {
			if (e.key === "Escape") {
				fullscreen = false;
			}
		};
		window.addEventListener("keydown", handler);
		return () => window.removeEventListener("keydown", handler);
	});
</script>

<div class="gradio-dataframe-standalone" class:fullscreen>
	<Table
		values={value.data}
		headers={value.headers}
		display_value={value?.metadata?.display_value}
		styling={value?.metadata?.styling}
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
		col_count={resolved_col_count}
		row_count={resolved_row_count}
		{root}
		i18n={i18n_fn}
		on:change={(e) => {
			value.data = e.detail.data;
			value.headers = e.detail.headers;
		}}
		on:blur
		on:keydown
		on:input
		on:select
		on:fullscreen={(e) => (fullscreen = e.detail)}
		upload={async () => null}
		stream_handler={() => new EventSource("about:blank")}
	/>
</div>

<style>
	.gradio-dataframe-standalone {
		--gr-df-font-mono: unset;
		--gr-df-font-sans: unset;
		--gr-df-table-bg-even: unset;
		--gr-df-table-bg-odd: unset;
		--gr-df-table-border: unset;
		--gr-df-table-radius: unset;

		--gr-df-table-text: unset;
		--gr-df-accent: unset;
		--gr-df-accent-soft: unset;

		--gr-df-input-background-fill: unset;
		--gr-df-input-background-fill-focus: unset;
		--gr-df-input-background-fill-hover: unset;
		--gr-df-input-border-color: unset;
		--gr-df-input-border-color-focus: unset;
		--gr-df-input-placeholder-color: unset;
		--gr-df-input-radius: unset;
		--gr-df-input-text-size: unset;
		--gr-df-copied-cell-color: unset;

		--gr-df-checkbox-border-color: unset;
		--gr-df-checkbox-background-color: unset;
		--gr-df-checkbox-border-color-focus: unset;
		--gr-df-checkbox-shadow: unset;
		--gr-df-checkbox-border-radius: unset;

		/* Dataframe-scoped defaults (only used as fallbacks) */
		--df-font-mono: var(
			--gr-df-font-mono,
			"IBM Plex Mono",
			ui-monospace,
			Consolas,
			monospace
		);
		--df-font-sans: var(
			--gr-df-font-sans,
			"Source Sans Pro",
			ui-sans-serif,
			system-ui,
			sans-serif
		);
		--df-table-radius: var(--df-radius-sm, 4px);
		--df-border-color-primary: var(--gr-df-table-border, var(--df-neutral-200));
		--df-background-fill-primary: #ffffff;
		--df-background-fill-secondary: #f8fafc;
		--df-color-accent: #7c3aed;
		--df-color-accent-soft: #f3e8ff;
		--df-color-accent-copied: #faf5ff;
		--df-body-text-color: #111827;
		--df-block-background-fill: #ffffff;
		--df-block-radius: var(--df-radius-sm, 4px);
		--df-table-even-background-fill: #ffffff;
		--df-table-odd-background-fill: #f9fafb;
		--df-radius-sm: 4px;
		--df-size-1: 4px;
		--df-size-2: 8px;
		--df-size-4: 16px;
		--df-size-6: 24px;
		--df-size-8: 32px;
		--df-size-12: 48px;
		--df-size-3: 12px;
		--df-size-5: 20px;
		--df-size-7: 28px;
		--df-size-9: 36px;
		--df-size-10: 40px;
		--df-size-11: 44px;
		--df-size-14: 56px;
		--df-size-px: 1px;
		--df-size-full: 100%;
		--df-text-sm: 12px;
		--df-size-0-5: 2px;
		--df-size-1-5: 6px;
		--df-size-2-5: 10px;
		--df-text-md: 14px;
		--df-text-lg: 16px;
		--df-radius-100: 100%;
		--df-radius-xs: 2px;
		--df-radius-sm: 4px;
		--df-radius-md: 6px;
		--df-radius-lg: 8px;
		--df-radius-xl: 12px;
		--df-radius-2xl: 16px;
		--df-radius-3xl: 22px;
		--df-input-text-size: var(--df-text-md, 14px);

		--df-primary-50: #fff7ed;
		--df-primary-100: #ffedd5;
		--df-primary-200: #fed7aa;
		--df-primary-300: #fdba74;
		--df-primary-400: #fb923c;
		--df-primary-500: #f97316;
		--df-primary-600: #ea580c;

		--df-neutral-50: #fafafa;
		--df-neutral-100: #f4f4f5;
		--df-neutral-200: #e4e4e7;
		--df-neutral-300: #d4d4d8;
		--df-neutral-400: #bbbbc2;
		--df-neutral-500: #71717a;
		--df-neutral-600: #52525b;
		--df-neutral-700: #3f3f46;
		--df-neutral-800: #27272a;
		--df-neutral-900: #18181b;
		--df-neutral-950: #0f0f11;

		/* Secondary palette (scoped) */
		--df-secondary-50: #eff6ff;
		--df-secondary-100: #dbeafe;
		--df-secondary-200: #bfdbfe;
		--df-secondary-300: #93c5fd;
		--df-secondary-400: #60a5fa;
		--df-secondary-500: #3b82f6;

		--neutral-50: var(--df-neutral-50, #f9fafb);
		--neutral-100: var(--df-neutral-100, #f3f4f6);
		--neutral-200: var(--df-neutral-200, #e5e7eb);
		--neutral-300: var(--df-neutral-300, #d1d5db);
		--neutral-400: var(--df-neutral-400, #9ca3af);
		--neutral-500: var(--df-neutral-500, #6b7280);
		--neutral-600: var(--df-neutral-600, #4b5563);
		--neutral-700: var(--df-neutral-700, #374151);
		--neutral-800: var(--df-neutral-800, #1f2937);
		--neutral-900: var(--df-neutral-900, #111827);
		--neutral-950: var(--df-neutral-950, #0b0f19);

		--secondary-50: var(--df-secondary-50, #eff6ff);
		--secondary-100: var(--df-secondary-100, #dbeafe);
		--secondary-200: var(--df-secondary-200, #bfdbfe);

		--df-spacing-xxs: 1px;
		--df-spacing-xs: 2px;
		--df-spacing-sm: 4px;
		--df-spacing-md: 6px;
		--df-spacing-lg: 8px;
		--df-spacing-xl: 10px;
		--df-spacing-xxl: 16px;

		--df-radius-xxs: 1px;
		--df-radius-xxl: 22px;

		--df-text-xxs: 9px;
		--df-text-xs: 10px;
		--df-text-xl: 22px;
		--df-text-xxl: 26px;

		--df-body-background-fill: var(
			--df-background-fill-primary,
			var(--background-fill-primary, #ffffff)
		);
		--df-body-text-color: var(--gr-df-table-text, --df-neutral-800);
		--df-body-text-size: var(--df-text-md, 14px);
		--df-body-text-weight: 400;

		--df-color-accent: var(--df-primary-500, #f97316);
		--df-color-accent-soft: var(--df-primary-50, #fff7ed);
		--df-background-fill-primary: white;
		--df-background-fill-secondary: var(--df-neutral-50, #f9fafb);
		--df-border-color-accent: var(--df-primary-300, #fdba74);
		--df-body-text-color-subdued: var(--df-neutral-400, #9ca3af);
		--df-table-text-color: var(--df-body-text-color, #111827);
		--df-shadow-drop: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
		--df-shadow-drop-lg: 0 1px 3px 0 rgb(0 0 0 / 0.1),
			0 1px 2px -1px rgb(0 0 0 / 0.1);
		--df-shadow-inset: rgba(0, 0, 0, 0.05) 0px 2px 4px 0px inset;
		--df-shadow-spread: 3px;

		--df-bw-svt-p-top: 0px;
		--df-bw-svt-p-bottom: 0px;

		--df-border-color-secondary: var(--df-border-color-accent, #fdba74);
		--df-shadow-md: 0 12px 16px -4px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);

		--df-checkbox-border-radius: var(--df-radius-sm, 4px);
		--df-checkbox-shadow: none;
		--df-checkbox-border-color: var(--df-neutral-300, #d4d4d8);
		--df-checkbox-background-color: var(--df-background-fill-primary, #ffffff);
		--df-checkbox-background-color-selected: var(
			--df-color-accent,
			var(--color-accent)
		);
		--df-checkbox-border-color-focus: var(--df-color-accent, #f97316);
		--df-button-transition: none;
		--df-block-background-fill: var(--df-background-fill-primary, white);
		--df-block-border-color: var(
			--df-border-color-primary,
			var(--df-neutral-200, #e5e7eb)
		);
		--df-block-border-width: 1px;
		--df-input-text-size: 0.95rem;
		--df-line-md: 1.5;
		--df-line-lg: 1.75;

		--df-input-background-fill: var(--df-background-fill-primary, #ffffff);
		--df-input-background-fill-focus: var(
			--df-input-background-fill,
			var(--df-background-fill-primary, #ffffff)
		);
		--df-input-background-fill-hover: var(
			--df-input-background-fill,
			var(--df-background-fill-primary, #ffffff)
		);
		--df-input-border-color: var(--df-border-color-primary, #e5e7eb);
		--df-input-border-color-focus: var(--secondary-300, #93c5fd);
		--df-input-border-color-hover: var(
			--df-input-border-color,
			var(--df-border-color-primary, #e5e7eb)
		);
		--df-input-border-width: 1px;
		--df-input-padding: var(--df-spacing-xl, 10px);
		--df-input-placeholder-color: var(--neutral-400, #9ca3af);
		--df-input-radius: var(--df-radius-sm, 4px);
		--df-input-shadow: none;
		--df-input-shadow-focus: 0 0 0 var(--shadow-spread, 3px)
				var(--secondary-50, #eff6ff),
			var(--shadow-inset, rgba(0, 0, 0, 0.05) 0px 2px 4px 0px inset);

		--table-radius: var(--gr-df-table-radius, var(--df-table-radius, 4px));
		--table-row-hover: var(--gr-df-table-row-hover, var(--color-accent-soft));
		--cell-padding: var(--gr-df-cell-padding, var(--size-2));
		--df-font-size: var(--gr-df-font-size, var(--text-md));
		--background-fill-primary: var(--df-background-fill-primary, #ffffff);
		--background-fill-secondary: var(--df-background-fill-secondary, #f8fafc);
		--color-accent: var(--gr-df-accent, var(--df-color-accent, #7c3aed));
		--color-accent-soft: var(
			--gr-df-accent-soft,
			var(--df-color-accent-soft, #f3e8ff)
		);
		--color-accent-copied: var(
			--gr-df-copied-cell-color,
			var(--color-accent-soft)
		);
		--body-text-color: var(--df-body-text-color, #111827);
		--block-background-fill: var(
			--df-block-background-fill,
			var(--background-fill-primary)
		);
		--block-radius: var(--df-block-radius, var(--radius-sm, 4px));
		--table-even-background-fill: var(
			--gr-df-table-bg-even,
			var(--df-table-even-background-fill, #ffffff)
		);
		--table-odd-background-fill: var(
			--gr-df-table-bg-odd,
			var(--df-table-odd-background-fill, #f9fafb)
		);
		--border-color-primary: var(--df-border-color-primary, #e5e7eb);
		--radius-sm: var(--df-radius-sm, 4px);
		--size-1: var(--df-size-1, 4px);
		--size-2: var(--df-size-2, 8px);
		--size-3: var(--df-size-3, 12px);
		--size-4: var(--df-size-4, 16px);
		--size-5: var(--df-size-5, 20px);
		--size-6: var(--df-size-6, 24px);
		--size-7: var(--df-size-7, 28px);
		--size-8: var(--df-size-8, 32px);
		--size-9: var(--df-size-9, 36px);
		--size-10: var(--df-size-10, 40px);
		--size-11: var(--df-size-11, 44px);
		--size-12: var(--df-size-12, 48px);
		--size-14: var(--df-size-14, 56px);
		--size-16: var(--df-size-16, 64px);
		--size-20: var(--df-size-20, 80px);
		--size-24: var(--df-size-24, 96px);

		--size-px: var(--df-size-px, 1px);
		--size-full: var(--df-size-full, 100%);
		--size-0-5: var(--df-size-0-5, 2px);
		--size-1-5: var(--df-size-1-5, 6px);
		--size-2-5: var(--df-size-2-5, 10px);
		--input-text-size: var(--df-input-text-size, 0.95rem);
		--text-sm: var(--df-text-sm, 12px);
		--text-md: var(--df-text-md, 14px);
		--text-lg: var(--df-text-lg, 16px);
		--text-xl: var(--df-text-xl, 22px);
		--text-xxl: var(--df-text-xxl, 26px);

		--spacing-xxs: var(--df-spacing-xxs, 1px);
		--spacing-xs: var(--df-spacing-xs, 2px);
		--spacing-sm: var(--df-spacing-sm, 4px);
		--spacing-md: var(--df-spacing-md, 6px);
		--spacing-lg: var(--df-spacing-lg, 8px);
		--spacing-xl: var(--df-spacing-xl, 10px);
		--spacing-xxl: var(--df-spacing-xxl, 16px);

		--radius-xxs: var(--df-radius-xxs, 1px);
		--radius-xs: var(--df-radius-xs, 2px);
		--radius-sm: var(--df-radius-sm, 4px);
		--radius-md: var(--df-radius-md, 6px);
		--radius-lg: var(--df-radius-lg, 8px);
		--radius-xl: var(--df-radius-xl, 12px);
		--radius-2xl: var(--df-radius-2xl, 16px);
		--radius-3xl: var(--df-radius-3xl, 22px);
		--radius-full: var(--df-radius-full, 9999px);
		--font-mono: var(--df-font-mono, "Courier New", Courier, monospace);
		--font-sans: var(
			--df-font-sans,
			"Source Sans Pro",
			ui-sans-serif,
			system-ui,
			sans-serif
		);

		--input-background-fill: var(
			--gr-df-input-background-fill,
			var(--df-input-background-fill, var(--background-fill-primary, #ffffff))
		);
		--input-background-fill-focus: var(
			--gr-df-input-background-fill-focus,
			var(
				--df-input-background-fill-focus,
				var(--input-background-fill, var(--background-fill-primary, #ffffff))
			)
		);
		--input-background-fill-hover: var(
			--gr-df-input-background-fill-hover,
			var(
				--df-input-background-fill-hover,
				var(--input-background-fill, var(--background-fill-primary, #ffffff))
			)
		);
		--input-border-color: var(
			--gr-df-input-border-color,
			var(--df-input-border-color, var(--border-color-primary, #e5e7eb))
		);
		--input-border-color-focus: var(
			--gr-df-input-border-color-focus,
			var(--df-input-border-color-focus, var(--secondary-300, #93c5fd))
		);
		--input-border-color-hover: var(
			--gr-df-input-border-color-hover,
			var(
				--df-input-border-color-hover,
				var(--input-border-color, var(--border-color-primary, #e5e7eb))
			)
		);
		--input-border-width: var(
			--gr-df-input-border-width,
			var(--df-input-border-width, 1px)
		);

		--weight-bold: var(--df-weight-bold, 700);
		--weight-semibold: var(--df-weight-semibold, 600);
		--checkbox-border-radius: var(
			--gr-df-checkbox-border-radius,
			var(--df-checkbox-border-radius, var(--df-radius-sm, 4px))
		);
		--checkbox-shadow: var(
			--gr-df-checkbox-shadow,
			var(--df-checkbox-shadow, none)
		);
		--checkbox-border-color: var(
			--gr-df-checkbox-border-color,
			var(--df-checkbox-border-color, var(--df-neutral-300, #d4d4d8))
		);
		--checkbox-background-color: var(
			--gr-df-checkbox-background-color,
			var(
				--df-checkbox-background-color,
				var(--df-background-fill-primary, #ffffff)
			)
		);
		--checkbox-background-color-selected: var(
			--gr-df-checkbox-background-color,
			var(--df-checkbox-background-color-selected, var(--color-accent))
		);
		--checkbox-border-color-focus: var(
			--gr-df-checkbox-border-color-focus,
			var(--df-checkbox-border-color-focus, var(--df-color-accent, #f97316))
		);
		--checkbox-check: url("data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e");
		--button-transition: var(--df-button-transition, none);
		--max-height: var(--df-max-height, 500px);
		--df-layer-1: 10;
		--df-layer-2: 20;
		--df-layer-3: 30;
		--df-layer-4: 40;
		--df-layer-5: 50;
		--df-layer-below: -1;
		--df-layer-top: 2147483647;

		--layer-1: var(--df-layer-1, 10);
		--layer-2: var(--df-layer-2, 20);
		--layer-3: var(--df-layer-3, 30);
		--layer-4: var(--df-layer-4, 40);
		--layer-5: var(--df-layer-5, 50);
		--layer-below: var(--df-layer-below, -1);
		--layer-top: var(--df-layer-top, 2147483647);

		--line-md: var(--df-line-md, 1.5);
		--line-lg: var(--df-line-lg, 1.75);

		--shadow-xs: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
		--shadow-sm: 0 4px 6px -2px rgba(0, 0, 0, 0.1),
			0 2px 4px -2px rgba(0, 0, 0, 0.06);
		--shadow-md: 0 12px 16px -4px rgba(0, 0, 0, 0.1),
			0 4px 6px -2px rgba(0, 0, 0, 0.05);
		--shadow-lg: 0 20px 24px -4px rgba(0, 0, 0, 0.1),
			0 8px 8px -4px rgba(0, 0, 0, 0.04);
		--shadow-drop: rgba(0, 0, 0, 0.05) 0px 1px 2px 0px;
		--shadow-drop-lg: 0 1px 3px 0 rgb(0 0 0 / 0.1),
			0 1px 2px -1px rgb(0 0 0 / 0.1);
		--shadow-inset: rgba(0, 0, 0, 0.05) 0px 2px 4px 0px inset;
		--shadow-spread: 3px;
	}

	.gradio-dataframe-standalone.fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 1000;
		overflow: auto;
		border-radius: 0;
		background-color: var(--block-background-fill);
	}

	:global(.gradio-container),
	:global(*),
	:global(::before),
	:global(::after) {
		box-sizing: border-box;
		border-width: 0;
		border-style: solid;
	}

	:global(.gradio-container) :global(textarea) {
		padding-top: var(--input-padding, var(--df-input-padding, 10px));
		padding-bottom: var(--input-padding, var(--df-input-padding, 10px));
		box-sizing: border-box;
	}

	:global(button),
	:global(input),
	:global(select),
	:global(textarea) {
		margin: 0;
		padding: 0;
		color: inherit;
		font-weight: inherit;
		font-size: 100%;
		line-height: inherit;
		font-family: inherit;
	}

	:global([type="text"]),
	:global([type="url"]),
	:global([type="number"]),
	:global([multiple]),
	:global(textarea),
	:global(select) {
		--tw-shadow: 0 0 #0000;
		appearance: none;
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

	:global(button),
	:global(input[type="button"]),
	:global(input[type="submit"]) {
		-webkit-appearance: button;
		appearance: button;
		background-image: none;
		background-color: transparent;
	}

	:global(.sr-only) {
		clip: rect(0, 0, 0, 0);
		position: absolute;
		margin: -1px;
		border-width: 0;
		padding: 0;
		width: 1px;
		height: 1px;
		overflow: hidden;
		white-space: nowrap;
	}

	:global(input[type="checkbox"]) {
		accent-color: var(--color-accent);
	}

	:global(label) {
		display: flex;
		align-items: center;
		transition: all 0.15s ease;
		cursor: pointer;
		/* default label color */
		color: #111111;
		font-weight: 400;
		font-size: 14px;
		line-height: 1.5;
	}

	:global(label) > * + * {
		margin-left: 8px;
	}

	:global(input) {
		--ring-color: transparent;
		position: relative;
		/* default shadow */
		box-shadow: none;
		border: 1px solid #888888;
		border-radius: 6px;
		background-color: #ffffff;
		line-height: 1;
	}

	:global(input:checked),
	:global(input:checked:hover),
	:global(input:checked:focus) {
		/* checked state: orange */
		background-image: none;
		background-color: #f97316;
		border-color: #f97316;
	}

	:global(input:checked:focus) {
		background-image: none;
		background-color: #f97316;
		border-color: #f97316;
	}

	:global(input:hover) {
		border-color: #1e90ff;
		background-color: #e6f0ff;
	}

	:global(input:focus) {
		border-color: #f97316;
		background-color: #fff4e6;
	}

	:global(input[disabled]),
	:global(.disabled) {
		cursor: not-allowed !important;
		opacity: 0.6;
	}

	:global(input:hover) {
		cursor: pointer;
	}
</style>
