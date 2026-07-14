export function resolve_current_origin_url(
	root: string,
	path: string,
	current_location?: string
): URL {
	const browser_location =
		current_location ??
		(typeof window !== "undefined" ? window.location.href : undefined);
	const root_url = browser_location
		? new URL(root || "/", browser_location)
		: new URL(root);
	const current_url = browser_location ? new URL(browser_location) : null;
	const root_path = root_url.pathname.replace(/\/$/, "");
	const normalized_path = path.startsWith("/") ? path : `/${path}`;
	// Rewriting the URL to the current page's origin is only safe when the
	// page itself is served by the gradio server (directly or through a
	// reverse proxy that changes the public port or protocol, which is when
	// config.root can carry a stale internal origin). A page that merely
	// shares the backend's hostname — e.g. a page on localhost:3000 embedding
	// a <gradio-app> served from localhost:7860, or the vite dev server —
	// must keep the root's own origin. Callers assert the former either by
	// passing `current_location` explicitly or via the `window.gradio_config`
	// global, which only exists on pages rendered by the gradio server.
	const page_served_by_gradio =
		current_location !== undefined ||
		(typeof window !== "undefined" &&
			(window as any).gradio_config !== undefined);
	const origin =
		current_url &&
		root_url.hostname === current_url.hostname &&
		page_served_by_gradio
			? current_url.origin
			: root_url.origin;

	return new URL(`${root_path}${normalized_path}`, origin);
}
