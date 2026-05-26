import type { PortType } from "./workflow-types";

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
		outputs: [{ id: "out_0", label: "Text", type: "text" }],
	},
	"text2text-generation": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Text", type: "text" }],
	},
	"summarization": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Summary", type: "text" }],
	},
	"translation": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Translation", type: "text" }],
	},
	"fill-mask": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Result", type: "json" }],
	},
	"conversational": {
		inputs: [{ id: "in_0", label: "Message", type: "text" }],
		outputs: [{ id: "out_0", label: "Reply", type: "text" }],
	},
	// Text → Classification
	"text-classification": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Labels", type: "json" }],
	},
	"token-classification": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Entities", type: "json" }],
	},
	"zero-shot-classification": {
		inputs: [
			{ id: "in_0", label: "Text", type: "text" },
			{ id: "in_1", label: "Labels", type: "text" },
		],
		outputs: [{ id: "out_0", label: "Scores", type: "json" }],
	},
	"sentence-similarity": {
		inputs: [
			{ id: "in_0", label: "Source", type: "text" },
			{ id: "in_1", label: "Sentences", type: "text" },
		],
		outputs: [{ id: "out_0", label: "Scores", type: "json" }],
	},
	"question-answering": {
		inputs: [
			{ id: "in_0", label: "Question", type: "text" },
			{ id: "in_1", label: "Context", type: "text" },
		],
		outputs: [{ id: "out_0", label: "Answer", type: "text" }],
	},
	"feature-extraction": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Embeddings", type: "json" }],
	},
	// Text → Image
	"text-to-image": {
		inputs: [{ id: "in_0", label: "Prompt", type: "text" }],
		outputs: [{ id: "out_0", label: "Image", type: "image" }],
	},
	// Text → Audio
	"text-to-speech": {
		inputs: [{ id: "in_0", label: "Text", type: "text" }],
		outputs: [{ id: "out_0", label: "Audio", type: "audio" }],
	},
	"text-to-audio": {
		inputs: [{ id: "in_0", label: "Prompt", type: "text" }],
		outputs: [{ id: "out_0", label: "Audio", type: "audio" }],
	},
	// Text → Video
	"text-to-video": {
		inputs: [{ id: "in_0", label: "Prompt", type: "text" }],
		outputs: [{ id: "out_0", label: "Video", type: "video" }],
	},
	// Image → *
	"image-classification": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Labels", type: "json" }],
	},
	"object-detection": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Detections", type: "json" }],
	},
	"image-segmentation": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Segments", type: "json" }],
	},
	"image-to-text": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Text", type: "text" }],
	},
	"image-to-image": {
		inputs: [
			{ id: "in_0", label: "Image", type: "image" },
			{ id: "in_1", label: "Prompt", type: "text" },
		],
		outputs: [{ id: "out_0", label: "Image", type: "image" }],
	},
	"image-to-video": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Video", type: "video" }],
	},
	"depth-estimation": {
		inputs: [{ id: "in_0", label: "Image", type: "image" }],
		outputs: [{ id: "out_0", label: "Depth", type: "image" }],
	},
	"image-text-to-text": {
		inputs: [
			{ id: "in_0", label: "Image", type: "image" },
			{ id: "in_1", label: "Prompt", type: "text" },
		],
		outputs: [{ id: "out_0", label: "Text", type: "text" }],
	},
	// Audio → *
	"automatic-speech-recognition": {
		inputs: [{ id: "in_0", label: "Audio", type: "audio" }],
		outputs: [{ id: "out_0", label: "Text", type: "text" }],
	},
	"audio-classification": {
		inputs: [{ id: "in_0", label: "Audio", type: "audio" }],
		outputs: [{ id: "out_0", label: "Labels", type: "json" }],
	},
	"audio-to-audio": {
		inputs: [{ id: "in_0", label: "Audio", type: "audio" }],
		outputs: [{ id: "out_0", label: "Audio", type: "audio" }],
	},
	// Multimodal
	"visual-question-answering": {
		inputs: [
			{ id: "in_0", label: "Image", type: "image" },
			{ id: "in_1", label: "Question", type: "text" },
		],
		outputs: [{ id: "out_0", label: "Answer", type: "text" }],
	},
	"document-question-answering": {
		inputs: [
			{ id: "in_0", label: "Document", type: "image" },
			{ id: "in_1", label: "Question", type: "text" },
		],
		outputs: [{ id: "out_0", label: "Answer", type: "text" }],
	},
};

