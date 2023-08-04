<svelte:options accessors={true} />

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import StaticImage from "./ImagePreview.svelte";

	import { Block } from "@gradio/atoms";
	import { _ } from "svelte-i18n";
	import { StatusTracker } from "@gradio/statustracker";
	import type { LoadingStatus } from "@gradio/statustracker/types";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | string = null;
	export let label: string;
	export let show_label: boolean;
	export let show_download_button: boolean;

	export let height: number | undefined;
	export let width: number | undefined;

	export let selectable = false;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let show_share_button = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		error: string;
	}>();

	$: value, dispatch("change");
	let dragging: boolean;

	$: value = !value ? null : value;
</script>

<Block
	{visible}
	variant={"solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	height={height || undefined}
	{width}
	allow_overflow={false}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker {...loading_status} />
	<StaticImage
		on:select
		on:share
		on:error
		{value}
		{label}
		{show_label}
		{show_download_button}
		{selectable}
		{show_share_button}
	/>
</Block>
