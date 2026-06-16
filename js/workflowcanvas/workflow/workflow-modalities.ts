import type { PortType } from "./workflow-types";

export interface SubTab {
	key: string;
	label: string;
	pipelineTag: string;
	spaceCategory?: string;
	inputs: PortType[];
	outputs: PortType[];
}

export interface ModalityConfig {
	key: string;
	label: string;
	category: string;
	port_type: PortType | null;
	subtabs: SubTab[];
}

const ALL: SubTab = {
	key: "all",
	label: "All",
	pipelineTag: "",
	inputs: [],
	outputs: []
};

function task(
	key: string,
	pipelineTag: string,
	inputs: PortType[],
	outputs: PortType[],
	opts?: { label?: string; spaceCategory?: string }
): SubTab {
	const arrow = opts?.label ?? `${typeLabel(inputs)} → ${typeLabel(outputs)}`;
	return {
		key,
		label: arrow,
		pipelineTag,
		spaceCategory: opts?.spaceCategory,
		inputs,
		outputs
	};
}

function typeLabel(types: PortType[]): string {
	if (types.length === 0) return "Any";
	return types.map((t) => PORT_LABELS[t] ?? t).join(" + ");
}

const PORT_LABELS: Partial<Record<PortType, string>> = {
	image: "Image",
	audio: "Audio",
	video: "Video",
	text: "Text",
	model3d: "3D",
	number: "Number",
	boolean: "Toggle",
	json: "Data",
	gallery: "Gallery"
};

export const DATASET_MODALITY: ModalityConfig = {
	key: "data",
	label: "Data",
	category: "data",
	port_type: null,
	subtabs: [ALL]
};

export const ALL_MODALITY: ModalityConfig = {
	key: "all",
	label: "All",
	category: "all",
	port_type: null,
	subtabs: [ALL]
};

