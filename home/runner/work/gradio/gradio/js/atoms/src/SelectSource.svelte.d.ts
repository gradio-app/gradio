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
declare const SelectSource: $$__sveltets_2_IsomorphicComponent<{
    sources: Partial<"clipboard" | "upload" | "microphone" | "webcam" | null>[];
    active_source: Partial<"clipboard" | "upload" | "microphone" | "webcam" | null>;
    handle_clear?: () => void;
    handle_select?: (source_type: Partial<"clipboard" | "upload" | "microphone" | "webcam" | null>) => void;
}, {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type SelectSource = InstanceType<typeof SelectSource>;
export default SelectSource;
