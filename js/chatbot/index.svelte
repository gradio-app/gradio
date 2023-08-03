<script lang="ts">
	import Chatbot from "./static";
	import type { LoadingStatus } from "@gradio/statustracker";
	import type { ThemeMode } from "js/app/src/components/types";
	import type { FileData } from "@gradio/upload";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: [string | FileData | null, string | FileData | null][] = [];
	export let latex_delimiters: {
		left: string;
		right: string;
		display: boolean;
	}[];
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let label: string;
	export let show_label = true;
	export let root: string;
	export let root_url: null | string;
	export let selectable = false;
	export let theme_mode: ThemeMode;
	export let show_share_button = false;
	export let rtl = false;

	export let loading_status: LoadingStatus | undefined = undefined;
	export let height = 400;
</script>

<Chatbot
	{elem_id}
	{elem_classes}
	{visible}
	bind:value
	{scale}
	{min_width}
	{label}
	{show_label}
	{root}
	{root_url}
	{selectable}
	{theme_mode}
	{show_share_button}
	{rtl}
	{latex_delimiters}
	on:change
	on:select
	on:share
	on:error
	{loading_status}
	{height}
/>
