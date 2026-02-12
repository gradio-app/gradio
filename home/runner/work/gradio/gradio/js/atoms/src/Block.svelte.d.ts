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
declare const Block: $$__sveltets_2_IsomorphicComponent<$$__sveltets_2_PropsWithChildren<{
    height?: number | string | undefined;
    min_height?: number | string | undefined;
    max_height?: number | string | undefined;
    width?: number | string | undefined;
    elem_id?: string;
    elem_classes?: string[];
    variant?: "solid" | "dashed" | "none";
    border_mode?: "base" | "focus" | "contrast";
    padding?: boolean;
    type?: "normal" | "fieldset";
    test_id?: string | undefined;
    explicit_call?: boolean;
    container?: boolean;
    visible?: boolean | "hidden";
    allow_overflow?: boolean;
    overflow_behavior?: "visible" | "auto";
    scale?: number | null;
    min_width?: number;
    flex?: boolean;
    resizable?: boolean;
    rtl?: boolean;
    fullscreen?: boolean;
}, {
    default: {};
}>, {
    [evt: string]: CustomEvent<any>;
}, {
    default: {};
}, {}, string>;
type Block = InstanceType<typeof Block>;
export default Block;
