export interface FileData {
	name: string;
	orig_name?: string;
	size?: number;
	data: string;
	is_file?: boolean;
}

export interface BinaryFileData extends FileData {
	blob: File;
}