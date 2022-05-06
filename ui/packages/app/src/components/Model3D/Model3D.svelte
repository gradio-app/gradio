<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Model3D, Model3DUpload } from "@gradio/model3D";
	import { Block } from "@gradio/atoms";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { _ } from "svelte-i18n";

	export let value: null | FileData = null;
	export let style: string = "";
	export let mode: "static" | "dynamic";
	export let root: string;
	export let clearColor: Array<number>;

	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;

	let _value: null | FileData;
	$: _value = normalise_file(value, root);

	let dragging = false;
</script>

<Block
	variant={value === null ? "dashed" : "solid"}
	color={dragging ? "green" : "grey"}
	padding={false}
>
	<StatusTracker {...loading_status} />

	{#if mode === "dynamic"}
		<Model3DUpload
			{label}
			{show_label}
			value={_value}
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			{style}
			on:change
			on:clear
			drop_text={$_("interface.drop_file")}
			or_text={$_("or")}
			upload_text={$_("interface.click_to_upload")}
		/>
	{:else if _value}
		<Model3D value={_value} {clearColor} {style} {label} {show_label} />
	{/if}
</Block>
