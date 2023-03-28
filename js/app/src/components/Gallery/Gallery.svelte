<script lang="ts">
	import { Block } from "@gradio/atoms";
	import { Gallery } from "@gradio/gallery";
	import type { LoadingStatus } from "../StatusTracker/types";
	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { Styles } from "@gradio/utils";
	import type { FileData } from "@gradio/upload";

	export let loading_status: LoadingStatus;
	export let show_label: boolean;
	export let label: string;
	export let root: string;
	export let root_url: null | string;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: Array<string> | Array<FileData> | null = null;
	export let style: Styles = {};
</script>

<Block
	{visible}
	variant="solid"
	padding={false}
	{elem_id}
	{elem_classes}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />
	<Gallery on:select {label} {value} {style} {show_label} {root} {root_url} />
</Block>
