import type { I18nFormatter } from "@gradio/utils";
import type { LoadingStatusArgs } from "./types";
interface Props {
    status: LoadingStatusArgs | null;
    i18n: I18nFormatter;
}
declare const LiveStatus: import("svelte").Component<Props, {}, "">;
type LiveStatus = ReturnType<typeof LiveStatus>;
export default LiveStatus;
