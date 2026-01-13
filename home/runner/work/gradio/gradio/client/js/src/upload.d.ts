import type { Client } from "./client";
export declare function upload(this: Client, file_data: FileData[], root_url: string, upload_id?: string, max_file_size?: number): Promise<(FileData | null)[] | null>;
export declare function prepare_files(files: File[], is_stream?: boolean): Promise<FileData[]>;
export declare class FileData {
    path: string;
    url?: string;
    orig_name?: string;
    size?: number;
    blob?: File;
    is_stream?: boolean;
    mime_type?: string;
    alt_text?: string;
    b64?: string;
    readonly meta: {
        _type: string;
    };
    constructor({ path, url, orig_name, size, blob, is_stream, mime_type, alt_text, b64 }: {
        path: string;
        url?: string;
        orig_name?: string;
        size?: number;
        blob?: File;
        is_stream?: boolean;
        mime_type?: string;
        alt_text?: string;
        b64?: string;
    });
}
