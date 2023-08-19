(function () {
	"use strict";
	function g(t) {
		const e = [];
		for (const [a, s] of Object.entries(t)) e.push([a, s]);
		return e;
	}
	function d(t) {
		let e = "";
		for (let a = 0; a < t.length; a++) e += String.fromCharCode(t[a]);
		return e;
	}
	function h(t) {
		return (t = t.map(([e, a]) => [d(e), d(a)])), Object.fromEntries(t);
	}
	const _ = (t, e) =>
		new Promise((a, s) => {
			async function r() {
				return { type: "http.request", body: e.body, more_body: !1 };
			}
			let l,
				u,
				c = new Uint8Array();
			async function m(n) {
				if (
					((n = Object.fromEntries(n.toJs())),
					console.debug("toClient", n),
					n.type === "http.response.start")
				)
					(l = n.status), (u = h(n.headers));
				else if (n.type === "http.response.body") {
					if (((c = new Uint8Array([...c, ...n.body])), !n.more_body)) {
						const y = { status: l, headers: u, body: c };
						console.debug("HTTP response", y), a(y);
					}
				} else throw new Error(`Unhandled ASGI event: ${n.type}`);
			}
			const w = {
				type: "http",
				asgi: { version: "3.0", spec_version: "2.1" },
				http_version: "1.1",
				scheme: "http",
				method: e.method,
				path: e.path,
				query_string: e.query_string,
				root_path: "",
				headers: g(e.headers)
			};
			t(w, r, m);
		});
	importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.2/full/pyodide.js");
	let o, i, p;
	async function b(t) {
		console.debug("Loading Pyodide."),
			(o = await loadPyodide()),
			console.debug("Pyodide is loaded."),
			console.debug("Loading micropip"),
			await o.loadPackage("micropip");
		const e = o.pyimport("micropip");
		console.debug("micropip is loaded.");
		const a = [t.gradioWheelUrl, t.gradioClientWheelUrl];
		console.debug("Loading Gradio wheels.", a),
			await e.add_mock_package("ffmpy", "0.3.0"),
			await e.add_mock_package("orjson", "3.8.12"),
			await e.add_mock_package("aiohttp", "3.8.4"),
			await e.add_mock_package("multidict", "4.7.6"),
			await o.loadPackage(["ssl", "distutils", "setuptools"]),
			await e.install.callKwargs(a, { keep_going: !0 }),
			console.debug("Gradio wheels are loaded."),
			console.debug("Install packages.", t.requirements),
			await e.install.callKwargs(t.requirements, { keep_going: !0 }),
			console.debug("Packages are installed."),
			console.debug("Import gradio package."),
			await o.runPythonAsync("import gradio"),
			console.debug("gradio package is imported."),
			console.debug("Define a ASGI wrapper function."),
			await o.runPythonAsync(`
# Based on Shiny's App.call_pyodide().
# https://github.com/rstudio/py-shiny/blob/v0.3.3/shiny/_app.py#L224-L258
async def _call_asgi_app_from_js(scope, receive, send):
	# TODO: Pretty sure there are objects that need to be destroy()'d here?
	scope = scope.to_py()

	# ASGI requires some values to be byte strings, not character strings. Those are
	# not that easy to create in JavaScript, so we let the JS side pass us strings
	# and we convert them to bytes here.
	if "headers" in scope:
			# JS doesn't have \`bytes\` so we pass as strings and convert here
			scope["headers"] = [
					[value.encode("latin-1") for value in header]
					for header in scope["headers"]
			]
	if "query_string" in scope and scope["query_string"]:
			scope["query_string"] = scope["query_string"].encode("latin-1")
	if "raw_path" in scope and scope["raw_path"]:
			scope["raw_path"] = scope["raw_path"].encode("latin-1")

	async def rcv():
			event = await receive()
			return event.to_py()

	async def snd(event):
			await send(event)

	app = gradio.wasm_utils.get_registered_app()
	if app is None:
		raise RuntimeError("Gradio app has not been launched.")

	await app(scope, rcv, snd)
`),
			(p = o.globals.get("_call_asgi_app_from_js")),
			console.debug("The ASGI wrapper function is defined."),
			console.debug("Mock async libraries."),
			await o.runPythonAsync(`
async def mocked_anyio_to_thread_run_sync(func, *args, cancellable=False, limiter=None):
	return func(*args)

import anyio.to_thread
anyio.to_thread.run_sync = mocked_anyio_to_thread_run_sync
	`),
			console.debug("Async libraries are mocked."),
			console.debug("Set matplotlib backend."),
			await o.runPythonAsync(`
import matplotlib
matplotlib.use("agg")
`),
			console.debug("matplotlib backend is set.");
	}
	self.onmessage = async (t) => {
		const e = t.data;
		console.debug("worker.onmessage", e);
		const a = t.ports[0];
		try {
			if (e.type === "init") {
				i = b({
					gradioWheelUrl: e.data.gradioWheelUrl,
					gradioClientWheelUrl: e.data.gradioClientWheelUrl,
					requirements: e.data.requirements
				});
				const s = { type: "reply:success", data: null };
				a.postMessage(s);
			}
			if (i == null) throw new Error("Pyodide Initialization is not started.");
			switch ((await i, e.type)) {
				case "echo": {
					const s = { type: "reply:success", data: e.data };
					a.postMessage(s);
					break;
				}
				case "run-python": {
					const s = {
						type: "reply:success",
						data: { result: await o.runPythonAsync(e.data.code) }
					};
					a.postMessage(s);
					break;
				}
				case "http-request": {
					const s = e.data.request,
						r = { type: "reply:success", data: { response: await _(p, s) } };
					a.postMessage(r);
					break;
				}
			}
		} catch (s) {
			const r = { type: "reply:error", error: s };
			a.postMessage(r);
		}
	};
})();
//# sourceMappingURL=webworker-b9cd9569.js.map
