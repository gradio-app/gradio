import type { ToastMessage } from "./types";
interface Props {
    messages?: ToastMessage[];
    on_close: (id: number) => void;
}
declare const Toast: import("svelte").Component<Props, {}, "">;
type Toast = ReturnType<typeof Toast>;
export default Toast;
