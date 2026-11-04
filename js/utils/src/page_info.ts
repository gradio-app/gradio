export interface PageInfo {
	scrollTop: number;
	offsetTop: number;
	clientHeight: number;
}

const listeners = new Set<(info: PageInfo) => void>();

/**
 * Subscribe to the embedding page's scroll/resize info. iframe-resizer keeps a
 * single `getPageInfo` callback, so every consumer shares this one.
 */
export function on_page_info(listener: (info: PageInfo) => void): () => void {
	const parent = window.parentIFrame;
	if (!parent) return () => {};
	listeners.add(listener);
	// Re-registering also makes the parent send the current info right away.
	parent.getPageInfo((info) => listeners.forEach((l) => l(info)));
	return () => {
		listeners.delete(listener);
		if (!listeners.size) window.parentIFrame?.getPageInfo(false);
	};
}
