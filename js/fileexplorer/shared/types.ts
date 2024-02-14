export interface FileNode {
	type: "file" | "folder";
	name: string;
	valid?: boolean;
}