export const LIBRARY: Record<string, NodeTemplate[]> = {
	components: [
		{
			label: "Image",
			kind: "component",
			source: "local",
			inputs: [{ id: "in", label: "Image", type: "image" }],
			outputs: [{ id: "out", label: "Image", type: "image" }],
			width: 220,
			height: 160
		},
		{
			label: "Textbox",
			kind: "component",
			source: "local",
			inputs: [{ id: "in", label: "Text", type: "text" }],
			outputs: [{ id: "out", label: "Text", type: "text" }],
			width: 220,
			height: 160
		},
		{
			label: "Audio",
			kind: "component",
			source: "local",
			inputs: [{ id: "in", label: "Audio", type: "audio" }],
			outputs: [{ id: "out", label: "Audio", type: "audio" }],
			width: 220,
			height: 160
		},
		{
			label: "Video",
			kind: "component",
			source: "local",
			inputs: [{ id: "in", label: "Video", type: "video" }],
			outputs: [{ id: "out", label: "Video", type: "video" }],
			width: 220,
			height: 160
		},
		{
			label: "Number",
			kind: "component",
			source: "local",
			inputs: [{ id: "in", label: "Number", type: "number" }],
			outputs: [{ id: "out", label: "Number", type: "number" }],
			width: 220,
			height: 130
		},
		{
			label: "File",
			kind: "component",
			source: "local",
			inputs: [{ id: "in", label: "File", type: "file" }],
			outputs: [{ id: "out", label: "File", type: "file" }],
			width: 220,
			height: 160
		},
		{
			label: "JSON",
			kind: "component",
			source: "local",
			inputs: [{ id: "in", label: "JSON", type: "json" }],
			outputs: [{ id: "out", label: "JSON", type: "json" }],
			width: 220,
			height: 160
		},
		{
			label: "Gallery",
			kind: "component",
			source: "local",
			inputs: [{ id: "in", label: "Gallery", type: "gallery" }],
			outputs: [{ id: "out", label: "Gallery", type: "gallery" }],
			width: 220,
			height: 160
		},
		{
			label: "Model3D",
			kind: "component",
			source: "local",
			inputs: [{ id: "in", label: "Model", type: "model3d" }],
			outputs: [{ id: "out", label: "Model", type: "model3d" }],
			width: 220,
			height: 160
		}
	],
	spaces: [] as NodeTemplate[]
};

/* ── Expanded categories & pipeline-tag mapping ── */

export const SPACE_CATEGORIES = [
	{ key: "image", label: "Image" },
	{ key: "audio", label: "Audio" },
	{ key: "text", label: "Text" },
	{ key: "video", label: "Video" },
	{ key: "multimodal", label: "Multimodal" },
	{ key: "3d", label: "3D" },
	{ key: "chat", label: "Chat" },
	{ key: "code", label: "Code" }
];

export const PIPELINE_TO_CATEGORY: Record<string, string> = {
	// Image
	"text-to-image": "image",
	"image-to-image": "image",
	"image-classification": "image",
	"image-segmentation": "image",
	"object-detection": "image",
	"unconditional-image-generation": "image",
	"image-feature-extraction": "image",
	"depth-estimation": "image",
	"image-to-text": "image",
	// Audio
	"text-to-speech": "audio",
	"automatic-speech-recognition": "audio",
	"audio-to-audio": "audio",
	"audio-classification": "audio",
	"voice-activity-detection": "audio",
	// Text
	"text-generation": "text",
	"text2text-generation": "text",
	"translation": "text",
	"summarization": "text",
	"text-classification": "text",
	"question-answering": "text",
	"fill-mask": "text",
	"token-classification": "text",
	"sentence-similarity": "text",
	"feature-extraction": "text",
	"zero-shot-classification": "text",
	"table-question-answering": "text",
	// Video
	"text-to-video": "video",
	"image-to-video": "video",
	"video-classification": "video",
	// 3D
	"text-to-3d": "3d",
	"image-to-3d": "3d",
	// Multimodal
	"visual-question-answering": "multimodal",
	"image-text-to-text": "multimodal",
	"document-question-answering": "multimodal",
	"zero-shot-image-classification": "multimodal",
	"video-text-to-text": "multimodal",
	// Chat
	"conversational": "chat"
};

const KEYWORD_PATTERNS: [RegExp, string][] = [
	// Video — check before image since "image to video" should be video
	[/\b(video|animate|animation|motion|film|movie)\b/i, "video"],
	// 3D
	[/\b(3d|mesh|point.?cloud|nerf|gaussian.?splat|triposr)\b/i, "3d"],
	// Audio
	[/\b(audio|voice|speech|tts|whisper|music|sound|sing|talk)\b/i, "audio"],
	// Chat
	[/\b(chat|conversation|assistant|llm|gpt|gemma|llama|mistral|qwen(?!.*(?:image|edit|video)))\b/i, "chat"],
	// Multimodal
	[/\b(multimodal|vision.?language|vqa|document.?q|ocr)\b/i, "multimodal"],
	// Code
	[/\b(code|program|compiler|debug|ide)\b/i, "code"],
	// Image — broad, check last
	[/\b(image|photo|picture|paint|draw|sketch|pixel|diffus|flux|stable|edit.*image|image.*edit|face|swap|background|segm|detect|caption|upscal|super.?res|inpaint|outpaint|style.?transfer|lora|controlnet)\b/i, "image"],
];

export function categorizeSpace(
	pipelineTag?: string | null,
	tags?: string[] | null,
	description?: string | null,
	spaceId?: string | null
): string | null {
	if (pipelineTag && PIPELINE_TO_CATEGORY[pipelineTag]) {
		return PIPELINE_TO_CATEGORY[pipelineTag];
	}
	if (tags) {
		for (const tag of tags) {
			if (PIPELINE_TO_CATEGORY[tag]) return PIPELINE_TO_CATEGORY[tag];
		}
	}
	// Fall back to keyword matching on description + space ID
	const text = [description ?? "", spaceId ?? ""].join(" ");
	if (text.trim()) {
		for (const [pattern, category] of KEYWORD_PATTERNS) {
			if (pattern.test(text)) return category;
		}
	}
	return null;
}
