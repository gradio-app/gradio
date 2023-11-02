<script lang="ts">
	import { createEventDispatcher } from "svelte";
	import { dequal } from "dequal";
	import FileTree from "./FileTree.svelte";
	import { make_fs_store } from "./utils";
	import { File } from "@gradio/icons";
	import { Empty } from "@gradio/atoms";

	export let interactive: boolean;
	export let server: any;
	export let file_count: "single" | "multiple" = "multiple";

	export let value: string[][] = [];

	const dispatch = createEventDispatcher<{
		change: typeof value;
	}>();
	const tree = make_fs_store();

	server.ls().then((v: any) => {
		tree.create_fs_graph(v);
	});

	$: value.length && $tree && set_checked_from_paths();

	function set_checked_from_paths(): void {
		value = file_count === "single" ? [value[0] || []] : value;
		value = tree.set_checked_from_paths(value);
		if (!dequal(value, old_value)) {
			old_value = value;
			dispatch("change", value);
		}
	}

	let old_value: typeof value = [];
	function handle_select({
		node_indices,
		checked
	}: {
		node_indices: number[];
		checked: boolean;
	}): void {
		value = tree.set_checked(node_indices, checked, value, file_count);
		if (!dequal(value, old_value)) {
			old_value = value;
			dispatch("change", value);
		}
	}
</script>

{#if $tree && $tree.length}
	<div class="file-wrap">
		<FileTree
			tree={$tree}
			{interactive}
			on:check={({ detail }) => handle_select(detail)}
			{file_count}
		/>
	</div>
{:else}
	<Empty size="large"><File /></Empty>
{/if}

<style>
	.file-wrap {
		height: calc(100% - 25px);
		overflow-y: scroll;
	}
</style>
