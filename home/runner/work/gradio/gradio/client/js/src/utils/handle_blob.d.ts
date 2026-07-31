import { type ApiData, type EndpointInfo, type JsApiData } from "../types";
import type { Client } from "..";
export declare function handle_blob(this: Client, endpoint: string, data: unknown[], api_info: EndpointInfo<JsApiData | ApiData>): Promise<unknown[]>;
export declare function process_local_file_commands(client: Client, data: unknown[]): Promise<void>;
