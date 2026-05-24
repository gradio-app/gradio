export interface PointCloudData {
	positions: Float32Array;
	colors?: Float32Array;
}

interface PlyProperty {
	name: string;
	type: string;
}

interface PlyHeader {
	format: "ascii" | "binary_little_endian" | "binary_big_endian";
	header_length: number;
	vertex_count: number;
	vertex_properties: PlyProperty[];
	face_count: number;
}

const COLOR_NAMES = {
	red: ["red", "diffuse_red", "r"],
	green: ["green", "diffuse_green", "g"],
	blue: ["blue", "diffuse_blue", "b"],
	alpha: ["alpha", "diffuse_alpha", "a"]
};

const GAUSSIAN_SPLAT_PROPERTIES = new Set([
	"f_dc_0",
	"f_rest_0",
	"opacity",
	"scale_0",
	"rot_0"
]);

const PLY_TYPE_SIZES: Record<string, number> = {
	char: 1,
	int8: 1,
	uchar: 1,
	uint8: 1,
	short: 2,
	int16: 2,
	ushort: 2,
	uint16: 2,
	int: 4,
	int32: 4,
	uint: 4,
	uint32: 4,
	float: 4,
	float32: 4,
	double: 8,
	float64: 8
};

const PLY_HEADER_PROBE_BYTES = 64 * 1024;
type PlyContentKind = "point_cloud" | "gaussian_splat" | "unsupported";

const BYTE_COLOR_TYPES = new Set(["uchar", "uint8"]);

function normalize_channel(value: number, type?: string): number {
	if (type && BYTE_COLOR_TYPES.has(type)) {
		return value / 255;
	}
	return value > 1 ? value / 255 : value;
}

function color_property_index(
	properties: PlyProperty[],
	names: string[]
): number {
	return properties.findIndex((property) => names.includes(property.name));
}

function parse_ply_count(value: string | undefined): number | null {
	const count = Number(value);
	return Number.isInteger(count) && count >= 0 ? count : null;
}

function push_color(
	colors: number[],
	red: number | undefined,
	green: number | undefined,
	blue: number | undefined,
	alpha = 1,
	red_type?: string,
	green_type?: string,
	blue_type?: string,
	alpha_type?: string
): void {
	colors.push(
		normalize_channel(red ?? 1, red_type),
		normalize_channel(green ?? 1, green_type),
		normalize_channel(blue ?? 1, blue_type),
		normalize_channel(alpha, alpha_type)
	);
}

function trim_array_buffer(buffer: ArrayBufferLike): ArrayBuffer {
	if (buffer instanceof ArrayBuffer) {
		return buffer;
	}
	const copy = new Uint8Array(buffer.byteLength);
	copy.set(new Uint8Array(buffer));
	return copy.buffer;
}

function find_ply_header_end(bytes: Uint8Array): number {
	const marker = new TextEncoder().encode("end_header");
	for (let i = 0; i <= bytes.length - marker.length; i++) {
		let matched = true;
		for (let j = 0; j < marker.length; j++) {
			if (bytes[i + j] !== marker[j]) {
				matched = false;
				break;
			}
		}
		if (matched) {
			let end = i + marker.length;
			while (end < bytes.length && bytes[end] !== 10) {
				end += 1;
			}
			return end < bytes.length ? end + 1 : end;
		}
	}
	return -1;
}

function parse_ply_header(buffer: ArrayBuffer): PlyHeader | null {
	const bytes = new Uint8Array(buffer);
	const header_length = find_ply_header_end(bytes);
	if (header_length === -1) {
		return null;
	}

	const header_text = new TextDecoder("ascii").decode(
		bytes.slice(0, header_length)
	);
	const lines = header_text.split(/\r?\n/).map((line) => line.trim());
	if (lines[0] !== "ply") {
		return null;
	}

	let format: PlyHeader["format"] | null = null;
	let vertex_count = 0;
	let face_count = 0;
	let current_element: string | null = null;
	const vertex_properties: PlyProperty[] = [];

	for (const line of lines.slice(1)) {
		if (!line || line.startsWith("comment")) {
			continue;
		}

		const parts = line.split(/\s+/);
		if (parts[0] === "format") {
			if (
				parts[1] === "ascii" ||
				parts[1] === "binary_little_endian" ||
				parts[1] === "binary_big_endian"
			) {
				format = parts[1];
			}
		} else if (parts[0] === "element") {
			current_element = parts[1] ?? null;
			if (current_element === "vertex") {
				const count = parse_ply_count(parts[2]);
				if (count === null) {
					return null;
				}
				vertex_count = count;
			} else if (current_element === "face") {
				const count = parse_ply_count(parts[2]);
				if (count === null) {
					return null;
				}
				face_count = count;
			}
		} else if (
			parts[0] === "property" &&
			current_element === "vertex" &&
			parts[1] !== "list"
		) {
			vertex_properties.push({ type: parts[1], name: parts[2] });
		}
	}

	if (!format || vertex_count <= 0) {
		return null;
	}

	return {
		format,
		header_length,
		vertex_count,
		vertex_properties,
		face_count
	};
}

