import type { Client } from "../client";
export declare function open_stream(this: Client): Promise<void>;
export declare function close_stream(stream_status: {
    open: boolean;
}, abort_controller: AbortController | null): void;
export declare function apply_diff_stream(pending_diff_streams: Record<string, any[][]>, event_id: string, data: any): void;
export declare function apply_diff(obj: any, diff: [string, (number | string)[], any][]): any;
export declare function readable_stream(input: RequestInfo | URL, init?: RequestInit): EventSource;
