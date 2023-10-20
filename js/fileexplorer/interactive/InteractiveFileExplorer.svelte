<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { Block, BlockLabel } from "@gradio/atoms";
	import { File } from "@gradio/icons";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";
	import DirectoryExplorer from "../shared/DirectoryExplorer.svelte";

	import { _ } from "svelte-i18n";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string[][];

	export let label: string;
	export let show_label: boolean;
	export let loading_status: LoadingStatus;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let height: number | undefined = undefined;
	export let gradio: Gradio<{
		change: never;
		select: SelectData;
	}>;
	export let file_count: "single" | "multiple" = "multiple";
	export let server: {
		ls: (path: string[]) => Promise<[string[], string[]]>;
	};

	// $: value && gradio.dispatch("change");
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
	<BlockLabel
		{show_label}
		Icon={File}
		label={label || "FileExplorer"}
		float={false}
	/>
	<StatusTracker {...loading_status} />

	<DirectoryExplorer
		bind:value
		{file_count}
		{server}
		mode="interactive"
		on:change={() => gradio.dispatch("change")}
	/>
</Block>
