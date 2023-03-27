<script lang="ts">
	import type { FileData } from "@gradio/upload";
	import { normalise_file } from "@gradio/upload";
	import { Model3D, Model3DUpload } from "@gradio/model3D";
	import { BlockLabel, Block, Empty } from "@gradio/atoms";
	import UploadText from "../UploadText.svelte";
	import { File } from "@gradio/icons";

	import StatusTracker from "../StatusTracker/StatusTracker.svelte";
	import type { LoadingStatus } from "../StatusTracker/types";
	import { _ } from "svelte-i18n";

	export let elem_id: string = "";
	export let elem_classes: Array<string> = [];
	export let visible: boolean = true;
	export let value: null | FileData = null;
	export let mode: "static" | "dynamic";
	export let root: string;
	export let root_url: null | string;
	export let clearColor: Array<number>;

	export let loading_status: LoadingStatus;
	export let label: string;
	export let show_label: boolean;

	let _value: null | FileData;
	$: _value = normalise_file(value, root, root_url);

	let dragging = false;
</script>

<Block
	{visible}
	variant={value === null ? "dashed" : "solid"}
	border_mode={dragging ? "focus" : "base"}
	padding={false}
	{elem_id}
	{elem_classes}
>
	<StatusTracker {...loading_status} />

	{#if mode === "dynamic"}
		<Model3DUpload
			{label}
			{show_label}
			{clearColor}
			value={_value}
			on:change={({ detail }) => (value = detail)}
			on:drag={({ detail }) => (dragging = detail)}
			on:change
			on:clear
		>
			<UploadText type="file" />
		</Model3DUpload>
	{:else if value}
		<Model3D value={_value} {clearColor} {label} {show_label} />
	{:else}
		<!-- Not ideal but some bugs to work out before we can 
				 make this consistent with other components -->

		<BlockLabel {show_label} Icon={File} label={label || "3D Model"} />

		<Empty size="large" unpadded_box={true}><File /></Empty>
	{/if}
</Block>
