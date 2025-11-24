export default IconButtonWrapper;
type IconButtonWrapper = SvelteComponent<$$__sveltets_2_PropsWithChildren<{
    top_panel?: boolean | undefined;
    display_top_corner?: boolean | undefined;
    show_background?: boolean | undefined;
}, {
    default: {};
}>, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}> & {
    $$bindings?: string | undefined;
};
declare const IconButtonWrapper: $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<{
    top_panel?: boolean | undefined;
    display_top_corner?: boolean | undefined;
    show_background?: boolean | undefined;
}, {
    default: {};
}>, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}, {}, string>;
type $$__sveltets_2_PropsWithChildren<Props, Slots> = Props & (Slots extends {
    default: any;
} ? Props extends Record<string, never> ? any : {
    children?: any;
} : {});
interface $$__sveltets_2_IsomorphicComponent<Props extends Record<string, any> = any, Events extends Record<string, any> = any, Slots extends Record<string, any> = any, Exports = {}, Bindings = string> {
    new (options: import("svelte").ComponentConstructorOptions<Props>): import("svelte").SvelteComponent<Props, Events, Slots> & {
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
