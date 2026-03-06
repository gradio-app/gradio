import type { LoadingStatus } from "./types";
import type { I18nFormatter } from "@gradio/utils";
interface Props {
    i18n: I18nFormatter;
    eta?: number | null;
    queue_position: number | null;
    queue_size: number | null;
    status: "complete" | "pending" | "error" | "generating" | "streaming" | null;
    scroll_to_output?: boolean;
    timer?: boolean;
    show_progress?: "full" | "minimal" | "hidden";
    message?: string | null;
    progress?: LoadingStatus["progress"] | null | undefined;
    variant?: "default" | "center";
    loading_text?: string;
    absolute?: boolean;
    translucent?: boolean;
    border?: boolean;
    autoscroll: boolean;
    validation_error?: string | null;
    show_validation_error?: boolean;
    type?: "input" | "output" | null;
    on_clear_status?: () => void;
}
interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import('svelte').ComponentConstructorOptions<Props>): import('svelte').SvelteComponent<Props, Events, Slots> & {
        $$bindings?: Bindings;
    } & Exports;
    (internal: unknown, props: Props & {
        $$events?: Events;
        $$slots?: Slots;
    }): Exports & {
        $set?: any;
        $on?: any;
    };
    z_$$bindings?: Bindings;
}
declare const Index: $$__sveltets_2_IsomorphicComponent<Props, {
    [evt: string]: CustomEvent<any>;
}, {
    'additional-loading-text': {};
    error: {};
}, {}, "">;
type Index = InstanceType<typeof Index>;
export default Index;
