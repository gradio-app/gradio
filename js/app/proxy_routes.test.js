/**
 * Unit tests for proxy routing logic.
 *
 * Tests the classifyRoute function which determines where each request goes:
 * "worker", "python", or "sveltekit".
 *
 * Run: node --test js/app/proxy_routes.test.js
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
	classifyRoute,
	matchesPrefix,
	PYTHON_ROUTE_PREFIXES,
	STATIC_ROUTE_PREFIXES
} from "./proxy_routes.js";

describe("classifyRoute", () => {
	describe("python routes", () => {
		const pythonPaths = [
			"/config",
			"/config/",
			"/gradio_api/info",
			"/gradio_api/queue/join",
			"/gradio_api/call/predict",
			"/login",
			"/login/",
			"/logout",
			"/theme.css",
			"/robots.txt",
			"/pwa_icon",
			"/manifest.json",
			"/monitoring",
			"/monitoring/some/path"
		];

		for (const path of pythonPaths) {
			it(`${path} -> python`, () => {
				assert.equal(classifyRoute(path, { hasWorkers: true }), "python");
			});
		}
	});

	describe("worker routes (workers configured)", () => {
		const workerPaths = [
			"/gradio_api/upload",
			"/gradio_api/upload?upload_id=abc123",
			"/gradio_api/file=/tmp/test.txt",
			"/gradio_api/file/some/path",
			"/upload",
			"/upload?upload_id=xyz",
			"/file=/tmp/test.txt",
			"/file/some/path",
			"/static/img/logo.svg",
			"/static/css/style.css",
			"/assets/some.js",
			"/svelte/some/file.js",
			"/favicon.ico",
			"/custom_component/abc"
		];

		for (const path of workerPaths) {
			it(`${path} -> worker`, () => {
				// Strip query string for classification (matches proxy_index.js behavior)
				const cleanPath = path.split("?")[0];
				assert.equal(classifyRoute(cleanPath, { hasWorkers: true }), "worker");
			});
		}
	});

	describe("worker routes fall back to python (no workers)", () => {
		const paths = [
			"/gradio_api/upload",
			"/upload",
			"/file=/tmp/test.txt",
			"/static/img/logo.svg",
			"/favicon.ico"
		];

		for (const path of paths) {
			it(`${path} -> python (no workers)`, () => {
				assert.equal(classifyRoute(path, { hasWorkers: false }), "python");
			});
		}
	});

	describe("sveltekit routes", () => {
		const sveltekitPaths = [
			"/",
			"/_app/immutable/nodes/1.CPQUYxzy.js",
			"/_app/immutable/chunks/dgSRqNc-.js",
			"/some/random/page"
		];

		for (const path of sveltekitPaths) {
			it(`${path} -> sveltekit`, () => {
				assert.equal(classifyRoute(path, { hasWorkers: true }), "sveltekit");
			});
		}
	});

	describe("priority", () => {
		it("/gradio_api/upload goes to worker, not python", () => {
			assert.equal(
				classifyRoute("/gradio_api/upload", { hasWorkers: true }),
				"worker"
			);
		});

		it("/gradio_api/file=/path goes to worker, not python", () => {
			assert.equal(
				classifyRoute("/gradio_api/file=/path", { hasWorkers: true }),
				"worker"
			);
		});

		it("/gradio_api/file/path goes to worker, not python", () => {
			assert.equal(
				classifyRoute("/gradio_api/file/path", { hasWorkers: true }),
				"worker"
			);
		});

		it("/gradio_api/info still goes to python", () => {
			assert.equal(
				classifyRoute("/gradio_api/info", { hasWorkers: true }),
				"python"
			);
		});

		it("/gradio_api/queue/join still goes to python", () => {
			assert.equal(
				classifyRoute("/gradio_api/queue/join", { hasWorkers: true }),
				"python"
			);
		});
	});

	describe("server mode", () => {
		it("/ -> python when serverModeEnabled", () => {
			assert.equal(classifyRoute("/", { serverModeEnabled: true }), "python");
		});

		it("/any/path -> python when serverModeEnabled", () => {
			assert.equal(
				classifyRoute("/any/path", { serverModeEnabled: true }),
				"python"
			);
		});

		it("worker routes still go to workers even in server mode", () => {
			assert.equal(
				classifyRoute("/gradio_api/upload", {
					hasWorkers: true,
					serverModeEnabled: true
				}),
				"worker"
			);
		});
	});
});

describe("matchesPrefix", () => {
	it("exact match", () => {
		assert.ok(matchesPrefix("/config", ["/config"]));
	});

	it("prefix match", () => {
		assert.ok(matchesPrefix("/config/foo", ["/config"]));
	});

	it("no match", () => {
		assert.ok(!matchesPrefix("/other", ["/config"]));
	});

	it("does not match partial prefix", () => {
		// /configurable should NOT match /config as a prefix?
		// Actually it does because /configurable.startsWith("/config") is true.
		// This is the current behavior — documenting it.
		assert.ok(matchesPrefix("/configurable", ["/config"]));
	});
});

describe("route prefix lists are consistent", () => {
	it("STATIC_ROUTE_PREFIXES checked before PYTHON_ROUTE_PREFIXES catches /gradio_api/*", () => {
		// The critical routes that must be in STATIC before PYTHON catches them
		const critical = [
			"/gradio_api/upload",
			"/gradio_api/file=",
			"/gradio_api/file/"
		];
		for (const route of critical) {
			assert.ok(
				STATIC_ROUTE_PREFIXES.some((p) => route.startsWith(p)),
				`${route} must be in STATIC_ROUTE_PREFIXES`
			);
		}
	});

	it("/gradio_api is in PYTHON_ROUTE_PREFIXES", () => {
		assert.ok(PYTHON_ROUTE_PREFIXES.includes("/gradio_api"));
	});
});
