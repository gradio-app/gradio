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
	const origin =
		current_url && root_url.hostname === current_url.hostname
			? current_url.origin
			: root_url.origin;

	return new URL(`${root_path}${normalized_path}`, origin);
}
