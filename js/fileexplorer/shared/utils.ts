import { writable, type Readable } from "svelte/store";
import { dequal } from "dequal";
export interface Node {
	type: "file" | "folder";
	path: string;
	children?: Node[];
	checked: boolean;
	children_visible: boolean;
	last?: Node | null;
	parent: Node | null;
	previous?: Node | null;
}

export type SerialisedNode = Omit<
	Node,
	"checked" | "children_visible" | "children"
> & { children?: SerialisedNode[] };

interface FSStore {
	subscribe: Readable<Node[] | null>["subscribe"];
	create_fs_graph: (serialised_node: SerialisedNode[]) => void;

	set_checked: (
		indices: number[],
		checked: boolean,
		checked_paths: string[][],
		file_count: "single" | "multiple"
	) => string[][];
	set_checked_from_paths: (checked_paths: string[][]) => string[][];
}

export const make_fs_store = (): FSStore => {
	const { subscribe, set, update } = writable<Node[] | null>(null);
	let root: Node = {
		type: "folder",
		path: "",
		checked: false,
		children_visible: false,
		parent: null
	};

	function create_fs_graph(serialised_node: SerialisedNode[]): void {
		root.children = process_tree(serialised_node);
		set(root.children);
	}

	let old_checked_paths: string[][] = [];

	function set_checked_from_paths(checked_paths: string[][]): string[][] {
		if (dequal(checked_paths, old_checked_paths)) {
			return checked_paths;
		}
		old_checked_paths = checked_paths;
		check_node_and_children(root.children, false, []);
		const new_checked_paths: string[][] = [];
		const seen_nodes = new Set();
		for (let i = 0; i < checked_paths.length; i++) {
			let _node = root;
			let _path = [];
			for (let j = 0; j < checked_paths[i].length; j++) {
				if (!_node?.children) {
					continue;
				}
				_path.push(checked_paths[i][j]);
				_node = _node.children!.find((v) => v.path === checked_paths[i][j])!;
			}

			if (!_node) {
				continue;
			}

			_node.checked = true;
			ensure_visible(_node);
			const nodes = check_node_and_children(_node.children, true, [_node]);
			check_parent(_node);

			nodes.forEach((node) => {
				const path = get_full_path(node);
				if (seen_nodes.has(path.join("/"))) {
					return;
				}
				if (node.type === "file") {
					new_checked_paths.push(path);
				}
				seen_nodes.add(path.join("/"));
			});
		}

		set(root.children!);

		return new_checked_paths;
	}

	function set_checked(
		indices: number[],
		checked: boolean,
		checked_paths: string[][],
		file_count: "single" | "multiple"
	): string[][] {
		let _node = root;

		if (file_count === "single") {
			check_node_and_children(root.children, false, []);
			set(root.children!);
		}

		for (let i = 0; i < indices.length; i++) {
			_node = _node.children![indices[i]];
		}

		_node.checked = checked;
		const nodes = check_node_and_children(_node.children, checked, [_node]);

		let new_checked_paths = new Map(checked_paths.map((v) => [v.join("/"), v]));

		for (let i = 0; i < nodes.length; i++) {
			const _path = get_full_path(nodes[i]);
			if (!checked) {
				new_checked_paths.delete(_path.join("/"));
			} else if (checked) {
				if (file_count === "single") {
					new_checked_paths = new Map();
				}

				if (nodes[i].type === "file") {
					new_checked_paths.set(_path.join("/"), _path);
				}
			}
		}

		check_parent(_node);
		set(root.children!);
		old_checked_paths = Array.from(new_checked_paths).map((v) => v[1]);
		return old_checked_paths;
	}

	return {
		subscribe,
		create_fs_graph,
		set_checked,
		set_checked_from_paths
	};
};

function ensure_visible(node: Node): void {
	if (node.parent) {
		node.parent.children_visible = true;
		ensure_visible(node.parent);
	}
}

function process_tree(
	node: SerialisedNode[],
	depth = 0,
	path_segments: string[] = [],
	parent: Node | null = null
): Node[] {
	const folders: Node[] = [];
	const files: Node[] = [];

	for (let i = 0; i < node.length; i++) {
		let n: (typeof node)[number] = node[i];

		if (n.type === "file") {
			let index = files.findIndex(
				(v) => v.path.toLocaleLowerCase() >= n.path.toLocaleLowerCase()
			);

			const _node: Node = {
				children: undefined,
				type: "file",
				path: n.path,
				checked: false,
				children_visible: false,
				parent: parent
			};

			files.splice(index === -1 ? files.length : index, 0, _node);
		} else {
			let index = folders.findIndex(
				(v) => v.path.toLocaleLowerCase() >= n.path.toLocaleLowerCase()
			);

			const _node: Node = {
				type: "folder",
				path: n.path,
				checked: false,
				children_visible: false,
				parent: parent
			};

			const children = process_tree(
				n.children!,
				depth + 1,
				[...path_segments, n.path],
				_node
			);

			_node.children = children;

			folders.splice(index === -1 ? folders.length : index, 0, _node);
		}
	}

	const last = files[files.length - 1] || folders[folders.length - 1];

	for (let i = 0; i < folders.length; i++) {
		folders[i].last = last;
		folders[i].previous = folders[i - 1] || null;
	}

	for (let i = 0; i < files.length; i++) {
		if (i === 0) {
			files[i].previous = folders[folders.length - 1] || null;
		} else {
			files[i].previous = files[i - 1] || null;
		}
		files[i].last = last;
	}

	return Array().concat(folders, files);
}

function get_full_path(node: Node, path: string[] = []): string[] {
	const new_path = [node.path, ...path];

	if (node.parent) {
		return get_full_path(node.parent, new_path);
	}
	return new_path;
}

function check_node_and_children(
	node: Node[] | null | undefined,
	checked: boolean,
	checked_nodes: Node[]
): Node[] {
	// console.log(node, checked);
	if (node === null || node === undefined) return checked_nodes;
	for (let i = 0; i < node.length; i++) {
		node[i].checked = checked;
		checked_nodes.push(node[i]);
		if (checked) ensure_visible(node[i]);

		checked_nodes.concat(
			check_node_and_children(node[i].children, checked, checked_nodes)
		);
	}

	return checked_nodes;
}

function check_parent(node: Node | null | undefined): void {
	if (node === null || node === undefined || !node.parent) return;
	let _node = node.last;
	let nodes_checked = [];
	while (_node) {
		nodes_checked.push(_node.checked);
		_node = _node.previous;
	}

	if (nodes_checked.every((v) => v === true)) {
		node.parent!.checked = true;
		check_parent(node?.parent);
	} else if (nodes_checked.some((v) => v === false)) {
		node.parent!.checked = false;
		check_parent(node?.parent);
	}
}
