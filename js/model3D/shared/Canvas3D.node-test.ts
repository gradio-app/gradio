import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const source = readFileSync(
	resolve(dirname(fileURLToPath(import.meta.url)), "Canvas3D.svelte"),
	"utf-8"
);

describe("Canvas3D point cloud dependencies", () => {
	test("loads Babylon point-cloud classes dynamically", () => {
		expect(source).not.toMatch(
			/import\s+\{[^}]*\b(?:Color4|PointsCloudSystem|Vector3)\b[^}]*\}\s+from\s+["']@babylonjs\/core["']/
		);
		expect(source).toMatch(/await\s+import\(\s*["']@babylonjs\/core["']\s*\)/);
	});
});
