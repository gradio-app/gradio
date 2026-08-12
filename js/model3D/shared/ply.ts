/**
 * PLY is used for two unrelated things: Gaussian splats, which the gsplat
 * renderer handles, and ordinary meshes and point clouds, which Babylon
 * handles. The extension alone doesn't say which one a file is, so the header
 * has to be read before a renderer can be picked.
 *
 * Babylon's PLY support is also little-endian binary only, so ASCII files are
 * transcoded here before being handed over.
 */

type ScalarType =
	| "char"
	| "uchar"
	| "short"
	| "ushort"
	| "int"
	| "uint"
	| "float"
	| "double";

const TYPE_ALIASES: Record<string, ScalarType> = {
	char: "char",
	int8: "char",
	uchar: "uchar",
	uint8: "uchar",
	short: "short",
	int16: "short",
	ushort: "ushort",
	uint16: "ushort",
	int: "int",
	int32: "int",
	uint: "uint",
	uint32: "uint",
	float: "float",
	float32: "float",
	double: "double",
	float64: "double"
};

const TYPE_SIZES: Record<ScalarType, number> = {
	char: 1,
	uchar: 1,
	short: 2,
	ushort: 2,
	int: 4,
	uint: 4,
	float: 4,
	double: 8
};

const SPLAT_PROPERTIES = [
	"x",
	"y",
	"z",
	"scale_0",
	"scale_1",
	"scale_2",
	"opacity",
	"rot_0",
	"rot_1",
	"rot_2",
	"rot_3"
];

const SPLAT_COLOR_PROPERTIES = [
	"red",
	"green",
	"blue",
	"f_dc_0",
	"f_dc_1",
	"f_dc_2"
];

/** How far into a file to look for `end_header` before giving up. */
const HEADER_SCAN_LIMIT = 64 * 1024;

export type PlyFormat = "ascii" | "binary_little_endian" | "binary_big_endian";

type PlyProperty =
	| { kind: "scalar"; name: string; type: ScalarType }
	| {
			kind: "list";
			name: string;
			count_type: ScalarType;
			entry_type: ScalarType;
	  };

interface PlyElement {
	name: string;
	count: number;
	properties: PlyProperty[];
}

export interface PlyHeader {
	format: PlyFormat;
	/** Size of the header in bytes, including the `end_header` line. */
	byte_length: number;
	text: string;
	elements: PlyElement[];
}

export type PlySource =
	/** A Gaussian splat: render with gsplat, which fetches the URL itself. */
	| { renderer: "gsplat" }
	/**
	 * A mesh or point cloud: render with Babylon. `data` is set only when the
	 * file had to be transcoded, otherwise Babylon fetches the URL itself.
	 */
	| { renderer: "babylon"; data?: Uint8Array<ArrayBuffer> };

export function parse_ply_header(bytes: Uint8Array): PlyHeader | null {
	const text = new TextDecoder().decode(bytes);
	if (!text.startsWith("ply")) return null;

	const end = text.indexOf("end_header");
	if (end < 0) return null;
	const line_end = text.indexOf("\n", end);
	if (line_end < 0) return null;

	const header_text = text.slice(0, line_end + 1);
	const elements: PlyElement[] = [];
	let format: PlyFormat | null = null;

	for (const line of header_text.split(/\r?\n/)) {
		const parts = line.trim().split(/\s+/);
		if (parts[0] === "format") {
			if (
				parts[1] !== "ascii" &&
				parts[1] !== "binary_little_endian" &&
				parts[1] !== "binary_big_endian"
			) {
				return null;
			}
			format = parts[1];
		} else if (parts[0] === "element") {
			elements.push({
				name: parts[1],
				count: parseInt(parts[2], 10),
				properties: []
			});
		} else if (parts[0] === "property") {
			const element = elements[elements.length - 1];
			if (!element) return null;
			if (parts[1] === "list") {
				const count_type = TYPE_ALIASES[parts[2]];
				const entry_type = TYPE_ALIASES[parts[3]];
				if (!count_type || !entry_type) return null;
				element.properties.push({
					kind: "list",
					name: parts[4],
					count_type,
					entry_type
				});
			} else {
				const type = TYPE_ALIASES[parts[1]];
				if (!type) return null;
				element.properties.push({ kind: "scalar", name: parts[2], type });
			}
		}
	}

	if (!format || elements.some((element) => !Number.isFinite(element.count))) {
		return null;
	}

	return {
		format,
		byte_length: new TextEncoder().encode(header_text).length,
		text: header_text,
		elements
	};
}

export function is_gaussian_splat_ply(header: PlyHeader): boolean {
	// Faces make it a mesh regardless of what the vertex properties look like.
	const face = header.elements.find((element) => element.name === "face");
	if (face && face.count > 0) return false;

	// Quantised splats (`element chunk`) don't carry the plain splat properties.
	if (header.elements.some((element) => element.name === "chunk")) return true;

	const vertex = header.elements.find((element) => element.name === "vertex");
	if (!vertex) return false;

	const names = new Set(vertex.properties.map((property) => property.name));
	return (
		SPLAT_PROPERTIES.every((name) => names.has(name)) &&
		SPLAT_COLOR_PROPERTIES.filter((name) => names.has(name)).length >= 3
	);
}

