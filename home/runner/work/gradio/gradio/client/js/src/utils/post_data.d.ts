import type { PostResponse } from "../types";
import { Client } from "..";
export declare function post_data(this: Client, url: string, body: unknown, additional_headers?: any): Promise<[PostResponse, number]>;