function is_gaussian_splat_ply(properties: PlyProperty[]): boolean {
	return properties.some((property) =>
		GAUSSIAN_SPLAT_PROPERTIES.has(property.name)
	);
}

function classify_ply_content(buffer: ArrayBufferLike): PlyContentKind | null {
	const array_buffer = trim_array_buffer(buffer);
	const has_complete_header =
		find_ply_header_end(new Uint8Array(array_buffer)) !== -1;
	const header = parse_ply_header(array_buffer);

	if (!header) {
		return has_complete_header ? "unsupported" : null;
	}
	if (is_gaussian_splat_ply(header.vertex_properties)) {
		return "gaussian_splat";
	}
	if (header.face_count > 0) {
		return "unsupported";
	}
	return "point_cloud";
}

function ply_property_value(
	view: DataView,
	offset: number,
	type: string,
	little_endian: boolean
): number {
	switch (type) {
		case "char":
		case "int8":
			return view.getInt8(offset);
		case "uchar":
		case "uint8":
			return view.getUint8(offset);
		case "short":
		case "int16":
			return view.getInt16(offset, little_endian);
		case "ushort":
		case "uint16":
			return view.getUint16(offset, little_endian);
		case "int":
		case "int32":
			return view.getInt32(offset, little_endian);
		case "uint":
		case "uint32":
			return view.getUint32(offset, little_endian);
		case "float":
		case "float32":
			return view.getFloat32(offset, little_endian);
		case "double":
		case "float64":
			return view.getFloat64(offset, little_endian);
		default:
			throw new Error(`Unsupported PLY property type: ${type}`);
	}
}

function build_point_cloud(
	positions: number[],
	colors: number[]
): PointCloudData | null {
	if (positions.length === 0) {
		return null;
	}

	return {
		positions: new Float32Array(positions),
		colors: colors.length > 0 ? new Float32Array(colors) : undefined
	};
}

export function parse_obj_point_cloud(text: string): PointCloudData | null {
	const positions: number[] = [];
	const colors: number[] = [];
	let has_faces = false;

	for (const raw_line of text.split(/\r?\n/)) {
		const line = raw_line.trim();
		if (!line || line.startsWith("#")) {
			continue;
		}

		const parts = line.split(/\s+/);
		if (parts[0] === "f") {
			has_faces = true;
			break;
		}

		if (parts[0] !== "v" || parts.length < 4) {
			continue;
		}

		const position = parts.slice(1, 4).map(Number);
		if (position.some((coordinate) => Number.isNaN(coordinate))) {
			continue;
		}
		positions.push(...position);

		if (
			parts.length >= 7 &&
			!parts.slice(4, 7).some((channel) => Number.isNaN(Number(channel)))
		) {
			const color = parts.slice(4, 7).map(Number);
			push_color(colors, color[0], color[1], color[2]);
		} else {
			push_color(colors, 1, 1, 1);
		}
	}

	return has_faces ? null : build_point_cloud(positions, colors);
}

function parse_ascii_ply(
	body_text: string,
	header: PlyHeader
): PointCloudData | null {
	const positions: number[] = [];
	const colors: number[] = [];
	const properties = header.vertex_properties;
	const x_index = properties.findIndex((property) => property.name === "x");
	const y_index = properties.findIndex((property) => property.name === "y");
	const z_index = properties.findIndex((property) => property.name === "z");
	const red_index = color_property_index(properties, COLOR_NAMES.red);
	const green_index = color_property_index(properties, COLOR_NAMES.green);
	const blue_index = color_property_index(properties, COLOR_NAMES.blue);
	const alpha_index = color_property_index(properties, COLOR_NAMES.alpha);

	if (x_index === -1 || y_index === -1 || z_index === -1) {
		return null;
	}

	for (const line of body_text.split(/\r?\n/).slice(0, header.vertex_count)) {
		const values = line.trim().split(/\s+/).map(Number);
		if (values.length < properties.length) {
			continue;
		}

		positions.push(values[x_index], values[y_index], values[z_index]);
		if (red_index !== -1 && green_index !== -1 && blue_index !== -1) {
			push_color(
				colors,
				values[red_index],
				values[green_index],
				values[blue_index],
				alpha_index === -1 ? 1 : values[alpha_index],
				properties[red_index].type,
				properties[green_index].type,
				properties[blue_index].type,
				alpha_index === -1 ? undefined : properties[alpha_index].type
			);
		}
	}

	return build_point_cloud(positions, colors);
}

