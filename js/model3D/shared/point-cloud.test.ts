import { describe, expect, test } from "vitest";

import { parse_obj_point_cloud, parse_ply_point_cloud } from "./point-cloud";

function ascii_buffer(value: string): ArrayBuffer {
	return new TextEncoder().encode(value).buffer;
}

function float32(values: number[]): number[] {
	return Array.from(new Float32Array(values));
}

function binary_little_endian_ply(): ArrayBuffer {
	const header = [
		"ply",
		"format binary_little_endian 1.0",
		"element vertex 2",
		"property double x",
		"property double y",
		"property double z",
		"property uchar red",
		"property uchar green",
		"property uchar blue",
		"end_header",
		""
	].join("\n");
	const header_bytes = new TextEncoder().encode(header);
	const point_bytes = new ArrayBuffer(54);
	const view = new DataView(point_bytes);
	let offset = 0;

	for (const point of [
		{ position: [1, 2, 3], color: [255, 128, 0] },
		{ position: [-1, -2, -3], color: [0, 64, 255] }
	]) {
		for (const coordinate of point.position) {
			view.setFloat64(offset, coordinate, true);
			offset += 8;
		}
		for (const channel of point.color) {
			view.setUint8(offset, channel);
			offset += 1;
		}
	}

	const bytes = new Uint8Array(
		header_bytes.byteLength + point_bytes.byteLength
	);
	bytes.set(header_bytes, 0);
	bytes.set(new Uint8Array(point_bytes), header_bytes.byteLength);
	return bytes.buffer;
}

describe("point cloud parsing", () => {
	test("parses OBJ vertices with colors when no faces are present", () => {
		const point_cloud = parse_obj_point_cloud(`
v 1 2 3 0.25 0.5 0.75
v -1 -2 -3 255 128 0
`);

		expect(Array.from(point_cloud?.positions ?? [])).toEqual([
			1, 2, 3, -1, -2, -3
		]);
		expect(Array.from(point_cloud?.colors ?? [])).toEqual(
			float32([0.25, 0.5, 0.75, 1, 1, 128 / 255, 0, 1])
		);
	});

	test("does not claim OBJ meshes that contain faces", () => {
		const point_cloud = parse_obj_point_cloud(`
v 1 2 3
v 4 5 6
v 7 8 9
f 1 2 3
`);

		expect(point_cloud).toBeNull();
	});

	test("parses ASCII PLY vertices with RGB colors", () => {
		const point_cloud = parse_ply_point_cloud(
			ascii_buffer(`ply
format ascii 1.0
element vertex 2
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
end_header
1 2 3 255 128 0
-1 -2 -3 0 64 255
`)
		);

		expect(Array.from(point_cloud?.positions ?? [])).toEqual([
			1, 2, 3, -1, -2, -3
		]);
		expect(Array.from(point_cloud?.colors ?? [])).toEqual(
			float32([1, 128 / 255, 0, 1, 0, 64 / 255, 1, 1])
		);
	});

	test("normalizes uchar PLY color value one as 1/255", () => {
		const point_cloud = parse_ply_point_cloud(
			ascii_buffer(`ply
format ascii 1.0
element vertex 1
property float x
property float y
property float z
property uchar red
property uchar green
property uchar blue
end_header
1 2 3 1 1 1
`)
		);

		expect(Array.from(point_cloud?.colors ?? [])).toEqual(
			float32([1 / 255, 1 / 255, 1 / 255, 1])
		);
	});

	test("parses binary little-endian PLY vertices with RGB colors", () => {
		const point_cloud = parse_ply_point_cloud(binary_little_endian_ply());

		expect(Array.from(point_cloud?.positions ?? [])).toEqual([
			1, 2, 3, -1, -2, -3
		]);
		expect(Array.from(point_cloud?.colors ?? [])).toEqual(
			float32([1, 128 / 255, 0, 1, 0, 64 / 255, 1, 1])
		);
	});

	test("leaves Gaussian splat PLY files for the existing GS renderer", () => {
		const point_cloud = parse_ply_point_cloud(
			ascii_buffer(`ply
format ascii 1.0
element vertex 1
property float x
property float y
property float z
property float f_dc_0
property float opacity
property float scale_0
property float rot_0
end_header
0 0 0 0 1 1 0
`)
		);

		expect(point_cloud).toBeNull();
	});
});
