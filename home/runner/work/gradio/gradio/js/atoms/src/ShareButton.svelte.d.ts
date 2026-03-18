import type { ShareData } from "@gradio/utils";
import type { I18nFormatter } from "@gradio/utils";
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
declare const ShareButton: $$__sveltets_2_IsomorphicComponent<{
    formatter: (arg0: any) => Promise<string>;
    value: any;
    i18n: I18nFormatter;
}, {
    share: CustomEvent<ShareData>;
    error: CustomEvent<string>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}, {}, string>;
type ShareButton = InstanceType<typeof ShareButton>;
export default ShareButton;
