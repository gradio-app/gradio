import type { ToastMessage } from "./types";
interface Props {
    type: ToastMessage["type"];
    messages?: ToastMessage[];
    expanded?: boolean;
    ontoggle?: () => void;
    onclose?: (id: number) => void;
}
declare const ToastContent: import("svelte").Component<Props, {}, "">;
type ToastContent = ReturnType<typeof ToastContent>;
export default ToastContent;
