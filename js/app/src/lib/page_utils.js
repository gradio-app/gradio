/**
 * Return the Gradio page path represented by a request URL.
 *
 * @param {string} pathname
 * @param {string} root_url
 * @returns {string}
 */
export function get_current_page(pathname, root_url) {
	const strip_slashes = (path) => path.replace(/^\/+|\/+$/g, "");
	const root_path = strip_slashes(new URL(root_url).pathname);
	const url_path = strip_slashes(pathname);

	if (!root_path) return url_path;
	if (url_path === root_path) return "";
	if (!url_path.startsWith(`${root_path}/`)) return "";
	return url_path.slice(root_path.length + 1);
}
