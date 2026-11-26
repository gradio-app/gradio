import { type ApiData, type BlobRef, type Config, type EndpointInfo, type JsApiData, type DataType, Command, type Dependency, type ComponentMeta } from "../types";
import { FileData } from "../upload";
export declare function update_object(object: {
    [x: string]: any;
}, newValue: any, stack: (string | number)[]): void;
export declare function walk_and_store_blobs(data: DataType, type?: string | undefined, path?: string[], root?: boolean, endpoint_info?: EndpointInfo<ApiData | JsApiData> | undefined): Promise<BlobRef[]>;
export declare function skip_queue(id: number, config: Config): boolean;
export declare function post_message<Res = any>(message: any, origin: string): Promise<Res>;
export declare function handle_file(file_or_url: File | string | Blob | Buffer): FileData | Blob | Command;
/**
 * Handles the payload by filtering out state inputs and returning an array of resolved payload values.
 * We send null values for state inputs to the server, but we don't want to include them in the resolved payload.
 *
 * @param resolved_payload - The resolved payload values received from the client or the server
 * @param dependency - The dependency object.
 * @param components - The array of component metadata.
 * @param with_null_state - Optional. Specifies whether to include null values for state inputs. Default is false.
 * @returns An array of resolved payload values, filtered based on the dependency and component metadata.
 */
export declare function handle_payload(resolved_payload: unknown[], dependency: Dependency, components: ComponentMeta[], type: "input" | "output", with_null_state?: boolean): unknown[];
/**
 * Add the Space JWT required for browser-managed media requests.
 *
 * This is a bearer credential and must not be logged or persisted. Restrict it
 * to Gradio routes that serve files; the user's Hugging Face token remains in
 * the Authorization header used to obtain this credential.
 */
export declare function sign_file_urls(data: unknown, root: string, api_prefix: string, jwt: string | false): void;
export declare function sign_config_file_urls(config: Config, jwt: string | false): void;
