import { test, describe, expect } from "vitest";
import { GaussianSplattingMesh } from "@babylonjs/core/Meshes/GaussianSplatting/gaussianSplattingMesh";

import {
	ascii_ply_to_binary,
	is_gaussian_splat_ply,
	parse_ply_header,
	resolve_ply_source
} from "./ply";

const encode = (text: string): Uint8Array => new TextEncoder().encode(text);

const MESH_PLY = `ply
format ascii 1.0
element vertex 3
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
element face 1
property list uchar int vertex_indices
end_header
-1 -1 0 255 0 0
1 -1 0 0 255 0
0 1 0 0 0 255
3 0 1 2
`;

const SPLAT_PLY = `ply
format binary_little_endian 1.0
element vertex 1
property float x
property float y
property float z
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

const POINT_CLOUD_PLY = `ply
format ascii 1.0
element vertex 2
property float x
property float y
property float z
end_header
0 0 0
1 2 3
`;

describe("parse_ply_header", () => {
	test("reads the format, element counts and property layout", () => {
		const header = parse_ply_header(encode(MESH_PLY))!;

		expect(header.format).toBe("ascii");
		expect(header.elements.map((e) => [e.name, e.count])).toEqual([
			["vertex", 3],
			["face", 1]
		]);
		expect(header.byte_length).toBe(MESH_PLY.indexOf("end_header") + 11);
	});

	test("returns null for data that is not PLY", () => {
		expect(parse_ply_header(encode("not a ply file"))).toBeNull();
	});

	test("returns null when the header is truncated", () => {
		expect(parse_ply_header(encode("ply\nformat ascii 1.0\n"))).toBeNull();
	});
});

describe("is_gaussian_splat_ply", () => {
	test("is true for a file carrying the splat properties", () => {
		expect(is_gaussian_splat_ply(parse_ply_header(encode(SPLAT_PLY))!)).toBe(
			true
		);
	});

	test("is false for a triangle mesh", () => {
		expect(is_gaussian_splat_ply(parse_ply_header(encode(MESH_PLY))!)).toBe(
			false
		);
	});

	test("is false for a plain point cloud", () => {
		expect(
			is_gaussian_splat_ply(parse_ply_header(encode(POINT_CLOUD_PLY))!)
		).toBe(false);
	});
});

describe("ascii_ply_to_binary", () => {
	test("writes the same values as little-endian binary", () => {
		const bytes = encode(MESH_PLY);
		const header = parse_ply_header(bytes)!;
		const result = ascii_ply_to_binary(bytes, header);

		const new_header = parse_ply_header(result)!;
		expect(new_header.format).toBe("binary_little_endian");
		expect(new_header.elements).toEqual(header.elements);

		const view = new DataView(
			result.buffer,
			result.byteOffset + new_header.byte_length
		);
		// First vertex: three floats then three colour bytes.
		expect(view.getFloat32(0, true)).toBe(-1);
		expect(view.getFloat32(4, true)).toBe(-1);
		expect(view.getFloat32(8, true)).toBe(0);
		expect([view.getUint8(12), view.getUint8(13), view.getUint8(14)]).toEqual([
			255, 0, 0
		]);

		// The single face: a uchar count followed by three int indices.
		const face = 3 * 15;
		expect(view.getUint8(face)).toBe(3);
		expect(view.getInt32(face + 1, true)).toBe(0);
		expect(view.getInt32(face + 5, true)).toBe(1);
		expect(view.getInt32(face + 9, true)).toBe(2);
		expect(result.byteLength).toBe(new_header.byte_length + face + 13);
	});

	test("rejects a list length that cannot describe a face", () => {
		const malicious = MESH_PLY.replace("3 0 1 2", "9999999999 0 1 2");
		const bytes = encode(malicious);
		expect(() =>
			ascii_ply_to_binary(bytes, parse_ply_header(bytes)!)
		).toThrowError(/Unsupported PLY list length/);
	});

	test("does not walk the rows of an element with no properties", () => {
		// Nothing is read per row here, so the row loop consumes no tokens and
		// cannot be stopped by the body running out. Without the skip this spins
		// for hours on a 61 byte file.
		const bytes = encode(
			"ply\nformat ascii 1.0\nelement vertex 900000000000\nend_header\n"
		);
		const result = ascii_ply_to_binary(bytes, parse_ply_header(bytes)!);

		expect(result.byteLength).toBe(parse_ply_header(result)!.byte_length);
	});

	test("throws when the body has fewer rows than the header promises", () => {
		const truncated = MESH_PLY.replace("element vertex 3", "element vertex 4");
		const bytes = encode(truncated);
		expect(() =>
			ascii_ply_to_binary(bytes, parse_ply_header(bytes)!)
		).toThrowError(/Truncated/);
	});
});

describe("what Babylon makes of the transcoded output", () => {
	// Asserting on our own bytes only covers half the job: Babylon's PLY reader
	// accepts one narrow dialect, and the gap between "we wrote it correctly" and
	// "it can read it" is where every case below used to fail.
	const parse = (text: string): { rowVertexLength: number } | null => {
		const bytes = encode(text);
		const binary = ascii_ply_to_binary(bytes, parse_ply_header(bytes)!);
		return GaussianSplattingMesh.ParseHeader(binary.buffer);
	};

	test("reads a mesh", () => {
		expect(parse(MESH_PLY)?.rowVertexLength).toBe(3 * 4 + 3);
	});

	test("reads a source written with CRLF line endings", () => {
		// Babylon looks for a literal "end_header\n", so a copied CRLF header
		// makes it give up and treat the file as a raw splat.
		expect(parse(MESH_PLY.replace(/\n/g, "\r\n"))?.rowVertexLength).toBe(
			3 * 4 + 3
		);
	});

	test("reads a source written with alias type names", () => {
		// Babylon's size table has no `float32` or `uint8`, so copying those
		// spellings through leaves it computing NaN offsets.
		const aliased = MESH_PLY.replace(
			/property float /g,
			"property float32 "
		).replace(/property uchar /g, "property uint8 ");

		expect(parse(aliased)?.rowVertexLength).toBe(3 * 4 + 3);
	});

	test("reads a source using a type Babylon has no size for", () => {
		// `char` is a normal PLY type that Babylon's table simply omits, so it
		// has to be widened to one that is in there.
		const chars = MESH_PLY.replace(/property float /g, "property char ");

		expect(parse(chars)?.rowVertexLength).toBe(3 * 4 + 3);
	});
});

describe("resolve_ply_source", () => {
	const serve = (text: string): string =>
		URL.createObjectURL(new Blob([encode(text)]));

	test("routes an ASCII mesh to Babylon with transcoded bytes", async () => {
		const source = await resolve_ply_source(serve(MESH_PLY));

		expect(source.renderer).toBe("babylon");
		const data = source.renderer === "babylon" ? source.data : undefined;
		expect(parse_ply_header(data!)!.format).toBe("binary_little_endian");
	});

	test("routes a splat to gsplat without transcoding", async () => {
		expect(await resolve_ply_source(serve(SPLAT_PLY))).toEqual({
			renderer: "gsplat"
		});
	});

	test("falls back to gsplat when the body can't be transcoded", async () => {
		const truncated = MESH_PLY.replace("element vertex 3", "element vertex 4");

		// A throw here used to reach the caller as an unhandled rejection, which
		// left the canvas blank: the same failure this module exists to prevent.
		expect(await resolve_ply_source(serve(truncated))).toEqual({
			renderer: "gsplat"
		});
	});
});
