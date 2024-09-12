import type { Client } from "..";
import type { UploadResponse } from "../types";
export declare function upload_files(this: Client, root_url: string, files: (Blob | File)[], upload_id?: string): Promise<UploadResponse>;
