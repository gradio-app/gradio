import type { FileValue, NodeDataValue } from "./workflow-types";

const MEDIA_TYPES = new Set(["image", "audio", "video", "file"]);
const MIME_BY_TYPE: Record<string, string> = {
	image: "image/*",
	audio: "audio/*",
	video: "video/*",
	file: ""
};

export function wrap_history_value(
	value: unknown,
	port_type: string
): NodeDataValue {
	if (typeof value !== "string" || !MEDIA_TYPES.has(port_type)) {
		return value as NodeDataValue;
	}
	const file: FileValue = {
		url: value,
		name: value.split("/").pop() ?? "",
		mime: MIME_BY_TYPE[port_type] ?? ""
	};
	return file;
}
