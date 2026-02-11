import type { CustomButton as CustomButtonType } from "@gradio/utils";
import type { Snippet } from "svelte";
type $$ComponentProps = {
    top_panel?: boolean;
    display_top_corner?: boolean;
    show_background?: boolean;
    buttons?: (string | CustomButtonType)[] | null;
    on_custom_button_click?: ((id: number) => void) | null;
    children?: Snippet;
};
declare const IconButtonWrapper: import("svelte").Component<$$ComponentProps, {}, "">;
type IconButtonWrapper = ReturnType<typeof IconButtonWrapper>;
export default IconButtonWrapper;
