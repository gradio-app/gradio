import { Client } from "../client";
import type { PredictReturn } from "../types";
export declare function predict<T = unknown>(this: Client, endpoint: string | number, data?: unknown[] | Record<string, unknown>): Promise<PredictReturn<T>>;
