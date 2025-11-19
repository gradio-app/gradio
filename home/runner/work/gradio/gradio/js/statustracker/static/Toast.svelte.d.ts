import type { ToastMessage } from "./types";
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
declare const Toast: $$__sveltets_2_IsomorphicComponent<{
    messages?: ToastMessage[];
    on_close: (id: number) => void;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type Toast = InstanceType<typeof Toast>;
export default Toast;
