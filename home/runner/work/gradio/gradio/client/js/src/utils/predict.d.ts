import { Client } from "../client";
import type { PredictReturn } from "../types";
export declare function predict(this: Client, endpoint: string | number, data?: unknown[] | Record<string, unknown>): Promise<PredictReturn>;
