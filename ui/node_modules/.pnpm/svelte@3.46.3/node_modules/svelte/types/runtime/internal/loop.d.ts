export interface Task {
    abort(): void;
    promise: Promise<void>;
}
declare type TaskCallback = (now: number) => boolean | void;
/**
 * For testing purposes only!
 */
export declare function clear_loops(): void;
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
export declare function loop(callback: TaskCallback): Task;
export {};
