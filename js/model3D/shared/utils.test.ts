import { describe, it, expect, vi, beforeEach } from "vitest";
import { isGaussianSplatPly } from "./utils";

const GAUSSIAN_SPLAT_HEADER = `ply
format binary_little_endian 1.0
element vertex 100
property float x
property float y
property float z
property float nx
property float ny
property float nz
property float f_dc_0
property float f_dc_1
property float f_dc_2
property float opacity
property float scale_0
property float scale_1
property float scale_2
property float rot_0
property float rot_1
property float rot_2
property float rot_3
end_header
`;

const POINTCLOUD_HEADER = `ply
format binary_little_endian 1.0
element vertex 1000
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
end_header
`;

const ASCII_POINTCLOUD_HEADER = `ply
format ascii 1.0
element vertex 50
property float x
property float y
property float z
end_header
`;

describe("isGaussianSplatPly", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it("returns true for Gaussian Splat PLY header", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(new TextEncoder().encode(GAUSSIAN_SPLAT_HEADER)),
		);
		expect(await isGaussianSplatPly("http://example.com/gs.ply")).toBe(true);
	});

	it("returns false for regular point cloud PLY header", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(new TextEncoder().encode(POINTCLOUD_HEADER)),
		);
		expect(await isGaussianSplatPly("http://example.com/pc.ply")).toBe(false);
	});

	it("returns false for ASCII point cloud PLY header", async () => {
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(new TextEncoder().encode(ASCII_POINTCLOUD_HEADER)),
		);
		expect(await isGaussianSplatPly("http://example.com/ascii.ply")).toBe(
			false,
		);
	});

	it("returns false when fetch fails", async () => {
		vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));
		expect(await isGaussianSplatPly("http://example.com/fail.ply")).toBe(false);
	});

	it("returns false for PLY with partial Gaussian Splat properties", async () => {
		const partial_gs = `ply
format binary_little_endian 1.0
element vertex 100
property float x
property float y
property float z
property float scale_0
property float scale_1
property float scale_2
property float opacity
end_header
`;
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(new TextEncoder().encode(partial_gs)),
		);
		expect(await isGaussianSplatPly("http://example.com/partial.ply")).toBe(
			false,
		);
	});

	it("returns false when header is missing end_header", async () => {
		const partial = `ply\nformat binary_little_endian 1.0\nelement vertex 100\n`;
		vi.spyOn(globalThis, "fetch").mockResolvedValue(
			new Response(new TextEncoder().encode(partial)),
		);
		expect(await isGaussianSplatPly("http://example.com/bad.ply")).toBe(false);
	});
});
