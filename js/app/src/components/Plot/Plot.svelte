<script lang="ts">
	import { Plot } from "@gradio/plot";

	import { Block, BlockLabel } from "@gradio/atoms";
	import { Plot as PlotIcon } from "@gradio/icons";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { _ } from "svelte-i18n";
	import type { Styles } from "@gradio/utils";
	import type { ThemeMode } from "js/app/src/components/types";

	export let value: null | string = null;
	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;

	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;
	export let target: HTMLElement;
	export let style: Styles = {};
	export let theme_mode: ThemeMode;
	export let caption: string;
	export let bokeh_version: string | null;
</script>

<Block
	padding={false}
	{elem_id}
	{elem_classes}
	{visible}
	disable={typeof style.container === "boolean" && !style.container}
>
	<BlockLabel {show_label} label={label || "Plot"} Icon={PlotIcon} />

	<StatusTracker {...loading_status} />

	<Plot {value} {target} {theme_mode} {caption} {bokeh_version} on:change />
</Block>
