<script lang="ts">
	import FileTree from "./FileTree.svelte";
	import type { FileNode } from "./types";

	export let interactive: boolean;
	export let file_count: "single" | "multiple" = "multiple";
	export let value: string[][] = [];
	export let ls_fn: (path: string[]) => Promise<FileNode[]>;
</script>

<div class="file-wrap">
	<FileTree
		path={[]}
		selected={value}
		{interactive}
		{ls_fn}
		{file_count}
		on:check={(e) => {
			const { path, checked } = e.detail;
			if (checked) {
				value = [...value, path];
			} else {
				value = value.filter((x) => x.join("/") !== path.join("/"));
			}
		}}
	/>
</div>

<style>
	.file-wrap {
		height: calc(100% - 25px);
		overflow-y: scroll;
	}
</style>
