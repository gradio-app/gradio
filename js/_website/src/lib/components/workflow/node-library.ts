import type { PortType } from "./workflow-types";

export interface NodeTemplate {
	label: string;
	kind: "input" | "transform" | "output";
	source: "local" | "space";
	space_id?: string;
	endpoint?: string;
	inputs: { id: string; label: string; type: PortType }[];
	outputs: { id: string; label: string; type: PortType }[];
	width: number;
	height: number;
}

export const LIBRARY: Record<string, NodeTemplate[]> = {
	inputs: [
		{
			label: "Image",
			kind: "input",
			source: "local",
			outputs: [{ id: "out", label: "Image", type: "image" }],
			inputs: [],
			width: 220,
			height: 160
		},
		{
			label: "Textbox",
			kind: "input",
			source: "local",
			outputs: [{ id: "out", label: "Text", type: "text" }],
			inputs: [],
			width: 220,
			height: 160
		},
		{
			label: "Audio",
			kind: "input",
			source: "local",
			outputs: [{ id: "out", label: "Audio", type: "audio" }],
			inputs: [],
			width: 220,
			height: 160
		},
		{
			label: "Video",
			kind: "input",
			source: "local",
			outputs: [{ id: "out", label: "Video", type: "video" }],
			inputs: [],
			width: 220,
			height: 160
		},
		{
			label: "Number",
			kind: "input",
			source: "local",
			outputs: [{ id: "out", label: "Number", type: "number" }],
			inputs: [],
			width: 220,
			height: 130
		},
		{
			label: "Checkbox",
			kind: "input",
			source: "local",
			outputs: [{ id: "out", label: "Boolean", type: "boolean" }],
			inputs: [],
			width: 220,
			height: 110
		},
		{
			label: "File",
			kind: "input",
			source: "local",
			outputs: [{ id: "out", label: "File", type: "file" }],
			inputs: [],
			width: 220,
			height: 160
		},
		{
			label: "JSON",
			kind: "input",
			source: "local",
			outputs: [{ id: "out", label: "JSON", type: "json" }],
			inputs: [],
			width: 220,
			height: 160
		},
		{
			label: "Model3D",
			kind: "input",
			source: "local",
			outputs: [{ id: "out", label: "Model", type: "model3d" }],
			inputs: [],
			width: 220,
			height: 160
		}
	],
	spaces: [
		{
			label: "Remove background",
			kind: "transform",
			source: "space",
			space_id: "facebook/sam2",
			inputs: [{ id: "in", label: "Image", type: "image", required: true }],
			outputs: [{ id: "out", label: "Mask", type: "image" }],
			width: 200,
			height: 90
		},
		{
			label: "Generate image",
			kind: "transform",
			source: "space",
			space_id: "black-forest-labs/FLUX.1-schnell",
			inputs: [{ id: "in", label: "Prompt", type: "text", required: true }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			width: 200,
			height: 90
		},
		{
			label: "Transcribe",
			kind: "transform",
			source: "space",
			space_id: "hf-audio/whisper-large-v3",
			inputs: [{ id: "in", label: "Audio", type: "audio", required: true }],
			outputs: [{ id: "out", label: "Text", type: "text" }],
			width: 200,
			height: 90
		},
		{
			label: "Animate image",
			kind: "transform",
			source: "space",
			space_id: "google/veo",
			inputs: [{ id: "in", label: "Image", type: "image", required: true }],
			outputs: [{ id: "out", label: "Video", type: "video" }],
			width: 200,
			height: 90
		}
	],
	outputs: [
		{
			label: "Image",
			kind: "output",
			source: "local",
			inputs: [{ id: "in", label: "Image", type: "image" }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			width: 220,
			height: 160
		},
		{
			label: "Textbox",
			kind: "output",
			source: "local",
			inputs: [{ id: "in", label: "Text", type: "text" }],
			outputs: [{ id: "out", label: "Text", type: "text" }],
			width: 220,
			height: 160
		},
		{
			label: "Audio",
			kind: "output",
			source: "local",
			inputs: [{ id: "in", label: "Audio", type: "audio" }],
			outputs: [{ id: "out", label: "Audio", type: "audio" }],
			width: 220,
			height: 160
		},
		{
			label: "Video",
			kind: "output",
			source: "local",
			inputs: [{ id: "in", label: "Video", type: "video" }],
			outputs: [{ id: "out", label: "Video", type: "video" }],
			width: 220,
			height: 160
		},
		{
			label: "Number",
			kind: "output",
			source: "local",
			inputs: [{ id: "in", label: "Number", type: "number" }],
			outputs: [{ id: "out", label: "Number", type: "number" }],
			width: 220,
			height: 110
		},
		{
			label: "File",
			kind: "output",
			source: "local",
			inputs: [{ id: "in", label: "File", type: "file" }],
			outputs: [{ id: "out", label: "File", type: "file" }],
			width: 220,
			height: 160
		},
		{
			label: "JSON",
			kind: "output",
			source: "local",
			inputs: [{ id: "in", label: "JSON", type: "json" }],
			outputs: [{ id: "out", label: "JSON", type: "json" }],
			width: 220,
			height: 160
		},
		{
			label: "Gallery",
			kind: "output",
			source: "local",
			inputs: [{ id: "in", label: "Gallery", type: "gallery" }],
			outputs: [{ id: "out", label: "Gallery", type: "gallery" }],
			width: 220,
			height: 160
		},
		{
			label: "Model3D",
			kind: "output",
			source: "local",
			inputs: [{ id: "in", label: "Model", type: "model3d" }],
			outputs: [{ id: "out", label: "Model", type: "model3d" }],
			width: 220,
			height: 160
		}
	]
};
