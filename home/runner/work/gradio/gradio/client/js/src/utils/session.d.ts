import type { Config } from "../types";
export interface ResumableJob {
    event_id: string;
    fn_index: number;
}
/**
 * Who the session belongs to: the user logged in with `auth=`, or the Hugging
 * Face account logged in with `gr.LoginButton` (`config.session_user`).
 */
export declare function session_user(config: Config): string | null;
/** Forgets the session this tab is using, so that its next load starts a new one. */
export declare function forget_session(): void;
/**
 * Resolves once the page is shown. A page the browser prerenders (e.g. while
 * its URL is typed in Chrome's address bar) has a copy of sessionStorage that
 * is dropped when the page is shown, so the session must not be picked up or
 * tracked before then.
 */
export declare function page_shown(): Promise<void>;
export declare function get_resumable_session_hash(): string | null;
/** Whether this tab was using `session_hash` for this app. */
export declare function has_session(config: Config, session_hash: string): boolean;
/** Whether this tab has already shown the config's page in `session_hash`. */
export declare function has_shown_page(config: Config, session_hash: string): boolean;
/** Remember that this tab is using `session_hash`, for as long as it is open. */
export declare function track_session(config: Config, session_hash: string): void;
export declare function set_session_in_use(in_use: boolean): void;
export declare function get_resumable_events(config: Config, session_hash: string): ResumableJob[];
export declare function track_resumable_event(config: Config, session_hash: string, event: ResumableJob): void;
export declare function clear_resumable_event(event_id: string): void;
