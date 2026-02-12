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
declare const BlockLabel: $$__sveltets_2_IsomorphicComponent<{
    label?: string | null;
    Icon: any;
    show_label?: boolean;
    disable?: boolean;
    float?: boolean;
    rtl?: boolean;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type BlockLabel = InstanceType<typeof BlockLabel>;
export default BlockLabel;
