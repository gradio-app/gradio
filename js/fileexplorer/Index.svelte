<svelte:options accessors={true} />

<script lang="ts">
	import type { FileExplorerProps, FileExplorerEvents } from "./types";
	import { Gradio } from "@gradio/utils";
	import { File } from "@gradio/icons";

	import { Block, BlockLabel } from "@gradio/atoms";
	import DirectoryExplorer from "./shared/DirectoryExplorer.svelte";

	import { StatusTracker } from "@gradio/statustracker";

	import { _ } from "svelte-i18n";

	const props = $props();
	const gradio = new Gradio<FileExplorerEvents, FileExplorerProps>(props);

	let old_value = $state(gradio.props.value);

	let rerender_key = $derived([
		gradio.props.root_dir,
		gradio.props.glob,
		gradio.props.ignore_glob
	]);

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
<<<<<<< HEAD
		on:clear_status={() =>
=======
		on_clear_status={() =>
>>>>>>> main
			gradio.dispatch("clear_status", gradio.shared.loading_status)}
	/>
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
			ls_fn={gradio.shared.server.ls}
		/>
	{/key}
</Block>
