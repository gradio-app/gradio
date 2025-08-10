<script lang="ts">
	import Base from "../Base.svelte";
	import "./dataframe.css";
	import { onMount, onDestroy } from "svelte";

	async function requestFullscreenFor(element: Element): Promise<void> {
		const anyEl = element as any;
		if ((element as any).requestFullscreen) {
			await (element as any).requestFullscreen();
			return;
		}
		if (anyEl.webkitRequestFullscreen) {
			anyEl.webkitRequestFullscreen();
		}
	}

	async function exitFullscreenIfActive(): Promise<void> {
		const anyDoc = document as any;
		if (document.fullscreenElement && document.exitFullscreen) {
			await document.exitFullscreen();
			return;
		}
		if (anyDoc.webkitFullscreenElement && anyDoc.webkitExitFullscreen) {
			anyDoc.webkitExitFullscreen();
		}
	}

	function isFullscreenElement(element: Element | null): boolean {
		if (!element) return false;
		const anyDoc = document as any;
		return (
			document.fullscreenElement === element ||
			anyDoc.webkitFullscreenElement === element
		);
	}

	const default_i18n: Record<string, string> = {
		"dataframe.add_row_above": "Add row above",
		"dataframe.add_row_below": "Add row below",
		"dataframe.delete_row": "Delete row",
		"dataframe.add_column_left": "Add column left",
		"dataframe.add_column_right": "Add column right",
		"dataframe.delete_column": "Delete column",
		"dataframe.sort_asc": "Sort ascending",
		"dataframe.sort_desc": "Sort descending",
		"dataframe.sort_ascending": "Sort ascending",
		"dataframe.sort_descending": "Sort descending",
		"dataframe.clear_sort": "Clear sort",
		"dataframe.filter": "Filter",
		"dataframe.clear_filter": "Clear filter",
		"dataframe.copy": "Copy",
		"dataframe.paste": "Paste",
		"dataframe.cut": "Cut",
		"dataframe.select_all": "Select all",
		"dataframe.fullscreen": "Fullscreen",
		"dataframe.exit_fullscreen": "Exit fullscreen",
		"dataframe.search": "Search",
		"dataframe.export": "Export",
		"dataframe.import": "Import",
		"dataframe.edit": "Edit",
		"dataframe.save": "Save",
		"dataframe.cancel": "Cancel",
		"dataframe.confirm": "Confirm",
		"dataframe.reset": "Reset",
		"dataframe.clear": "Clear",
		"dataframe.undo": "Undo",
		"dataframe.redo": "Redo"
	};

	export let value: (string | number)[][] = [];
	export let headers: string[] = [];
	export let datatype: any = "str";
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
	export let components: Record<string, any> = {};
	export let col_count: [number, "fixed" | "dynamic"] = [
		headers.length,
		"dynamic"
	];
	export let row_count: [number, "fixed" | "dynamic"] = [
		value.length,
		"dynamic"
	];
	export let root = "";
	// Standalone default: resolve known dataframe.* tokens to English, else echo key
	export let i18n: (key: string) => string = (key: string) =>
		default_i18n[key] ?? key;
	export let upload = null;
	export let stream_handler = null;
	export let value_is_output = false;
	export let display_value: string[][] | null = null;
	export let styling: string[][] | null = null;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;

	let container: HTMLDivElement;

	async function enter_fullscreen(): Promise<void> {
		if (!container) return;
		await requestFullscreenFor(container);
	}

	async function exit_fullscreen(): Promise<void> {
		await exitFullscreenIfActive();
		fullscreen = false;
	}

	function handle_fullscreen_change(): void {
		fullscreen = isFullscreenElement(container);
	}

	onMount(() => {
		document.addEventListener("fullscreenchange", handle_fullscreen_change);
	});

	onDestroy(() => {
		document.removeEventListener("fullscreenchange", handle_fullscreen_change);
	});
</script>

<div
	class="gradio-dataframe-standalone {elem_classes.join(' ')}"
	class:visible
	id={elem_id}
	bind:this={container}
>
	<Base
		{value}
		{headers}
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
		{components}
		{col_count}
		{row_count}
		{root}
		{i18n}
		{upload}
		{stream_handler}
		{value_is_output}
		{display_value}
		{styling}
		{elem_id}
		{elem_classes}
		{visible}
		on:change
		on:blur
		on:keydown
		on:input
		on:select
		on:fullscreen={({ detail }) => {
			if (detail) {
				void enter_fullscreen();
			} else {
				void exit_fullscreen();
			}
		}}
	/>
</div>

<style>
	.gradio-dataframe-standalone {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}
</style>
