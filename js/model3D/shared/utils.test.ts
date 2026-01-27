import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";

// Test the checkGaussianSplatHeader logic directly
function checkGaussianSplatHeader(header: string): boolean {
	const headerLower = header.toLowerCase();
	const endHeaderIndex = headerLower.indexOf("end_header");
	if (endHeaderIndex === -1) {
		return true;
	}

	const plyHeader = header.substring(0, endHeaderIndex);
	const gaussianSplatProperties = ["f_dc_0", "scale_0", "opacity", "rot_0"];

	for (const prop of gaussianSplatProperties) {
		if (plyHeader.includes(prop)) {
			return true;
		}
	}

	return false;
}

describe("PLY file type detection", () => {
	test("should detect Gaussian Splat PLY with f_dc_0 property", () => {
		const header = `ply
format binary_little_endian 1.0
element vertex 100
property float x
property float y
property float z
property float f_dc_0
property float f_dc_1
property float opacity
end_header`;
		expect(checkGaussianSplatHeader(header)).toBe(true);
	});

	test("should detect Gaussian Splat PLY with scale_0 property", () => {
		const header = `ply
format binary_little_endian 1.0
element vertex 100
property float x
property float y
property float z
property float scale_0
property float scale_1
end_header`;
		expect(checkGaussianSplatHeader(header)).toBe(true);
	});

	test("should detect Gaussian Splat PLY with rot_0 property", () => {
		const header = `ply
format binary_little_endian 1.0
element vertex 100
property float x
property float y
property float z
property float rot_0
property float rot_1
end_header`;
		expect(checkGaussianSplatHeader(header)).toBe(true);
	});

	test("should detect regular point cloud PLY (vertices only)", () => {
		const header = `ply
format binary_little_endian 1.0
element vertex 272009
property double x
property double y
property double z
property uchar red
property uchar green
property uchar blue
end_header`;
		expect(checkGaussianSplatHeader(header)).toBe(false);
	});

	test("should detect regular point cloud PLY with normals", () => {
		const header = `ply
format ascii 1.0
element vertex 1000
property float x
property float y
property float z
property float nx
property float ny
property float nz
end_header`;
		expect(checkGaussianSplatHeader(header)).toBe(false);
	});

	test("should detect regular mesh PLY with faces", () => {
		const header = `ply
format binary_little_endian 1.0
element vertex 1000
property float x
property float y
property float z
element face 500
property list uchar int vertex_indices
end_header`;
		expect(checkGaussianSplatHeader(header)).toBe(false);
	});

	test("should default to Gaussian Splat for invalid PLY (no end_header)", () => {
		const header = `ply
format binary_little_endian 1.0
element vertex 100`;
		expect(checkGaussianSplatHeader(header)).toBe(true);
	});

	test("should handle empty header", () => {
		expect(checkGaussianSplatHeader("")).toBe(true);
	});
});
