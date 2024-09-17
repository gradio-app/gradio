<script context="module" lang="ts">
	export { default as BaseCode } from "./shared/Code.svelte";
	export { default as BaseCopy } from "./shared/Copy.svelte";
	export { default as BaseDownload } from "./shared/Download.svelte";
	export { default as BaseWidget } from "./shared/Widgets.svelte";
	export { default as BaseExample } from "./Example.svelte";
</script>

<script lang="ts">
	import type { Gradio } from "@gradio/utils";
	import { afterUpdate } from "svelte";

	import type { LoadingStatus } from "@gradio/statustracker";

	import Code from "./shared/Code.svelte";
	import Widget from "./shared/Widgets.svelte";
	import { StatusTracker } from "@gradio/statustracker";
	import { Block, BlockLabel, Empty } from "@gradio/atoms";
	import { Code as CodeIcon } from "@gradio/icons";

	export let gradio: Gradio<{
		change: typeof value;
		input: never;
		blur: never;
		focus: never;
		clear_status: LoadingStatus;
	}>;
	export let value = "";
	export let value_is_output = false;
	export let language = "";
	export let lines = 5;
	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let label = gradio.i18n("code.code");
	export let show_label = true;
	export let loading_status: LoadingStatus;
	export let scale: number | null = null;

	export let interactive: boolean;

	let dark_mode = gradio.theme === "dark";

	function handle_change(): void {
		gradio.dispatch("change", value);
		if (!value_is_output) {
			gradio.dispatch("input");
		}
	}
	afterUpdate(() => {
		value_is_output = false;
	});
	$: value, handle_change();

	const is_browser = typeof window !== "undefined";
	const default_lines = interactive ? lines : 10.35;
</script>

<Block
	height={is_browser ? undefined : default_lines * 25 + 4}
	variant={"solid"}
	padding={false}
	{elem_id}
	{elem_classes}
	{visible}
	{scale}
>
	<StatusTracker
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		{...loading_status}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>

	<BlockLabel Icon={CodeIcon} {show_label} {label} float={false} />

	{#if !value && !interactive}
		<Empty unpadded_box={true} size="large">
			<CodeIcon />
		</Empty>
	{:else}
		<Widget {language} {value} />

		<Code
			bind:value
			{language}
			{lines}
			{dark_mode}
			readonly={!interactive}
			on:blur={() => gradio.dispatch("blur")}
			on:focus={() => gradio.dispatch("focus")}
		/>
	{/if}
</Block>
