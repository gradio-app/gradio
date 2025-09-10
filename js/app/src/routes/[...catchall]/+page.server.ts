import { dev } from "$app/environment";

export async function load({ request }: { request: Request }): Promise<{
	server: string;
	port: string;
	local_dev_mode: string | undefined;
	accept_language: string;
}> {
	const server =
		request.headers.get("x-gradio-server") || "http://127.0.0.1:7860";
	const port = request.headers.get("x-gradio-port") || "7860";
	const local_dev_mode =
		request.headers.get("x-gradio-local-dev-mode") || dev ? "true" : undefined;
	const accept_language = request.headers.get("accept-language") || "en";

	return {
		server: server,
		port: port,
		local_dev_mode: local_dev_mode,
		accept_language: accept_language
	};
}