function parse_binary_ply(
	buffer: ArrayBuffer,
	header: PlyHeader
): PointCloudData | null {
	const positions: number[] = [];
	const colors: number[] = [];
	const properties = header.vertex_properties;
	const x_index = properties.findIndex((property) => property.name === "x");
	const y_index = properties.findIndex((property) => property.name === "y");
	const z_index = properties.findIndex((property) => property.name === "z");
	const red_index = color_property_index(properties, COLOR_NAMES.red);
	const green_index = color_property_index(properties, COLOR_NAMES.green);
	const blue_index = color_property_index(properties, COLOR_NAMES.blue);
	const alpha_index = color_property_index(properties, COLOR_NAMES.alpha);

	if (x_index === -1 || y_index === -1 || z_index === -1) {
		return null;
	}

	const property_offsets: number[] = [];
	let stride = 0;
	for (const property of properties) {
		const size = PLY_TYPE_SIZES[property.type];
		if (!size) {
			return null;
		}
		property_offsets.push(stride);
		stride += size;
	}
	if (
		stride === 0 ||
		buffer.byteLength < header.header_length + header.vertex_count * stride
	) {
		return null;
	}

	const view = new DataView(buffer);
	const little_endian = header.format === "binary_little_endian";
	let row_offset = header.header_length;
	const value_at = (index: number): number =>
		ply_property_value(
			view,
			row_offset + property_offsets[index],
			properties[index].type,
			little_endian
		);

	for (let row = 0; row < header.vertex_count; row++) {
		positions.push(value_at(x_index), value_at(y_index), value_at(z_index));
		if (red_index !== -1 && green_index !== -1 && blue_index !== -1) {
			push_color(
				colors,
				value_at(red_index),
				value_at(green_index),
				value_at(blue_index),
				alpha_index === -1 ? 1 : value_at(alpha_index),
				properties[red_index].type,
				properties[green_index].type,
				properties[blue_index].type,
				alpha_index === -1 ? undefined : properties[alpha_index].type
			);
		}

		row_offset += stride;
	}

	return build_point_cloud(positions, colors);
}

export function parse_ply_point_cloud(
	buffer: ArrayBufferLike
): PointCloudData | null {
	const array_buffer = trim_array_buffer(buffer);
	const header = parse_ply_header(array_buffer);
	if (
		!header ||
		header.face_count > 0 ||
		is_gaussian_splat_ply(header.vertex_properties)
	) {
		return null;
	}

	if (header.format === "ascii") {
		const body = new Uint8Array(array_buffer, header.header_length);
		return parse_ascii_ply(new TextDecoder("utf-8").decode(body), header);
	}

	try {
		return parse_binary_ply(array_buffer, header);
	} catch {
		return null;
	}
}

export async function load_obj_point_cloud(
	url: string
): Promise<PointCloudData | null> {
	const response = await fetch(url);
	if (!response.ok) {
		return null;
	}
	return parse_obj_point_cloud(await response.text());
}

export async function load_ply_point_cloud(
	url: string
): Promise<PointCloudData | null> {
	const probe_response = await fetch(url, {
		headers: { Range: `bytes=0-${PLY_HEADER_PROBE_BYTES - 1}` }
	});
	if (!probe_response.ok) {
		return null;
	}

	const probe_buffer = await probe_response.arrayBuffer();
	if (probe_response.status !== 206) {
		return parse_ply_point_cloud(probe_buffer);
	}

	const content_kind = classify_ply_content(probe_buffer);
	if (content_kind === "gaussian_splat" || content_kind === "unsupported") {
		return null;
	}

	const response = await fetch(url);
	if (!response.ok) {
		return null;
	}

	return parse_ply_point_cloud(await response.arrayBuffer());
}