export const MODALITIES: ModalityConfig[] = [
	{
		key: "image",
		label: "Image",
		category: "image",
		port_type: "image",
		subtabs: [
			ALL,
			task("text-to-image", "text-to-image", ["text"], ["image"], {
				label: "Image Generation",
				spaceCategory: "image-generation"
			}),
			task("image-to-image", "image-to-image", ["image"], ["image"], {
				label: "Image Editing",
				spaceCategory: "image-editing"
			}),
			task("image-to-text", "image-to-text", ["image"], ["text"], {
				label: "Image Captioning",
				spaceCategory: "image-captioning"
			}),
			task("object-detection", "object-detection", ["image"], ["json"], {
				label: "Object Detection",
				spaceCategory: "object-detection"
			}),
			task("image-segmentation", "image-segmentation", ["image"], ["json"], {
				label: "Image Segmentation"
			}),
			task(
				"image-classification",
				"image-classification",
				["image"],
				["json"],
				{
					label: "Image Classification"
				}
			),
			task(
				"zero-shot-image-classification",
				"zero-shot-image-classification",
				["image", "text"],
				["json"],
				{ label: "Zero-Shot Classification" }
			),
			task(
				"zero-shot-object-detection",
				"zero-shot-object-detection",
				["image", "text"],
				["json"],
				{ label: "Zero-Shot Detection" }
			),
			task("mask-generation", "mask-generation", ["image"], ["image"], {
				label: "Mask Generation"
			}),
			task("keypoint-detection", "keypoint-detection", ["image"], ["json"], {
				label: "Keypoint Detection"
			}),
			task(
				"visual-question-answering",
				"visual-question-answering",
				["image", "text"],
				["text"],
				{ label: "Visual Q&A" }
			),
			task(
				"document-question-answering",
				"document-question-answering",
				["image", "text"],
				["text"],
				{ label: "Document Q&A" }
			),
			task("depth-estimation", "depth-estimation", ["image"], ["image"], {
				label: "Depth Estimation"
			})
		]
	},
	{
		key: "audio",
		label: "Audio",
		category: "audio",
		port_type: "audio",
		subtabs: [
			ALL,
			task("text-to-speech", "text-to-speech", ["text"], ["audio"], {
				label: "Speech Synthesis",
				spaceCategory: "speech-synthesis"
			}),
			task(
				"automatic-speech-recognition",
				"automatic-speech-recognition",
				["audio"],
				["text"],
				{ label: "Speech Recognition" }
			),
			task("audio-to-audio", "audio-to-audio", ["audio"], ["audio"], {
				label: "Voice Cloning",
				spaceCategory: "voice-cloning"
			}),
			task("text-to-audio", "text-to-audio", ["text"], ["audio"], {
				label: "Music Generation",
				spaceCategory: "music-generation"
			}),
			task(
				"audio-classification",
				"audio-classification",
				["audio"],
				["json"],
				{
					label: "Audio Classification"
				}
			)
		]
	},
	{
		key: "video",
		label: "Video",
		category: "video",
		port_type: "video",
		subtabs: [
			ALL,
			task("text-to-video", "text-to-video", ["text"], ["video"], {
				label: "Video Generation",
				spaceCategory: "video-generation"
			}),
			task("image-to-video", "image-to-video", ["image"], ["video"], {
				label: "Character Animation",
				spaceCategory: "character-animation"
			}),
			task(
				"video-classification",
				"video-classification",
				["video"],
				["json"],
				{
					label: "Video Classification"
				}
			)
		]
	},
	{
		key: "text",
		label: "Text",
		category: "text",
		port_type: "text",
		subtabs: [
			ALL,
			task("text-generation", "text-generation", ["text"], ["text"], {
				label: "Text Generation",
				spaceCategory: "text-generation"
			}),
			task("summarization", "summarization", ["text"], ["text"], {
				label: "Text Summarization",
				spaceCategory: "text-summarization"
			}),
			task("translation", "translation", ["text"], ["text"], {
				label: "Language Translation",
				spaceCategory: "language-translation"
			}),
			task("text-classification", "text-classification", ["text"], ["json"], {
				label: "Text Analysis",
				spaceCategory: "text-analysis"
			}),
			task(
				"zero-shot-classification",
				"zero-shot-classification",
				["text"],
				["json"],
				{ label: "Zero-Shot Classification" }
			),
			task("question-answering", "question-answering", ["text"], ["text"], {
				label: "Question Answering",
				spaceCategory: "question-answering"
			})
		]
	},
	{
		key: "3d",
		label: "3D",
		category: "3d",
		port_type: "model3d",
		subtabs: [
			ALL,
			task("text-to-3d", "text-to-3d", ["text"], ["model3d"], {
				label: "3D from Text",
				spaceCategory: "3d-modeling"
			}),
			task("image-to-3d", "image-to-3d", ["image"], ["model3d"], {
				label: "3D from Image",
				spaceCategory: "3d-modeling"
			})
		]
	}
];

export interface PortMeta {
	port_type: PortType;
	label: string;
	modality_key?: string;
}

export const PORT_REGISTRY: PortMeta[] = [
	{ port_type: "image", label: "Image", modality_key: "image" },
	{ port_type: "audio", label: "Audio", modality_key: "audio" },
	{ port_type: "video", label: "Video", modality_key: "video" },
	{ port_type: "model3d", label: "3D", modality_key: "3d" },
	{ port_type: "text", label: "Text", modality_key: "text" },
	{ port_type: "number", label: "Number" },
	{ port_type: "boolean", label: "Toggle" },
	{ port_type: "json", label: "JSON" },
	{ port_type: "gallery", label: "Gallery", modality_key: "image" }
];

export function portMeta(type: PortType): PortMeta | null {
	return PORT_REGISTRY.find((p) => p.port_type === type) ?? null;
}

export function modalityForPort(type: PortType): ModalityConfig | null {
	const meta = portMeta(type);
	if (!meta?.modality_key) return null;
	return MODALITIES.find((m) => m.key === meta.modality_key) ?? null;
}
