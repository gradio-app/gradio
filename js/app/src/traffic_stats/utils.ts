export type TaskStatus = "success" | "pending" | "closed" | "lost" | "error" | "stopped" | "waiting_connection";
export type Task = [number, string] | [number, string, TaskStatus]; 
export type QueuePreview = [Array<Task>, Array<Task>, Array<Task>, Array<Task>];
export type RequestBreakdown =  Partial<Record<TaskStatus, number>>;

export interface ActivityLog {
    sessions: number;
    request_breakdown: RequestBreakdown;
    avg_duration: number;
    requests_per_fn: Array<[string, number, RequestBreakdown]>
    event_count_per_stage: [number, number, number, number]
    queue_preview?: QueuePreview;
}

export const task_status_colors: Record<TaskStatus, [number, number, number]> = {
    success: [0, 255, 0],
    pending: [0, 204, 255],
    closed: [102, 0, 255],
    lost: [102, 102, 204],
    error: [255, 0, 102],
    stopped: [255, 204, 0],
    waiting_connection: [255, 102, 0],
}