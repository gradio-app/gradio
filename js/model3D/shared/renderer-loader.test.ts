import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

import {
	load_renderer_component,
	renderer_for_model3d_path
} from "./renderer-loader";

const canvas3d_ply_source = readFileSync(
	resolve(dirname(fileURLToPath(import.meta.url)), "Canvas3DPLY.svelte"),
	"utf-8"
);

function deferred<T>(): {
	promise: Promise<T>;
	resolve: (value: T) => void;
} {
	let resolve!: (value: T) => void;
	const promise = new Promise<T>((res) => {
		resolve = res;
	});
	return { promise, resolve };
}

function flushPromises(): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, 0));
}

describe("renderer_for_model3d_path", () => {
	test("routes PLY files to the PLY renderer", () => {
		expect(renderer_for_model3d_path("model.ply")).toBe("ply");
	});

	test("routes splat files to the Gaussian splat renderer", () => {
		expect(renderer_for_model3d_path("model.splat")).toBe("splat");
	});

	test("routes other files to the mesh renderer", () => {
		expect(renderer_for_model3d_path("model.gltf")).toBe("mesh");
	});
});

describe("load_renderer_component", () => {
	test("ignores stale component loads after cleanup", async () => {
		const ply = deferred<string>();
		const assigned: string[] = [];
		const cleanup = load_renderer_component(
			"ply",
			{
				mesh: async () => "mesh-component",
				ply: () => ply.promise,
				splat: async () => "splat-component"
			},
			(renderer, component) => {
				assigned.push(`${renderer}:${component}`);
			}
		);

		cleanup();
		ply.resolve("ply-component");
		await ply.promise;
		await Promise.resolve();

		expect(assigned).toEqual([]);
	});

	test("handles component loader rejections", async () => {
		const error = new Error("chunk failed");
		const assigned: string[] = [];
		const errors: unknown[] = [];

		load_renderer_component(
			"ply",
			{
				mesh: async () => "mesh-component",
				ply: () => Promise.reject(error),
				splat: async () => "splat-component"
			},
			(renderer, component) => {
				assigned.push(`${renderer}:${component}`);
			},
			(error) => {
				errors.push(error);
			}
		);

		await flushPromises();

		expect(assigned).toEqual([]);
		expect(errors).toEqual([error]);
	});
});

describe("Canvas3DPLY renderer loaders", () => {
	test("uses shared dynamic renderer loader functions", () => {
		expect(canvas3d_ply_source).toContain(`from "./renderer-loader"`);
		expect(canvas3d_ply_source).toContain("loadCanvas3D");
		expect(canvas3d_ply_source).toContain("loadCanvas3DGS");
		expect(canvas3d_ply_source).not.toMatch(
			/function\s+loadCanvas3D(?:GS)?\s*\(/
		);
	});

	test("invalidates pending loads during effect cleanup", () => {
		const cleanup = canvas3d_ply_source.match(
			/\$effect\(\(\) => \{[\s\S]*?void load_renderer\(load_url, currentToken\);\s*return \(\) => \{([\s\S]*?)\};\s*\}\);/
		)?.[1];

		expect(cleanup).toBeDefined();
		expect(cleanup ?? "").toContain("loadToken++");
		expect(cleanup ?? "").toContain("revoke_fallback_url()");
	});
});
