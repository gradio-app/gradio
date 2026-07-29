import type { ShareData } from "@gradio/utils";
import type { I18nFormatter } from "@gradio/utils";
type $$ComponentProps = {
    formatter: (arg0: any) => Promise<string>;
    value: any;
    i18n: I18nFormatter;
    onshare?: (data: ShareData) => void;
    onerror?: (message: string) => void;
};
declare const ShareButton: import("svelte").Component<$$ComponentProps, {}, "">;
type ShareButton = ReturnType<typeof ShareButton>;
export default ShareButton;
