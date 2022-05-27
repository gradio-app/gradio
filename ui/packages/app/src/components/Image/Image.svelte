<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { Image, StaticImage } from "@gradio/image";
	import { Block } from "@gradio/atoms";
	import { _ } from "svelte-i18n";
	import { Component as StatusTracker } from "../StatusTracker/";

	export let elem_id: string = "";
	export let value: null | string = null;
	export let source: "canvas" | "webcam" | "upload" = "upload";
	export let tool: "editor" | "select" = "editor";
	export let label: string;
	export let show_label: boolean;
	export let streaming: boolean;
	export let pending: boolean;

	export let loading_status: LoadingStatus;

	export let mode: "static" | "dynamic";

	const dispatch = createEventDispatcher<{ change: undefined }>();

	$: value, dispatch("change");

	let dragging: boolean;
</script>

<Block
	variant={mode === "dynamic" && value === null && source === "upload"
		? "dashed"
		: "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
	{elem_id}
>
	<StatusTracker {...loading_status} />
	{#if mode === "static"}
		<StaticImage {value} {label} {show_label} />
	{:else}
		<Image
			bind:value
			{source}
			{tool}
			on:edit
			on:clear
			on:change
			on:stream
			on:drag={({ detail }) => (dragging = detail)}
			{label}
			{show_label}
			{pending}
			{streaming}
			drop_text={$_("interface.drop_image")}
			or_text={$_("or")}
			upload_text={$_("interface.click_to_upload")}
		/>
	{/if}
</Block>
