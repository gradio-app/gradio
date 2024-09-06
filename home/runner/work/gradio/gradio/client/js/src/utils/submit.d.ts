import type { GradioEvent, SubmitIterable } from "../types";
import { Client } from "../client";
export declare function submit(this: Client, endpoint: string | number, data?: unknown[] | Record<string, unknown>, event_data?: unknown, trigger_id?: number | null, all_events?: boolean): SubmitIterable<GradioEvent>;
