export interface FileData {
	path: string;
	orig_name?: string;
	size?: number;
	blob?: File;
	is_stream?: boolean;
	mime_type?: string;
	alt_text?: string;
}
