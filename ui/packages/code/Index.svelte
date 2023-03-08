<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { _ } from "svelte-i18n";

	import type { FileData } from "@gradio/upload";
	// import type { LoadingStatus } from "../StatusTracker/types";

	import Code from "./interactive/Code.svelte";
	// import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { Code as CodeIcon } from "@gradio/icons";
	// import type { Styles } from "@gradio/utils";
	// export let style: Styles = {};

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
	console.log(dark_mode);

	$: console.log({ label, value });
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
		padding-top: 25px;
		/* background-color: rgb(31 41 55 / var(--tw-bg-opacity)); */
	}

	:global(.cm-cursor) {
		/* border-color: white !important; */
		/* background-color: white !important; */
		/* opacity: 1 !important; */
		/* color: white !important; */
	}

	:global(.ͼo .cm-cursor) {
		/* background-color: white; */
	}

	:global(.ͼ1.cm-editor:focus-visible, div) {
		/* outline: none; */
	}
	:global(.ͼ1 .cm-editor, .ͼ1 .cm-gutter) {
		min-height: 150px;
	}
	:global(.ͼ1 .cm-gutters) {
		margin-right: 1px;
		background-color: transparent;
		/* color: #ccc; */
		border-color: #79b9ff2e;
	}
	:global(.ͼ1 .cm-scroller) {
		/* overflow: auto; */
	}
	:global(.ͼ1 .cm-wrap) {
		/* border: 1px solid silver; */
	}

	:global(.cm-activeLineGutter, .cm-activeLine) {
		/* background-color: #79b9ff2e !important; */
	}
</style>
