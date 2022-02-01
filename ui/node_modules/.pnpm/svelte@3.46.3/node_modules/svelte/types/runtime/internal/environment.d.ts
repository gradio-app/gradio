import { noop } from './utils';
export declare const is_client: boolean;
export declare let now: () => number;
export declare let raf: typeof noop | ((cb: any) => number);
export declare function set_now(fn: any): void;
export declare function set_raf(fn: any): void;
