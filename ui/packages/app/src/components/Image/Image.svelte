<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Image, StaticImage } from "@gradio/image";
	import { Block } from "@gradio/atoms";
	import { _ } from "svelte-i18n";
	import { Component as StatusTracker } from "../StatusTracker/";

	export let value: null | string = null;
	export let default_value: null | string = null;
	export let style: string = "";
	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" = "editor";
	export let label: string;
	export let show_label: boolean;

	export let loading_status: "complete" | "pending" | "error";

	export let mode: "static" | "dynamic";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	if (default_value) value = default_value;

	$: value, dispatch("change");

	let dragging: boolean;
</script>

<Block
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
>
	<StatusTracker tracked_status={loading_status} />
	{#if mode === "static"}
		<StaticImage {value} {label} {style} {show_label} />
	{:else}
		<Image
			bind:value
			{style}
			{source}
			{tool}
			on:edit
			on:clear
			on:change
			on:drag={({ detail }) => (dragging = detail)}
			{label}
			{show_label}
			drop_text={$_("interface.drop_image")}
			or_text={$_("or")}
			upload_text={$_("interface.click_to_upload")}
		/>
	{/if}
</Block>
