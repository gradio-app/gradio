<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { File } from "@gradio/icons";
	import type { FileNode } from "./shared/types";

	import { Block, BlockLabel } from "@gradio/atoms";
	import DirectoryExplorer from "./shared/DirectoryExplorer.svelte";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	import { _ } from "svelte-i18n";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string[][];
	let old_value: string[][];
	export let label: string;
	export let show_label: boolean;
	export let height: number | string | undefined;
	export let min_height: number | string | undefined;
	export let max_height: number | string | undefined;
	export let file_count: "single" | "multiple" = "multiple";
	export let root_dir: string;
	export let glob: string;
	export let ignore_glob: string;
	export let loading_status: LoadingStatus;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let gradio: Gradio<{
		change: never;
		clear_status: LoadingStatus;
	}>;
	export let server: {
		ls: (path: string[]) => Promise<FileNode[]>;
	};
	export let interactive: boolean;

	$: rerender_key = [root_dir, glob, ignore_glob];

	$: if (JSON.stringify(value) !== JSON.stringify(old_value)) {
		old_value = value;
		gradio.dispatch("change");
	}
</script>

<Block
	{visible}
	variant={value === null ? "dashed" : "solid"}
	border_mode={"base"}
	padding={false}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
	allow_overflow={true}
	overflow_behavior="auto"
	{height}
	{max_height}
	{min_height}
>
	<StatusTracker
		{...loading_status}
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
		on:clear_status={() => gradio.dispatch("clear_status", loading_status)}
	/>
	<BlockLabel
		{show_label}
		Icon={File}
		label={label || "FileExplorer"}
		float={false}
	/>
	{#key rerender_key}
		<DirectoryExplorer
			bind:value
			{file_count}
			{interactive}
			ls_fn={server.ls}
		/>
	{/key}
</Block>
