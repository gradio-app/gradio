import type { LoadingStatus } from "@gradio/statustracker";
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
	server: {
		ls: (path: string[]) => Promise<FileNode[]>;
	};
}

export interface FileExplorerEvents {
	change: never;
	clear_status: LoadingStatus;
}
