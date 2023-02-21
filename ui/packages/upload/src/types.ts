export interface FileData {
	name: string;
	orig_name?: string;
	size?: number;
	data: string;
	blob?: File;
	is_file?: boolean;
}
