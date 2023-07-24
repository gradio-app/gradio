<svelte:options accessors={true} />

<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Image, StaticImage } from "@gradio/image";
	import { Block } from "@gradio/atoms";
	import { _ } from "svelte-i18n";
	import { Component as StatusTracker } from "../StatusTracker/";
	import type { LoadingStatus } from "../StatusTracker/types";
	import UploadText from "../UploadText.svelte";

	export let elem_id = "";
	export let elem_classes: string[] = [];
	export let visible = true;
	export let value: null | string = null;
	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" | "sketch" | "color-sketch" = "editor";
	export let label: string;
	export let show_label: boolean;
	export let show_download_button: boolean;
	export let streaming: boolean;
	export let pending: boolean;
	export let height: number | undefined;
	export let width: number | undefined;
	export let mirror_webcam: boolean;
	export let shape: [number, number];
	export let brush_radius: number;
	export let selectable = false;
	export let container = true;
	export let scale: number | null = null;
	export let min_width: number | undefined = undefined;
	export let loading_status: LoadingStatus;
	export let mode: "static" | "dynamic";
	export let show_share_button = false;

	const dispatch = createEventDispatcher<{
		change: undefined;
		error: string;
	}>();

	$: value, dispatch("change");
	let dragging: boolean;
	const FIXED_HEIGHT = 240;

	$: value = !value ? null : value;
</script>

<Block
	{visible}
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
	height={height ||
		(source === "webcam" || mode === "static" ? undefined : FIXED_HEIGHT)}
	{width}
	allow_overflow={false}
	{container}
	{scale}
	{min_width}
>
	<StatusTracker {...loading_status} />
	{#if mode === "static"}
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
	{:else}
		<Image
			{brush_radius}
			{shape}
			bind:value
			{source}
			{tool}
			{selectable}
			on:edit
			on:clear
			on:stream
			on:drag={({ detail }) => (dragging = detail)}
			on:upload
			on:select
			on:share
			on:error={({ detail }) => {
				loading_status = loading_status || {};
				loading_status.status = "error";
				dispatch("error", detail);
			}}
			{label}
			{show_label}
			{pending}
			{streaming}
			{mirror_webcam}
		>
			<UploadText type="image" />
		</Image>
	{/if}
</Block>
