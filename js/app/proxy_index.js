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
	// Suppress ECONNRESET from client-initiated disconnects
	if (err.code === "ECONNRESET") return;
	console.error(`[gradio-proxy] Proxy error for ${req.url}:`, err.message);
	if (res.writeHead && !res.headersSent) {
		res.writeHead(502, { "Content-Type": "text/plain" });
		res.end("Bad Gateway");
	}
});

// When the browser closes an SSE/streaming connection, propagate the
// disconnect to Python so that `request.is_disconnected()` returns True.
// http-proxy only listens for the deprecated `aborted` event, which
// doesn't fire reliably in newer Node versions. We listen on `res`
// (the outgoing response to the client) because for GET/SSE requests
// `req` closes immediately after the empty body is consumed — before
// the proxy response even arrives.
proxy.on("proxyRes", (proxyRes, req, res) => {
	res.on("close", () => {
		if (!res.writableEnded) {
			proxyRes.destroy();
		}
	});
});

const server = http.createServer((req, res) => {
	const url = req.url || "/";
	const qmark = url.indexOf("?");
	const path = qmark === -1 ? url : url.substring(0, qmark);
	const queryString = qmark === -1 ? "" : url.substring(qmark + 1);
	const { route, workerIndex: affinityIndex } = classifyRoute(path, {
		hasWorkers: staticWorkerPorts.length > 0,
		serverModeEnabled: !!serverModeEnabled,
		numWorkers: staticWorkerPorts.length,
		queryString
	});

	if (route === "worker") {
		let targetPort;
		if (affinityIndex !== undefined) {
			// Affinity routing: upload_id hashed to a specific worker
			targetPort = staticWorkerPorts[affinityIndex];
		} else {
			// Round-robin for non-affinity static routes
			targetPort = staticWorkerPorts[workerIndex % staticWorkerPorts.length];
			workerIndex = (workerIndex + 1) % staticWorkerPorts.length;
		}
		proxy.web(req, res, {
			target: `http://${pythonHost}:${targetPort}`
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
