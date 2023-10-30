<svelte:options accessors={true} />

<script lang="ts">
	import type { Gradio, SelectData } from "@gradio/utils";
	import { File } from "@gradio/icons";

	import { Block, BlockLabel } from "@gradio/atoms";
	import DirectoryExplorer from "./shared/DirectoryExplorer.svelte";

	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker";

	import { _ } from "svelte-i18n";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: string[][];
	export let label: string;
	export let show_label: boolean;
	export let height: number | undefined = undefined;
	export let file_count: "single" | "multiple" = "multiple";

	export let loading_status: LoadingStatus;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let gradio: Gradio<{
		change: never;
	}>;
	export let server: {
		ls: (path: string[]) => Promise<[string[], string[]]>;
	};
	export let interactive: boolean;
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
	allow_overflow={false}
	{height}
>
	<StatusTracker
		{...loading_status}
		autoscroll={gradio.autoscroll}
		i18n={gradio.i18n}
	/>
	<BlockLabel
		{show_label}
		Icon={File}
		label={label || "FileExplorer"}
		float={false}
	/>
	<DirectoryExplorer
		bind:value
		{file_count}
		{server}
		{interactive}
		on:change={() => gradio.dispatch("change")}
	/>
</Block>
