import { test, describe, expect } from "vitest";
import { GaussianSplattingMesh } from "@babylonjs/core/Meshes/GaussianSplatting/gaussianSplattingMesh";

import {
	has_drawable_geometry,
	obj_point_cloud_to_ply,
	resolve_obj_point_cloud
} from "./obj";
import { parse_ply_header } from "./ply";

const POINT_CLOUD_OBJ = `# Created by Open3D
o output_mesh
v -1 -1 0 1 0 0
v 1 -1 0 0 1 0
v 0 1 0 0 0 1
`;

const FACED_OBJ = `v -1 -1 0
v 1 -1 0
v 0 1 0
f 1 2 3
`;

const body_of = (ply: Uint8Array): DataView =>
	new DataView(ply.buffer, ply.byteOffset + parse_ply_header(ply)!.byte_length);

describe("obj_point_cloud_to_ply", () => {
	test("writes the vertices as a binary point-cloud PLY", () => {
		const ply = obj_point_cloud_to_ply(POINT_CLOUD_OBJ)!;
		const header = parse_ply_header(ply)!;

		expect(header.format).toBe("binary_little_endian");
		expect(header.elements).toEqual([
			{
				name: "vertex",
				count: 3,
				properties: [
					{ kind: "scalar", name: "x", type: "float" },
					{ kind: "scalar", name: "y", type: "float" },
					{ kind: "scalar", name: "z", type: "float" },
					{ kind: "scalar", name: "red", type: "uchar" },
					{ kind: "scalar", name: "green", type: "uchar" },
					{ kind: "scalar", name: "blue", type: "uchar" }
				]
			}
		]);

		const body = body_of(ply);
		expect(body.getFloat32(0, true)).toBe(-1);
		expect(body.getFloat32(4, true)).toBe(-1);
		expect(body.getFloat32(8, true)).toBe(0);
		expect(ply.byteLength).toBe(header.byte_length + 3 * 15);

		// Third vertex, to show the rows advance by the full stride.
		expect(body.getFloat32(30, true)).toBe(0);
		expect(body.getFloat32(34, true)).toBe(1);
	});

	test("scales colours the way Babylon's OBJ parser does", () => {
		// Anything above 1 is read as 0-255 and the rest as 0-1, since an OBJ
		// vertex colour has no declared range and files are written both ways.
		const ply = obj_point_cloud_to_ply("v 0 0 0 1 0.5 0\nv 1 1 1 255 128 0\n")!;
		const body = body_of(ply);

		expect([body.getUint8(12), body.getUint8(13), body.getUint8(14)]).toEqual([
			255, 128, 0
		]);
		expect([body.getUint8(27), body.getUint8(28), body.getUint8(29)]).toEqual([
			255, 128, 0
		]);
	});

	test("gives a vertex with no colour the grey Babylon would use", () => {
		const body = body_of(obj_point_cloud_to_ply("v 0 0 0\n")!);

		expect([body.getUint8(12), body.getUint8(13), body.getUint8(14)]).toEqual([
			128, 128, 128
		]);
	});

	test("returns null for a file that has faces", () => {
		// Points would paper over a mesh that failed to load for some other
		// reason, so only a face-less file is converted.
		expect(obj_point_cloud_to_ply(FACED_OBJ)).toBe(null);
	});

	test("returns null when there are no vertices", () => {
		expect(obj_point_cloud_to_ply("# Created by Open3D\no output_mesh\n")).toBe(
			null
		);
	});

	test("returns null when a vertex line has no usable coordinates", () => {
		expect(obj_point_cloud_to_ply("v 0 0 0\nv nan nan nan\n")).toBe(null);
	});
});

describe("what Babylon makes of the converted output", () => {
	test("reads the point cloud", () => {
		// Babylon's PLY reader takes one narrow dialect, so the bytes being right
		// on their own says nothing about it accepting them.
		const ply = obj_point_cloud_to_ply(POINT_CLOUD_OBJ)!;

		expect(GaussianSplattingMesh.ParseHeader(ply.buffer)?.rowVertexLength).toBe(
			3 * 4 + 3
		);
	});
});

describe("has_drawable_geometry", () => {
	const mesh = (vertices: number): { getTotalVertices(): number } => ({
		getTotalVertices: () => vertices
	});

	test("is false for the empty mesh a face-less OBJ leaves behind", () => {
		expect(has_drawable_geometry([mesh(0)])).toBe(false);
	});

	test("is false when nothing loaded at all", () => {
		expect(has_drawable_geometry([])).toBe(false);
	});

	test("is true when any mesh carries vertices", () => {
		expect(has_drawable_geometry([mesh(0), mesh(3)])).toBe(true);
	});
});

describe("resolve_obj_point_cloud", () => {
	test("converts a served OBJ", async () => {
		const url = URL.createObjectURL(new Blob([POINT_CLOUD_OBJ]));
		const ply = await resolve_obj_point_cloud(url);

		expect(parse_ply_header(ply!)!.elements[0].count).toBe(3);
	});

	test("returns null instead of rejecting when the file can't be read", async () => {
		expect(await resolve_obj_point_cloud("blob:nothing-here")).toBe(null);
	});
});
