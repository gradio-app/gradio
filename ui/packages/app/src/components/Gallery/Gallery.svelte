<script lang="ts">
	import { Block, BlockLabel } from "@gradio/atoms";
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
	export let visible: boolean = true;
	export let value: Array<string> | Array<FileData> | null = null;
	export let style: Styles = {};
</script>

<Block
	{visible}
	variant="solid"
	color="grey"
	padding={false}
	{elem_id}
	disable={typeof style.container === "boolean" && !style.container}
>
	<StatusTracker {...loading_status} />
	<Gallery {label} {value} {style} {show_label} {root} {root_url} />
</Block>

<style lang="postcss">
	.gallery-item {
		@apply rounded shadow-sm relative aspect-square h-full hover:brightness-110 focus:ring-blue-500 focus:ring-2 ring-1 ring-gray-200 hover:ring hover:ring-orange-300 w-full overflow-hidden bg-gray-100 dark:bg-gray-900 object-fill outline-none;
	}
</style>
