import type { PortType, TextInputType } from "./workflow-types";
import { PORT_REGISTRY } from "./workflow-modalities";
import type { PortMeta } from "./workflow-modalities";

export interface NodeTemplate {
	label: string;
	kind: "input" | "transform" | "output" | "component";
	source: "local" | "space" | "model" | "dataset";
	space_id?: string;
	model_id?: string;
	dataset_id?: string;
	dataset_config?: string;
	dataset_split?: string;
	pipeline_tag?: string;
	endpoint?: string;
	category?: string;
	type?: TextInputType;
	inputs: { id: string; label: string; type: PortType }[];
	outputs: { id: string; label: string; type: PortType }[];
	width: number;
	height: number;
}

/* ── HF Inference API task → port schemas ── */

export interface TaskSchema {
	inputs: { id: string; label: string; type: PortType }[];
	outputs: { id: string; label: string; type: PortType }[];
}

export const TASK_SCHEMAS: Record<string, TaskSchema> = {
	// Text → Text
	"text-generation": {
		inputs: [{ id: "in_0", label: "Prompt", type: "text" }],
		outputs: [{ id: "out_0", label: "Text", type: "markdown" }]
	},
	"text2text-generation": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Text", type: "text" }]
	},
	summarization: {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Summary", type: "text" }]
	},
	translation: {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Translation", type: "text" }]
	},
	"fill-mask": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Result", type: "json" }]
	},
	// Chat-shaped tasks answer in prose that is very often markdown (headings,
	// lists, fenced code), so their tile renders it rather than showing the raw
	// asterisks. `markdown` is interchangeable with `text` for wiring.
	conversational: {
		inputs: [{ id: "in_0", label: "Message", type: "text" }],
		outputs: [{ id: "out_0", label: "Reply", type: "markdown" }]
	},
	// Text → Classification
	"text-classification": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Labels", type: "json" }]
	},
	"token-classification": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Entities", type: "json" }]
	},
	"zero-shot-classification": {
		inputs: [
			{ id: "in_0", label: "Text", type: "text" },
			{ id: "in_1", label: "Labels", type: "text" }
		],
		outputs: [{ id: "out_0", label: "Scores", type: "json" }]
	},
	"sentence-similarity": {
		inputs: [
			{ id: "in_0", label: "Source", type: "text" },
			{ id: "in_1", label: "Sentences", type: "text" }
		],
		outputs: [{ id: "out_0", label: "Scores", type: "json" }]
	},
	"question-answering": {
		inputs: [
			{ id: "in_0", label: "Question", type: "text" },
			{ id: "in_1", label: "Context", type: "text" }
		],
		outputs: [{ id: "out_0", label: "Answer", type: "text" }]
	},
	"feature-extraction": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Embeddings", type: "json" }]
	},
	// Text → Image
	"text-to-image": {
		inputs: [{ id: "in_0", label: "Prompt", type: "text" }],
		outputs: [{ id: "out_0", label: "Image", type: "image" }]
	},
	// Text → Audio
	"text-to-speech": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Audio", type: "audio" }]
	},
	"text-to-audio": {
		inputs: [{ id: "in_0", label: "Prompt", type: "text" }],
		outputs: [{ id: "out_0", label: "Audio", type: "audio" }]
	},
	// Text → Video
	"text-to-video": {
		inputs: [{ id: "in_0", label: "Prompt", type: "text" }],
		outputs: [{ id: "out_0", label: "Video", type: "video" }]
	},
	// Image → *
	"image-classification": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Labels", type: "json" }]
	},
	"object-detection": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Detections", type: "json" }]
	},
	"image-segmentation": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Segments", type: "json" }]
	},
	"image-to-image": {
		inputs: [
			{ id: "in_0", label: "Image", type: "image" },
			{ id: "in_1", label: "Prompt", type: "text" }
		],
		outputs: [{ id: "out_0", label: "Image", type: "image" }]
	},
	"image-to-video": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Video", type: "video" }]
	},
	"image-text-to-video": {
		inputs: [
			{ id: "in_0", label: "Image", type: "image" },
			{ id: "in_1", label: "Prompt", type: "text" }
		],
		outputs: [{ id: "out_0", label: "Video", type: "video" }]
	},
	"depth-estimation": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Depth", type: "image" }]
	},
	"image-text-to-text": {
		inputs: [
			{ id: "in_0", label: "Image", type: "image" },
			{ id: "in_1", label: "Prompt", type: "text" }
		],
		outputs: [{ id: "out_0", label: "Answer", type: "markdown" }]
	},
	// Audio → *
	"automatic-speech-recognition": {
		inputs: [{ id: "in_0", label: "Audio", type: "audio" }],
		outputs: [{ id: "out_0", label: "Text", type: "text" }]
	},
	"audio-classification": {
		inputs: [{ id: "in_0", label: "Audio", type: "audio" }],
		outputs: [{ id: "out_0", label: "Labels", type: "json" }]
	},
	"audio-to-audio": {
		inputs: [{ id: "in_0", label: "Audio", type: "audio" }],
		outputs: [{ id: "out_0", label: "Audio", type: "audio" }]
	},
	// Multimodal
	"zero-shot-image-classification": {
		inputs: [
			{ id: "in_0", label: "Image", type: "image" },
			{ id: "in_1", label: "Labels", type: "text" }
		],
		outputs: [{ id: "out_0", label: "Scores", type: "json" }]
	},
	"zero-shot-object-detection": {
		inputs: [
			{ id: "in_0", label: "Image", type: "image" },
			{ id: "in_1", label: "Labels", type: "text" }
		],
		outputs: [{ id: "out_0", label: "Detections", type: "json" }]
	},
	"mask-generation": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Mask", type: "image" }]
	},
	"keypoint-detection": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Keypoints", type: "json" }]
	}
};

/**
 * Build a reference/subject template for a port-registry entry. Reference
 * and subject nodes share the same shape today (in/out of the same type) —
 * the role tag in the workflow store disambiguates them at the data layer.
 * Width/height stay constant; the runtime widget decides actual rendering.
 */
function componentTemplate(meta: PortMeta): NodeTemplate {
	const height = meta.port_type === "number" ? 130 : 160;
	return {
		label: meta.label,
		kind: "component",
		source: "local",
		inputs: [{ id: "in", label: meta.label, type: meta.port_type }],
		outputs: [{ id: "out", label: meta.label, type: meta.port_type }],
		width: 220,
		height
	};
}
export const API_KEY_TYPE = "api_key";
export const API_KEY_TEMPLATE: NodeTemplate = {
	...componentTemplate({ port_type: "text", label: "API Key" }),
	type: "password",
	height: 130
};

export const LIBRARY: Record<string, NodeTemplate[]> = {
	components: PORT_REGISTRY.map(componentTemplate)
};

export function getComponentForPortType(type: string): NodeTemplate | null {
	// `any`/`file` are inference-only fallbacks. JSON gives `any` values a
	// general-purpose textbox while still allowing runtime media detection;
	// files retain the image picker used for ambiguous uploads.
	const lookup = (
		type === "any" ? "json" : type === "file" ? "image" : type
	) as PortType;
	return LIBRARY.components.find((c) => c.outputs[0]?.type === lookup) ?? null;
}
