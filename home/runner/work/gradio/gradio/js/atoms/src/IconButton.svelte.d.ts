import { type Component } from "svelte";
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
type $$__sveltets_2_PropsWithChildren<Props, Slots> = Props & (Slots extends {
    default: any;
} ? Props extends Record<string, never> ? any : {
    children?: any;
} : {});
declare const IconButton: $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<{
    Icon: Component;
    label?: string;
    show_label?: boolean;
    pending?: boolean;
    size?: "x-small" | "small" | "large" | "medium";
    padded?: boolean;
    highlight?: boolean;
    disabled?: boolean;
    hasPopup?: boolean;
    color?: string;
    transparent?: boolean;
    background?: string;
    border?: string;
}, {
    default: {};
}>, {
    click: PointerEvent;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}, {}, string>;
type IconButton = InstanceType<typeof IconButton>;
export default IconButton;
