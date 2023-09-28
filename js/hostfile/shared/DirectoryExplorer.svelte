<script context="module" lang="ts">
	type File = {
		type: "file";
		path: string;
		children: null;
		checked: boolean;
		children_visible: boolean;
	};

	type Folder = {
		type: "folder";
		path: string;
		children: Node[];
		checked: boolean;
		children_visible: boolean;
	};

	export type Node = File | Folder;
</script>

<script lang="ts">
	import FileTree from "./FileTree.svelte";

	export let mode: "static" | "interactive";
	export let server: any;

	let tree: Node[] = [];

	function process_tree(
		node: Omit<Node, "checked" | "children_visible">[]
	): Node[] {
		const _tree: Node[] = [];

		const folders: Folder[] = [];
		const files: File[] = [];

		for (let i = 0; i < node.length; i++) {
			let n: (typeof node)[number] = node[i];

			if (n.type === "file") {
				let index = files.findIndex(
					(v) => v.path.toLocaleLowerCase() >= n.path.toLocaleLowerCase()
				);
				files.splice(index === -1 ? files.length : index, 0, {
					children: null,
					type: "file",
					path: n.path,
					checked: false,
					children_visible: false
				});
			} else {
				let index = folders.findIndex(
					(v) => v.path.toLocaleLowerCase() >= n.path.toLocaleLowerCase()
				);
				folders.splice(index === -1 ? folders.length : index, 0, {
					type: "folder",
					path: n.path,
					checked: false,
					children: process_tree(n.children!),
					children_visible: false
				});
			}
		}
		return Array().concat(folders, files);
	}

	if (mode === "interactive") {
		server.ls().then((v: any) => {
			tree = process_tree(v);
		});
	}
</script>

<FileTree {tree} {mode} />
