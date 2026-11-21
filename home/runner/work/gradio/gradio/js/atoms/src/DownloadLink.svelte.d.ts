import type { HTMLAnchorAttributes } from "svelte/elements";
import type { Snippet } from "svelte";
interface DownloadLinkAttributes extends Omit<HTMLAnchorAttributes, "target" | "children"> {
    download?: HTMLAnchorAttributes["download"] | null;
    children?: Snippet;
}
declare const DownloadLink: import("svelte").Component<DownloadLinkAttributes, {}, "">;
type DownloadLink = ReturnType<typeof DownloadLink>;
export default DownloadLink;
