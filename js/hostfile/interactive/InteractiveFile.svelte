<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { Block } from "@gradio/atoms";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import DirectoryExplorer from "../shared/DirectoryExplorer.svelte";

	import { _ } from "svelte-i18n";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string[];

	export let mode: "static" | "interactive";
	export let root: string;
	export let label: string;
	export let show_label: boolean;
	export let file_count: string;
	export let file_types: string[] = ["file"];
	export let root_url: null | string;
	export let selectable = false;
	export let loading_status: LoadingStatus;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let height: number | undefined = undefined;
	export let gradio: Gradio<{
		change: never;
		select: SelectData;
	}>;
	let server = {
		ls: async (path: string[]): Promise<[string[], string[]]> => {
			// sleep for 1 second
			await new Promise((resolve) => setTimeout(resolve, 1000));
			return [
				["folder1", "folder2", "folder3"].slice(0, path.length),
				["file1", "file2", "file3", "file4", "file5", "file6"].slice(
					0,
					path.length
				),
			];
		},
	};
</script>

<Block
	{visible}
	padding={false}
	{elem_id}
	{elem_classes}
	{container}
	{scale}
	{min_width}
	{height}
>
	<StatusTracker {...loading_status} />

	<DirectoryExplorer
		{label}
		{show_label}
		{value}
		{file_count}
		{file_types}
		{selectable}
		{height}
		{server}
	/>
</Block>
