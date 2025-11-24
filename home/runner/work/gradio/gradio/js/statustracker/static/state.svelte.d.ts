import type { ILoadingStatus, LoadingStatusArgs } from "./types.js";
export declare class LoadingStatus {
    current: Record<string, ILoadingStatus>;
    fn_outputs: Record<number, number[]>;
    fn_inputs: Record<number, number[]>;
    pending_outputs: Map<number, number>;
    fn_status: Record<number, ILoadingStatus["status"]>;
    register(dependency_id: number, outputs: number[], inputs: number[]): void;
    clear(id: number): void;
    update(args: LoadingStatusArgs): void;
    set_status(id: number, status: ILoadingStatus["status"]): void;
    resolve_args(args: LoadingStatusArgs): {
        id: number;
        queue_position: number | null;
        queue_size: number | undefined;
        eta: number | null;
        status: "pending" | "error" | "complete" | "generating" | "streaming";
        message: string | null;
        progress: {
            progress: number | null;
            index: number | null;
            length: number | null;
            unit: string | null;
            desc: string | null;
        }[] | null;
        stream_state: "open" | "closed" | "waiting" | null;
        time_limit: number | null;
        type: "input" | "output" | "skip";
    }[];
}
