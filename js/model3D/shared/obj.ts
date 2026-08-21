/**
 * Babylon reads an OBJ carrying vertices and no faces only when the file
 * declares no `o`, no `g` and no `usemtl`; otherwise it drops the vertices
 * before the viewer sees them and draws nothing. Such a file is rewritten here
 * as a binary point-cloud PLY, which it reads either way. The rewrite is driven
 * by the loaded model turning out to be empty rather than by reading every OBJ
 * up front: handing Babylon bytes in place of a URL breaks `mtllib` and texture
 * references, which resolve against it.
 */

const ROW_LENGTH = 3 * 4 + 3;

/** The grey Babylon gives a vertex whose line carries no colour. */
const DEFAULT_COLOR = 128;

export function has_drawable_geometry(
	meshes: readonly { getTotalVertices(): number }[]
): boolean {
	return meshes.some((mesh) => mesh.getTotalVertices() > 0);
}

/**
 * Rewrites the vertices of a face-less OBJ as a binary point-cloud PLY. A file
 * with faces returns null: geometry missing from one of those is a different
 * failure, and drawing its vertices would hide it.
 */
export function obj_point_cloud_to_ply(
	text: string
): Uint8Array<ArrayBuffer> | null {
	const positions: number[] = [];
	const colors: number[] = [];

	for (const line of text.split("\n")) {
		const parts = line.trim().split(/\s+/);
		if (parts[0] === "f") return null;
		if (parts[0] !== "v") continue;

		const x = Number(parts[1]);
		const y = Number(parts[2]);
		const z = Number(parts[3]);
		if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
			return null;
		}

		positions.push(x, y, z);
		// Babylon needs all three components before it reads a colour, so the `w`
		// of a legal `v x y z w` line does not become red.
		if (parts.length >= 7) {
			colors.push(
				color_byte(parts[4]),
				color_byte(parts[5]),
				color_byte(parts[6])
			);
		} else {
			colors.push(DEFAULT_COLOR, DEFAULT_COLOR, DEFAULT_COLOR);
		}
	}

	if (positions.length === 0) return null;
	return write_point_cloud_ply(positions, colors);
}

/** Reads and converts `url`. Never rejects, as `resolve_ply_source` doesn't. */
export async function resolve_obj_point_cloud(
	url: string
): Promise<Uint8Array<ArrayBuffer> | null> {
	try {
		const response = await fetch(url);
		if (!response.ok) return null;
		return obj_point_cloud_to_ply(await response.text());
	} catch {
		return null;
	}
}

/** No declared range, so Babylon reads above 1 as 0-255 and the rest as 0-1. */
function color_byte(token: string): number {
	const value = Number(token);
	if (!Number.isFinite(value)) return DEFAULT_COLOR;
	return Math.max(
		0,
		Math.min(255, Math.round(value > 1 ? value : value * 255))
	);
}

function write_point_cloud_ply(
	positions: number[],
	colors: number[]
): Uint8Array<ArrayBuffer> {
	const count = positions.length / 3;
	const header = new TextEncoder().encode(
		[
			"ply",
			"format binary_little_endian 1.0",
			`element vertex ${count}`,
			"property float x",
			"property float y",
			"property float z",
			"property uchar red",
			"property uchar green",
			"property uchar blue",
			"end_header",
			""
		].join("\n")
	);

	const result = new Uint8Array(header.length + count * ROW_LENGTH);
	result.set(header);
	const view = new DataView(result.buffer, header.length);

	for (let i = 0; i < count; i++) {
		const offset = i * ROW_LENGTH;
		view.setFloat32(offset, positions[i * 3], true);
		view.setFloat32(offset + 4, positions[i * 3 + 1], true);
		view.setFloat32(offset + 8, positions[i * 3 + 2], true);
		view.setUint8(offset + 12, colors[i * 3]);
		view.setUint8(offset + 13, colors[i * 3 + 1]);
		view.setUint8(offset + 14, colors[i * 3 + 2]);
	}

	return result;
}
