import type { SpaceStatusCallback } from "../types";
export declare function check_space_status(id: string, type: "subdomain" | "space_name", status_callback: SpaceStatusCallback): Promise<void>;
export declare const check_and_wake_space: (space_id: string, status_callback: SpaceStatusCallback) => Promise<void>;
export declare function discussions_enabled(space_id: string): Promise<boolean>;
export declare function get_space_hardware(space_id: string, hf_token?: `hf_${string}` | undefined): Promise<(typeof hardware_types)[number]>;
export declare function set_space_timeout(space_id: string, timeout: number, hf_token?: `hf_${string}`): Promise<any>;
export declare const hardware_types: readonly ["cpu-basic", "cpu-upgrade", "cpu-xl", "t4-small", "t4-medium", "a10g-small", "a10g-large", "a10g-largex2", "a10g-largex4", "a100-large", "zero-a10g", "h100", "h100x8"];
