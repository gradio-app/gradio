import type { ApiData, ApiInfo, ClientOptions, Config, DuplicateOptions, EndpointInfo, JsApiData, PredictReturn, SpaceStatus, Status, UploadResponse, SubmitIterable, GradioEvent } from "./types";
import { FileData } from "./upload";
export declare class Client {
    app_reference: string;
    options: ClientOptions;
    config: Config | undefined;
    api_prefix: string;
    api_info: ApiInfo<JsApiData> | undefined;
    api_map: Record<string, number>;
    session_hash: string;
    jwt: string | false;
    last_status: Record<string, Status["stage"]>;
    private cookies;
    stream_status: {
        open: boolean;
    };
    pending_stream_messages: Record<string, any[][]>;
    pending_diff_streams: Record<string, any[][]>;
    event_callbacks: Record<string, (data?: unknown) => Promise<void>>;
    unclosed_events: Set<string>;
    heartbeat_event: EventSource | null;
    abort_controller: AbortController | null;
    stream_instance: EventSource | null;
    current_payload: any;
    ws_map: Record<string, WebSocket | "failed">;
    fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
    stream(url: URL): EventSource;
    view_api: () => Promise<ApiInfo<JsApiData>>;
    upload_files: (root_url: string, files: (Blob | File)[], upload_id?: string) => Promise<UploadResponse>;
    upload: (file_data: FileData[], root_url: string, upload_id?: string, max_file_size?: number) => Promise<(FileData | null)[] | null>;
    handle_blob: (endpoint: string, data: unknown[], endpoint_info: EndpointInfo<ApiData | JsApiData>) => Promise<unknown[]>;
    post_data: (url: string, body: unknown, additional_headers?: any) => Promise<unknown[]>;
    submit: (endpoint: string | number, data: unknown[] | Record<string, unknown> | undefined, event_data?: unknown, trigger_id?: number | null, all_events?: boolean) => SubmitIterable<GradioEvent>;
    predict: (endpoint: string | number, data: unknown[] | Record<string, unknown> | undefined, event_data?: unknown) => Promise<PredictReturn>;
    open_stream: () => Promise<void>;
    private resolve_config;
    private resolve_cookies;
    constructor(app_reference: string, options?: ClientOptions);
    private init;
    _resolve_hearbeat(_config: Config): Promise<void>;
    static connect(app_reference: string, options?: ClientOptions): Promise<Client>;
    close(): void;
    set_current_payload(payload: any): void;
    static duplicate(app_reference: string, options?: DuplicateOptions): Promise<Client>;
    private _resolve_config;
    private config_success;
    handle_space_success(status: SpaceStatus): Promise<Config | void>;
    component_server(component_id: number, fn_name: string, data: unknown[] | {
        binary: boolean;
        data: Record<string, any>;
    }): Promise<unknown>;
    set_cookies(raw_cookies: string): void;
    private prepare_return_obj;
    private connect_ws;
    send_ws_message(url: string, data: any): Promise<void>;
    close_ws(url: string): Promise<void>;
}
/**
 * @deprecated This method will be removed in v1.0. Use `Client.connect()` instead.
 * Creates a client instance for interacting with Gradio apps.
 *
 * @param {string} app_reference - The reference or URL to a Gradio space or app.
 * @param {ClientOptions} options - Configuration options for the client.
 * @returns {Promise<Client>} A promise that resolves to a `Client` instance.
 */
export declare function client(app_reference: string, options?: ClientOptions): Promise<Client>;
/**
 * @deprecated This method will be removed in v1.0. Use `Client.duplicate()` instead.
 * Creates a duplicate of a space and returns a client instance for the duplicated space.
 *
 * @param {string} app_reference - The reference or URL to a Gradio space or app to duplicate.
 * @param {DuplicateOptions} options - Configuration options for the client.
 * @returns {Promise<Client>} A promise that resolves to a `Client` instance.
 */
export declare function duplicate_space(app_reference: string, options: DuplicateOptions): Promise<Client>;
export type ClientInstance = Client;
