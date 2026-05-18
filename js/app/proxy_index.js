import http from "node:http";
import process from "node:process";
import httpProxy from "http-proxy";
import { handler } from "./handler.js";
import { classifyRoute } from "./proxy_routes.js";

const host = process.env.HOST || "0.0.0.0";
const port = parseInt(process.env.PORT || "7860", 10);

const pythonHost = process.env.GRADIO_PYTHON_HOST || "127.0.0.1";
const pythonPort = parseInt(process.env.GRADIO_PYTHON_PORT || "7861", 10);
const serverModeEnabled = process.env.GRADIO_SERVER_MODE_ENABLED;

const staticWorkerPorts = process.env.GRADIO_STATIC_WORKER_PORTS
	? process.env.GRADIO_STATIC_WORKER_PORTS.split(",")
			.map((p) => parseInt(p.trim(), 10))
			.filter((p) => !isNaN(p))
	: [];

let workerIndex = 0;

const pythonTarget = `http://${pythonHost}:${pythonPort}`;

const proxy = httpProxy.createProxyServer({
	// Don't modify the path
	ignorePath: false,
	// Forward the original host header
	changeOrigin: false
});

proxy.on("error", (err, req, res) => {
	console.error(`[gradio-proxy] Proxy error for ${req.url}:`, err.message);
	if (res.writeHead && !res.headersSent) {
		res.writeHead(502, { "Content-Type": "text/plain" });
		res.end("Bad Gateway");
	}
});

const server = http.createServer((req, res) => {
	const url = req.url || "/";
	const path = url.split("?")[0];
	const route = classifyRoute(path, {
		hasWorkers: staticWorkerPorts.length > 0,
		serverModeEnabled: !!serverModeEnabled
	});

	if (route === "worker") {
		const workerPort =
			staticWorkerPorts[workerIndex % staticWorkerPorts.length];
		workerIndex = (workerIndex + 1) % staticWorkerPorts.length;
		proxy.web(req, res, {
			target: `http://${pythonHost}:${workerPort}`
		});
		return;
	}

	if (route === "python") {
		proxy.web(req, res, { target: pythonTarget });
		return;
	}

	// SvelteKit handler (SSR + immutable assets)
	// Inject headers that SvelteKit's page.server.ts expects to find the Python backend.
	// x-gradio-server is for internal Node->Python fetches (always http).
	// x-gradio-original-url is the public-facing URL the browser uses,
	// so it must respect x-forwarded-proto (e.g. https on HF Spaces).
	const publicScheme = (req.headers["x-forwarded-proto"] || "http")
		.split(",")[0]
		.trim();
	const publicHost =
		req.headers["x-forwarded-host"] || req.headers.host || `${host}:${port}`;
	req.headers["x-gradio-server"] = pythonTarget;
	req.headers["x-gradio-port"] = String(pythonPort);
	req.headers["x-gradio-mounted-path"] = "/";
	req.headers["x-gradio-original-url"] = `${publicScheme}://${publicHost}`;
	handler(req, res);
});

server.listen({ host, port }, () => {
	console.log(`[gradio-proxy] Listening on http://${host}:${port}`);
	console.log(`[gradio-proxy] Python backend: ${pythonTarget}`);
	if (staticWorkerPorts.length > 0) {
		console.log(
			`[gradio-proxy] Static workers: ${staticWorkerPorts.join(", ")}`
		);
	}
});

function graceful_shutdown() {
	server.closeIdleConnections();
	server.close(() => {
		proxy.close();
		process.exit(0);
	});
	setTimeout(() => server.closeAllConnections(), 30000);
}

process.on("SIGTERM", graceful_shutdown);
process.on("SIGINT", graceful_shutdown);

export { host, port, server };
