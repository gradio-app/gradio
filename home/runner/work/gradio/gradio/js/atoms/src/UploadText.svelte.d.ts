import type { I18nFormatter } from "@gradio/utils";
type $$ComponentProps = {
    type?: "video" | "image" | "audio" | "file" | "csv" | "clipboard" | "gallery";
    i18n: I18nFormatter;
    message?: string | undefined;
    mode?: "full" | "short";
    hovered?: boolean;
    placeholder?: string | undefined;
};
declare const UploadText: import("svelte").Component<$$ComponentProps, {}, "">;
type UploadText = ReturnType<typeof UploadText>;
export default UploadText;
