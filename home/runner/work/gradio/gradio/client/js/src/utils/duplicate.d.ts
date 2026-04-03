import type { DuplicateOptions } from "../types";
import { Client } from "../client";
export declare function duplicate(app_reference: string, options: DuplicateOptions): Promise<Client>;
