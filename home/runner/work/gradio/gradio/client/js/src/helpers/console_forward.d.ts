export declare const CONSOLE_FORWARD_PROTOCOL = "gradio-console";
export declare const CONSOLE_FORWARD_VERSION = 1;
/** entries kept for the next state reply, older ones are evicted and counted as dropped */
export declare const CONSOLE_FORWARD_BUFFER_SIZE = 100;
export declare const CONSOLE_FORWARD_MAX_TEXT = 4096;
/** the console is given back if no valid get arrives this long after page load */
export declare const CONSOLE_FORWARD_IDLE_MS = 10000;
declare const CONSOLE_LEVELS: readonly ["log", "info", "warn", "error", "debug"];
type ConsoleLevel = (typeof CONSOLE_LEVELS)[number];
export type ConsoleForwardLevel = ConsoleLevel | "exception" | "rejection";
export interface ConsoleForwardEntry {
    seq: number;
    ts: number;
    level: ConsoleForwardLevel;
    text: string;
    stack?: string;
}
/** the v1 allowlist of parent origins that may send get */
export declare function is_console_forward_origin_allowed(origin: string, frame_hostname: string): boolean;
type Listener = (event: any) => void;
type Untrack = <T>(fn: () => T) => T;
/** the parts of window the forwarder uses, so tests can pass a fake */
export interface ConsoleForwardHost {
    parent: {
        postMessage(message: any, target_origin: string): void;
    } | null;
    location: {
        hostname: string;
    };
    console: Console;
    document?: {
        readyState: string;
    };
    addEventListener(type: string, listener: Listener): void;
    removeEventListener(type: string, listener: Listener): void;
}
export interface ConsoleForwardOptions {
    /** reported in the state reply, defaults to an empty string */
    gradio_version?: string;
    /** svelte untrack, so converting a logged $state value adds no dependency to the effect that logged it */
    untrack?: Untrack;
}
export interface ConsoleForwarder {
    readonly session_id: string;
    /** fills in a missing gradio version and sets untrack if given */
    configure(options: ConsoleForwardOptions): void;
    uninstall(): void;
}
/** returns null and installs nothing when host is not embedded */
export declare function install_console_forwarding(host: ConsoleForwardHost, options?: ConsoleForwardOptions): ConsoleForwarder | null;
/** installs on window at most once per page even across bundled copies, later calls only configure it */
export declare function initialize_console_forwarding(options?: ConsoleForwardOptions): ConsoleForwarder | null;
/** initializes only when app_url is an absolute url on this page origin, so other sites that use the client are untouched */
export declare function initialize_console_forwarding_for_app(app_url: string | null | undefined, gradio_version?: string): void;
/** initializes when this page is served from a space host, so custom pages capture from the moment they import the client */
export declare function initialize_console_forwarding_on_space(): void;
/** joins the arguments as text per the v1 contract and returns the first error stack, never throws */
export declare function serialize_console_args(args: readonly unknown[]): {
    text: string;
    stack?: string;
};
/** json with a budget on the work done, exported for tests */
export declare function stringify_bounded(value: unknown): string | undefined;
export {};
