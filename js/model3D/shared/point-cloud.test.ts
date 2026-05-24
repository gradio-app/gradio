import { afterEach, describe, expect, test, vi } from "vitest";

import {
	load_obj_point_cloud,
	load_ply_point_cloud,
	parse_obj_point_cloud,
	parse_ply_point_cloud
} from "./point-cloud";

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
	afterEach(() => {
		vi.unstubAllGlobals();
	});

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

	test("parses ASCII PLY data after multibyte header comments", () => {
		const point_cloud = parse_ply_point_cloud(
			ascii_buffer(`ply
format ascii 1.0
comment café
element vertex 1
property float x
property float y
property float z
end_header
1 2 3
`)
		);

		expect(Array.from(point_cloud?.positions ?? [])).toEqual([1, 2, 3]);
	});

	test("parses ASCII PLY vertices after blank data lines", () => {
		const point_cloud = parse_ply_point_cloud(
			ascii_buffer(`ply
format ascii 1.0
element vertex 2
property float x
property float y
property float z
end_header
1 2 3

4 5 6
`)
		);

		expect(Array.from(point_cloud?.positions ?? [])).toEqual([
			1, 2, 3, 4, 5, 6
		]);
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

	test("normalizes 16-bit integer PLY color channels", () => {
		const point_cloud = parse_ply_point_cloud(
			ascii_buffer(`ply
format ascii 1.0
element vertex 1
property float x
property float y
property float z
property ushort red
property uint16 green
property ushort blue
property uint16 alpha
end_header
1 2 3 65535 32768 1 65535
`)
		);

		expect(Array.from(point_cloud?.colors ?? [])).toEqual(
			float32([1, 32768 / 65535, 1 / 65535, 1])
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

	test("ignores malformed PLY element counts", () => {
		expect(
			parse_ply_point_cloud(
				ascii_buffer(`ply
format ascii 1.0
element vertex nope
property float x
property float y
property float z
end_header
1 2 3
`)
			)
		).toBeNull();
		expect(
			parse_ply_point_cloud(
				ascii_buffer(`ply
format ascii 1.0
element vertex 1
property float x
property float y
property float z
element face NaN
end_header
1 2 3
`)
			)
		).toBeNull();
	});

	test("ignores truncated binary PLY data", () => {
		const buffer = binary_little_endian_ply();
		expect(
			parse_ply_point_cloud(buffer.slice(0, buffer.byteLength - 1))
		).toBeNull();
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

	test("does not parse failed fetch responses", async () => {
		const failed_response = {
			ok: false,
			arrayBuffer: async () => new ArrayBuffer(0),
			text: async () => ""
		} as unknown as Response;

		vi.stubGlobal(
			"fetch",
			vi.fn(async () => failed_response)
		);

		await expect(load_obj_point_cloud("/missing.obj")).resolves.toBeNull();
		await expect(load_ply_point_cloud("/missing.ply")).resolves.toBeNull();
	});

	test("does not read an entire streamed OBJ mesh before returning null", async () => {
		const bytes = new TextEncoder().encode("v 1 2 3\nf 1 2 3\n");
		const text = vi.fn(async () => {
			throw new Error("full response body should not be read");
		});
		const fetch_mock = vi.fn(
			async () =>
				({
					ok: true,
					body: new ReadableStream<Uint8Array>({
						start(controller) {
							controller.enqueue(bytes);
							controller.close();
						}
					}),
					text
				}) as unknown as Response
		);

		vi.stubGlobal("fetch", fetch_mock);

		await expect(load_obj_point_cloud("/mesh.obj")).resolves.toBeNull();
		expect(text).not.toHaveBeenCalled();
	});

	test("fetches the full PLY after a point-cloud header probe", async () => {
		const point_cloud_header = ascii_buffer(`ply
format ascii 1.0
element vertex 1
property float x
property float y
property float z
end_header
`);
		const point_cloud_ply = ascii_buffer(`ply
format ascii 1.0
element vertex 1
property float x
property float y
property float z
end_header
1 2 3
`);
		const fetch_mock = vi
			.fn()
			.mockResolvedValueOnce({
				ok: true,
				status: 206,
				arrayBuffer: async () => point_cloud_header
			} as unknown as Response)
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				arrayBuffer: async () => point_cloud_ply
			} as unknown as Response);

		vi.stubGlobal("fetch", fetch_mock);

		const point_cloud = await load_ply_point_cloud("/model.ply");
		expect(Array.from(point_cloud?.positions ?? [])).toEqual([1, 2, 3]);
		expect(fetch_mock).toHaveBeenNthCalledWith(1, "/model.ply", {
			headers: { Range: "bytes=0-65535" }
		});
		expect(fetch_mock).toHaveBeenNthCalledWith(2, "/model.ply");
	});

	test("does not fetch a full Gaussian splat PLY before GS rendering", async () => {
		const gaussian_splat_header = ascii_buffer(`ply
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
`);
		const fetch_mock = vi.fn(
			async () =>
				({
					ok: true,
					status: 206,
					arrayBuffer: async () => gaussian_splat_header
				}) as unknown as Response
		);

		vi.stubGlobal("fetch", fetch_mock);

		await expect(load_ply_point_cloud("/model.ply")).resolves.toBeNull();
		expect(fetch_mock).toHaveBeenCalledOnce();
		expect(fetch_mock).toHaveBeenCalledWith("/model.ply", {
			headers: { Range: "bytes=0-65535" }
		});
	});
});
