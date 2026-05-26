import { describe, expect, test } from "vitest";

import {
	load_renderer_component,
	renderer_for_model3d_path
} from "./renderer-loader";

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
});
