import { dev } from "$app/environment";

export async function load({ request }: { request: Request }): Promise<{
	server: string;
	port: string;
	local_dev_mode: string | undefined;
	accept_language: string;
	root_url: string;
	mount_path: string;
	cookie: string | null;
	auth_required: boolean;
}> {
	const server =
		request.headers.get("x-gradio-server") || "http://127.0.0.1:7860";
	const port = request.headers.get("x-gradio-port") || "7860";
	const local_dev_mode =
		request.headers.get("x-gradio-local-dev-mode") || dev ? "true" : undefined;
	const accept_language = request.headers.get("accept-language") || "en";
	const mount_path = request.headers.get("x-gradio-mounted-path") || "/";
	const real_url = new URL(
		request.headers.get("x-gradio-original-url") || server
	).origin;
	const cookie = request.headers.get("cookie");

	// Check if auth is required by making a request to /config
	// This runs only on the server, so it's safe to make this request
	let auth_required = false;
	try {
		const configResponse = await fetch(`${server}/config`, {
			headers: {
				...(cookie ? { Cookie: cookie } : {})
			}
		});
		if (configResponse.status === 401) {
			auth_required = true;
		}
	} catch (e) {
		// If we can't reach the server, we'll find out in the universal load
	}

	// Remove trailing slash from root_url to avoid double slashes in URLs
	const root_url = new URL(mount_path, real_url).href.replace(/\/$/, "");

	return {
		server: server,
		root_url: root_url,
		mount_path: mount_path,
		port: port,
		local_dev_mode: local_dev_mode,
		accept_language: accept_language,
		cookie: cookie,
		auth_required: auth_required
	};
}
