export interface Task {
    id: string;
    fn: string;
    status?: task_status | undefined;
}

export type QueuePreview = [Array<Task>, Array<Task>, Array<Task>, Array<Task>];

export type task_status = "success" | "pending" | "closed" | "lost" | "error" | "stopped";

export const task_status_colors: Record<task_status, [number, number, number]> = {
    success: [0, 255, 0],
    pending: [0, 204, 255],
    closed: [102, 0, 255],
    lost: [102, 102, 204],
    error: [255, 0, 102],
    stopped: [255, 204, 0],
}