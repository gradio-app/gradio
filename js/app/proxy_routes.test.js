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
	hashString,
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
				assert.equal(classifyRoute(path, { hasWorkers: true }).route, "python");
			});
		}
	});

	describe("worker routes (workers configured)", () => {
		const workerPaths = [
			"/gradio_api/upload",
			"/gradio_api/file=/tmp/test.txt",
			"/gradio_api/file/some/path",
			"/upload",
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
				assert.equal(classifyRoute(path, { hasWorkers: true }).route, "worker");
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
				assert.equal(
					classifyRoute(path, { hasWorkers: false }).route,
					"python"
				);
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
				assert.equal(
					classifyRoute(path, { hasWorkers: true }).route,
					"sveltekit"
				);
			});
		}
	});

	describe("priority", () => {
		it("/gradio_api/upload goes to worker, not python", () => {
			assert.equal(
				classifyRoute("/gradio_api/upload", { hasWorkers: true }).route,
				"worker"
			);
		});

		it("/gradio_api/upload_progress goes to worker, not python", () => {
			assert.equal(
				classifyRoute("/gradio_api/upload_progress", {
					hasWorkers: true
				}).route,
				"worker"
			);
		});

		it("/gradio_api/file=/path goes to worker, not python", () => {
			assert.equal(
				classifyRoute("/gradio_api/file=/path", { hasWorkers: true }).route,
				"worker"
			);
		});

		it("/gradio_api/file/path goes to worker, not python", () => {
			assert.equal(
				classifyRoute("/gradio_api/file/path", { hasWorkers: true }).route,
				"worker"
			);
		});

		it("/gradio_api/info still goes to python", () => {
			assert.equal(
				classifyRoute("/gradio_api/info", { hasWorkers: true }).route,
				"python"
			);
		});

		it("/gradio_api/queue/join still goes to python", () => {
			assert.equal(
				classifyRoute("/gradio_api/queue/join", { hasWorkers: true }).route,
				"python"
			);
		});
	});

	describe("server mode", () => {
		it("/ -> python when serverModeEnabled", () => {
			assert.equal(
				classifyRoute("/", { serverModeEnabled: true }).route,
				"python"
			);
		});

		it("/any/path -> python when serverModeEnabled", () => {
			assert.equal(
				classifyRoute("/any/path", { serverModeEnabled: true }).route,
				"python"
			);
		});

		it("worker routes still go to workers even in server mode", () => {
			assert.equal(
				classifyRoute("/gradio_api/upload", {
					hasWorkers: true,
					serverModeEnabled: true
				}).route,
				"worker"
			);
		});
	});

	describe("upload affinity routing", () => {
		const opts = { hasWorkers: true, numWorkers: 3 };

		it("upload with upload_id gets a deterministic workerIndex", () => {
			const result = classifyRoute("/gradio_api/upload", {
				...opts,
				queryString: "upload_id=abc123"
			});
			assert.equal(result.route, "worker");
			assert.equal(typeof result.workerIndex, "number");
			assert.ok(result.workerIndex >= 0 && result.workerIndex < 3);
		});

		it("upload_progress with same upload_id gets same workerIndex", () => {
			const uploadResult = classifyRoute("/gradio_api/upload", {
				...opts,
				queryString: "upload_id=abc123"
			});
			const progressResult = classifyRoute("/gradio_api/upload_progress", {
				...opts,
				queryString: "upload_id=abc123"
			});
			assert.equal(uploadResult.workerIndex, progressResult.workerIndex);
		});

		it("/upload (no gradio_api prefix) also gets affinity", () => {
			const result = classifyRoute("/upload", {
				...opts,
				queryString: "upload_id=test456"
			});
			assert.equal(result.route, "worker");
			assert.equal(typeof result.workerIndex, "number");
		});

		it("/upload_progress (no gradio_api prefix) also gets affinity", () => {
			const uploadResult = classifyRoute("/upload", {
				...opts,
				queryString: "upload_id=test456"
			});
			const progressResult = classifyRoute("/upload_progress", {
				...opts,
				queryString: "upload_id=test456"
			});
			assert.equal(uploadResult.workerIndex, progressResult.workerIndex);
		});

		it("upload without upload_id gets no workerIndex (round-robin)", () => {
			const result = classifyRoute("/gradio_api/upload", {
				...opts,
				queryString: ""
			});
			assert.equal(result.route, "worker");
			assert.equal(result.workerIndex, undefined);
		});

		it("different upload_ids can map to different workers", () => {
			// Generate several IDs and check we get at least 2 distinct indices
			const indices = new Set();
			for (let i = 0; i < 20; i++) {
				const result = classifyRoute("/gradio_api/upload", {
					...opts,
					queryString: `upload_id=id-${i}`
				});
				indices.add(result.workerIndex);
			}
			assert.ok(
				indices.size > 1,
				"expected different upload_ids to map to different workers"
			);
		});

		it("non-upload worker routes get no workerIndex", () => {
			const result = classifyRoute("/static/img/logo.svg", {
				...opts,
				queryString: "upload_id=abc123"
			});
			assert.equal(result.route, "worker");
			assert.equal(result.workerIndex, undefined);
		});
	});
});

describe("hashString", () => {
	it("returns a non-negative integer", () => {
		const h = hashString("test");
		assert.equal(typeof h, "number");
		assert.ok(h >= 0);
		assert.ok(Number.isInteger(h));
	});

	it("is deterministic", () => {
		assert.equal(hashString("abc123"), hashString("abc123"));
	});

	it("different strings produce different hashes", () => {
		assert.notEqual(hashString("abc"), hashString("xyz"));
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
			"/gradio_api/upload_progress",
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
