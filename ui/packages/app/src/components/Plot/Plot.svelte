<script lang="ts">
	import { Plot } from "@gradio/plot";

	import { Block, BlockLabel } from "@gradio/atoms";
	import { Plot as PlotIcon } from "@gradio/icons";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { _ } from "svelte-i18n";
	import type { Styles } from "@gradio/utils";

	export let value: null | string = null;
	export let elem_id: string = "";
	export let visible: boolean = true;

	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let target: HTMLElement;
	export let style: Styles = {};
	export let theme: string;
	export let caption: string;
	export let root: string;
	export let root_url: null | string;
</script>

<Block
	padding={false}
	{elem_id}
	{visible}
	disable={typeof style.container === "boolean" && !style.container}
>
	<BlockLabel {show_label} label={label || "Plot"} Icon={PlotIcon} />

	<StatusTracker {...loading_status} />

	<Plot {value} {target} {theme} {caption} {root} {root_url} on:change />
</Block>
