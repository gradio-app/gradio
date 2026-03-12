<script lang="ts">
	import type { FileExplorerProps, FileExplorerEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import { File } from "@gradio/icons";

	import { Block, BlockLabel, IconButtonWrapper } from "@gradio/atoms";
	import DirectoryExplorer from "./shared/DirectoryExplorer.svelte";

	import { StatusTracker } from "@gradio/statustracker";

	import { _ } from "svelte-i18n";

	const props = $props();
	const gradio = new Gradio<FileExplorerEvents, FileExplorerProps>(props, {
		value: []
	});

	let old_value = $state(gradio.props.value);

	let rerender_key = $derived([
		gradio.props.root_dir,
		gradio.props.glob,
		gradio.props.ignore_glob
	]);

	// Reset value when rerender_key changes
	// svelte-ignore state_referenced_locally
	let old_rerender_key = $state(rerender_key);
	$effect(() => {
		if (
			JSON.stringify(old_rerender_key) != JSON.stringify(rerender_key) &&
			old_value == gradio.props.value
		) {
			old_rerender_key = rerender_key;
			gradio.props.value = [];
		}
	});

	$effect(() => {
		if (old_value != gradio.props.value) {
			old_value = gradio.props.value;
			gradio.dispatch("change");
		}
	});
</script>

<Block
	visible={gradio.shared.visible}
	variant={gradio.props.value === null ? "dashed" : "solid"}
	border_mode={"base"}
	padding={false}
	elem_id={gradio.shared.elem_id}
	elem_classes={gradio.shared.elem_classes}
	container={gradio.shared.container}
	scale={gradio.shared.scale}
	min_width={gradio.shared.min_width}
	allow_overflow={true}
	overflow_behavior="auto"
	height={gradio.props.height}
	max_height={gradio.props.max_height}
	min_height={gradio.props.min_height}
>
	<StatusTracker
		{...gradio.shared.loading_status}
		autoscroll={gradio.shared.autoscroll}
		i18n={gradio.i18n}
		on_clear_status={() =>
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
	{#if gradio.shared.show_label && gradio.props.buttons && gradio.props.buttons.length > 0}
		<IconButtonWrapper
			buttons={gradio.props.buttons}
			on_custom_button_click={(id) => {
				gradio.dispatch("custom_button_click", { id });
			}}
		/>
	{/if}
	<BlockLabel
		show_label={gradio.shared.show_label}
		Icon={File}
		label={gradio.shared.label || "FileExplorer"}
		float={false}
	/>
	{#key rerender_key}
		<DirectoryExplorer
			bind:value={gradio.props.value}
			file_count={gradio.props.file_count}
			interactive={gradio.shared.interactive}
			selectable={gradio.props._selectable}
			ls_fn={gradio.shared.server.ls}
			oninput={() => gradio.dispatch("input")}
			onselect={(detail) => gradio.dispatch("select", detail)}
		/>
	{/key}
</Block>
