import type { LoadingStatus } from "@gradio/statustracker";
import type { SelectData } from "@gradio/utils";
import type { FileNode } from "./shared/types";

export interface FileExplorerProps {
	value: string[][];
	height: number | string | undefined;
	min_height: number | string | undefined;
	max_height: number | string | undefined;
	file_count: "single" | "multiple";
	root_dir: string;
	glob: string;
	ignore_glob: string;
	_selectable: boolean;
	server: {
		ls: (path: string[]) => Promise<FileNode[]>;
	};
}

export interface FileExplorerEvents {
	change: never;
	input: never;
	select: SelectData;
	clear_status: LoadingStatus;
}
