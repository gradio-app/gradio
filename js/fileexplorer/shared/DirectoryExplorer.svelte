<script lang="ts">
	import FileTree from "./FileTree.svelte";
	import type { FileNode } from "./types";

	export let interactive: boolean;
	export let file_count: "single" | "multiple" = "multiple";
	export let value: string[][] = [];
	export let ls_fn: (path: string[]) => Promise<FileNode[]>;

	const paths_equal = (path: string[], path_2: string[]): boolean => {
		return path.join("/") === path_2.join("/");
	};

	const path_in_set = (path: string[], set: string[][]): boolean => {
		return set.some((x) => paths_equal(x, path));
	};
</script>

<div class="file-wrap">
	<FileTree
		path={[]}
		selected={value}
		{interactive}
		{ls_fn}
		{file_count}
		on:check={(e) => {
			const { path, checked, type } = e.detail;
			if (checked) {
				if (file_count === "single") {
					value = [path];
				} else {
					if (!path_in_set(path, value)) {
						value = [...value, path];
					}
				}
			} else {
				value = value.filter((x) => !paths_equal(x, path));
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