/** Rewrites an ASCII PLY as little-endian binary, keeping the same layout. */
export function ascii_ply_to_binary(
	bytes: Uint8Array,
	header: PlyHeader
): Uint8Array<ArrayBuffer> {
	const body = new TextDecoder().decode(bytes.subarray(header.byte_length));
	const next = token_reader(body);
	const out = new ByteWriter();

	for (const element of header.elements) {
		for (let row = 0; row < element.count; row++) {
			for (const property of element.properties) {
				if (property.kind === "scalar") {
					out.write(property.type, next());
				} else {
					const count = next();
					out.write(property.count_type, count);
					for (let i = 0; i < count; i++)
						out.write(property.entry_type, next());
				}
			}
		}
	}

	const new_header = new TextEncoder().encode(
		header.text.replace(/^format\s+ascii\s+/m, "format binary_little_endian ")
	);
	const result = new Uint8Array(new_header.length + out.length);
	result.set(new_header);
	result.set(out.bytes(), new_header.length);
	return result;
}

/**
 * Reads enough of `url` to work out how the file should be rendered. Falls back
 * to gsplat, the historical behaviour for `.ply`, when the header can't be read.
 */
export async function resolve_ply_source(url: string): Promise<PlySource> {
	let response: Response;
	try {
		response = await fetch(url);
	} catch {
		return { renderer: "gsplat" };
	}
	if (!response.ok) return { renderer: "gsplat" };

	const reader = response.body?.getReader();
	if (!reader) {
		return classify(new Uint8Array(await response.arrayBuffer()));
	}

	const chunks: Uint8Array[] = [];
	let size = 0;
	let header: PlyHeader | null = null;
	let done = false;

	while (!done && size < HEADER_SCAN_LIMIT) {
		const result = await reader.read();
		done = !!result.done;
		if (result.value) {
			chunks.push(result.value);
			size += result.value.length;
			header = parse_ply_header(concat(chunks, size));
			if (header) break;
		}
	}

	if (!header || is_gaussian_splat_ply(header)) {
		void reader.cancel().catch(() => {});
		return { renderer: "gsplat" };
	}
	if (header.format !== "ascii") {
		void reader.cancel().catch(() => {});
		return { renderer: "babylon" };
	}

	while (!done) {
		const result = await reader.read();
		done = !!result.done;
		if (result.value) {
			chunks.push(result.value);
			size += result.value.length;
		}
	}

	return {
		renderer: "babylon",
		data: ascii_ply_to_binary(concat(chunks, size), header)
	};
}

function classify(bytes: Uint8Array): PlySource {
	const header = parse_ply_header(bytes);
	if (!header || is_gaussian_splat_ply(header)) return { renderer: "gsplat" };
	if (header.format !== "ascii") return { renderer: "babylon" };
	return { renderer: "babylon", data: ascii_ply_to_binary(bytes, header) };
}

function concat(chunks: Uint8Array[], size: number): Uint8Array {
	if (chunks.length === 1) return chunks[0];
	const merged = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		merged.set(chunk, offset);
		offset += chunk.length;
	}
	return merged;
}

function token_reader(body: string): () => number {
	let position = 0;
	const is_space = (character: string): boolean =>
		character === " " ||
		character === "\n" ||
		character === "\r" ||
		character === "\t";

	return () => {
		while (position < body.length && is_space(body[position])) position++;
		const start = position;
		while (position < body.length && !is_space(body[position])) position++;
		if (start === position) {
			throw new Error("Truncated ASCII PLY body");
		}
		const value = Number(body.slice(start, position));
		if (!Number.isFinite(value)) {
			throw new Error(
				`Invalid number in ASCII PLY: ${body.slice(start, position)}`
			);
		}
		return value;
	};
}

class ByteWriter {
	private buffer = new ArrayBuffer(1024);
	private view = new DataView(this.buffer);
	length = 0;

	write(type: ScalarType, value: number): void {
		const size = TYPE_SIZES[type];
		this.reserve(size);
		const offset = this.length;
		if (type === "char") this.view.setInt8(offset, value);
		else if (type === "uchar") this.view.setUint8(offset, value);
		else if (type === "short") this.view.setInt16(offset, value, true);
		else if (type === "ushort") this.view.setUint16(offset, value, true);
		else if (type === "int") this.view.setInt32(offset, value, true);
		else if (type === "uint") this.view.setUint32(offset, value, true);
		else if (type === "float") this.view.setFloat32(offset, value, true);
		else this.view.setFloat64(offset, value, true);
		this.length += size;
	}

	bytes(): Uint8Array {
		return new Uint8Array(this.buffer, 0, this.length);
	}

	private reserve(size: number): void {
		if (this.length + size <= this.buffer.byteLength) return;
		let capacity = this.buffer.byteLength * 2;
		while (capacity < this.length + size) capacity *= 2;
		const grown = new ArrayBuffer(capacity);
		new Uint8Array(grown).set(new Uint8Array(this.buffer, 0, this.length));
		this.buffer = grown;
		this.view = new DataView(this.buffer);
	}
}
