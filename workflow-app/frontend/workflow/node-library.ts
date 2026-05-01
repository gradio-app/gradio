import type { PortType } from "./workflow-types";

export interface NodeTemplate {
	label: string;
	kind: "input" | "transform" | "output";
	source: "local" | "space";
	space_id?: string;
	endpoint?: string;
	category?: string;
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
		// Image
		{
			label: "not-lain/background-removal",
			kind: "transform",
			source: "space",
			space_id: "not-lain/background-removal",
			category: "image",
			inputs: [],
			outputs: [],
			width: 280,
			height: 90
		},
		{
			label: "black-forest-labs/FLUX.1-schnell",
			kind: "transform",
			source: "space",
			space_id: "black-forest-labs/FLUX.1-schnell",
			category: "image",
			inputs: [],
			outputs: [],
			width: 280,
			height: 90
		},
		{
			label: "vikhyatk/moondream1",
			kind: "transform",
			source: "space",
			space_id: "vikhyatk/moondream1",
			category: "image",
			inputs: [],
			outputs: [],
			width: 280,
			height: 90
		},
		// Audio
		{
			label: "hf-audio/whisper-large-v3-turbo",
			kind: "transform",
			source: "space",
			space_id: "hf-audio/whisper-large-v3-turbo",
			category: "audio",
			inputs: [],
			outputs: [],
			width: 280,
			height: 90
		},
		{
			label: "mrfakename/E2-F5-TTS",
			kind: "transform",
			source: "space",
			space_id: "mrfakename/E2-F5-TTS",
			category: "audio",
			inputs: [],
			outputs: [],
			width: 280,
			height: 90
		},
		// Text
		{
			label: "UNESCO/nllb",
			kind: "transform",
			source: "space",
			space_id: "UNESCO/nllb",
			category: "text",
			inputs: [],
			outputs: [],
			width: 280,
			height: 90
		},
		{
			label: "huggingface-projects/gemma-2-9b-it",
			kind: "transform",
			source: "space",
			space_id: "huggingface-projects/gemma-2-9b-it",
			category: "text",
			inputs: [],
			outputs: [],
			width: 280,
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
