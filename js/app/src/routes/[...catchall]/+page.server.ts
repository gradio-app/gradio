export async function load({ request }): Promise<{
	server: string;
	port: string;
	local_dev_mode: string | undefined;
}> {
	const server = request.headers.get("x-gradio-server") || "127.0.0.1";
	const port = request.headers.get("x-gradio-port") || "7860";
	const local_dev_mode = process.env.GRADIO_LOCAL_DEV_MODE;

	return {
		server: server,
		port: port,
		local_dev_mode: local_dev_mode
	};
}
