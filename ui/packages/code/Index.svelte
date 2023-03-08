<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";

	import type { FileData } from "@gradio/upload";
	// import type { LoadingStatus } from "../StatusTracker/types";

	import Code from "./interactive/Code.svelte";
	// import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Code as CodeIcon, Download, Copy } from "@gradio/icons";
	// import type { Styles } from "@gradio/utils";
	// export let style: Styles = {};

	import Widget from "./interactive/Widgets.svelte";
	const dispatch = createEventDispatcher<{
		change: typeof value;
		stream: typeof value;
		error: string;
	}>();

	export let value: {
		lang: string;
		code: string;
	} = { lang: "", code: "" };

	export let target: HTMLElement;
	export let elem_id: string = "";
	export let visible: boolean = true;
	export let mode: "static" | "dynamic";
	export let source: "microphone" | "upload";
	export let label: string = "Code";
	// export let root: string;
	// export let show_label: boolean;
	// export let pending: boolean;
	// export let streaming: boolean;
	// export let root_url: null | string;

	// export let loading_status: LoadingStatus;
	let dark_mode = target.classList.contains("dark");
</script>

<Block
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={"grey"}
	padding={false}
	{elem_id}
	{visible}
>
	<!-- <StatusTracker {...loading_status} /> -->
	<Widget />

	<BlockLabel Icon={CodeIcon} {label} />

	<Code
		bind:value={value.code}
		lang={value.lang}
		{dark_mode}
		readonly={mode === "static"}
	/>
</Block>

<style>
	:global(.ͼ1.cm-editor) {
		background-color: var(--color-border-secondary);
		padding-top: 25px;
		max-height: 500px;
	}

	:global(.ͼ1.cm-editor:focus-visible) {
		outline: none;
	}

	:global(.ͼ1.cm-editor.cm-focused) {
		outline: none;
	}

	:global(.ͼ1.cm-editor:focus-visible, div) {
		outline: none;
	}
	:global(.ͼ1 .cm-editor, .ͼ1 .cm-gutter) {
		min-height: 150px;
	}
	:global(.ͼ1 .cm-gutters) {
		margin-right: 1px;
		border-right: 1px solid var(--color-border-primary);
		background-color: transparent;
		color: var(--text-color-subdued);
	}
	:global(.ͼ1 .cm-scroller) {
		overflow: auto;
	}
	:global(.ͼ1 .cm-wrap) {
		border: 1px solid silver;
	}

	:global(.cm-selectionBackground) {
		background-color: #b9d2ff30 !important;
	}
</style>
