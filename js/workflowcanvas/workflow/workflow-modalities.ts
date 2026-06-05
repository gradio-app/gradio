import type { PortType } from "./workflow-types";

export interface SubTab {
	key: string;
	label: string;
	/**
	 * Used as `pipeline_tag=` on the models API AND as `filter=` on the
	 * spaces API. For subtabs where Spaces have a category that differs
	 * from the model pipeline tag (e.g. Edit → `image-editing` Space
	 * category vs `image-to-image` model pipeline tag), use
	 * `spaceTags` / `modelTags` to override.
	 */
	pipelineTags: string[];
	/** Override for the spaces API. Falls back to `pipelineTags` when unset. */
	spaceTags?: string[];
	/** Override for the models API. Falls back to `pipelineTags` when unset. */
	modelTags?: string[];
	/** Freetext query fallback (used when no API tag exists, e.g. Enhance for models). */
	query?: string;
}

export interface ModalityConfig {
	key: string;
	label: string;
	category: string;
	/**
	 * Canonical port type produced by operators in this modality. Reference and
	 * subject templates derived from this modality use this type for their port.
	 * `null` for datasets (outputs are per-feature, no single canonical type).
	 */
	port_type: PortType | null;
	acceptedCategories?: string[];
	subtabs: SubTab[];
}

export const DATASET_MODALITY: ModalityConfig = {
	key: "data",
	label: "Data",
	category: "data",
	port_type: null,
	subtabs: [{ key: "all", label: "All", pipelineTags: [] }]
};

export const MODEL_MODALITY: ModalityConfig = {
	key: "model",
	label: "Models",
	category: "model",
	port_type: null,
	subtabs: [
		{ key: "all", label: "All", pipelineTags: [] },
		{
			key: "text-to-image",
			label: "Text→Image",
			pipelineTags: ["text-to-image"]
		},
		{
			key: "text-generation",
			label: "Text Gen",
			pipelineTags: ["text-generation"]
		},
		{
			key: "image-to-text",
			label: "Image→Text",
			pipelineTags: ["image-to-text"]
		},
		{
			key: "asr",
			label: "ASR",
			pipelineTags: ["automatic-speech-recognition"]
		},
		{ key: "tts", label: "TTS", pipelineTags: ["text-to-speech"] },
		{
			key: "text-to-video",
			label: "Text→Video",
			pipelineTags: ["text-to-video"]
		},
		{
			key: "image-to-image",
			label: "Image→Image",
			pipelineTags: ["image-to-image"]
		},
		{
			key: "image-to-video",
			label: "Image→Video",
			pipelineTags: ["image-to-video"]
		}
	]
};

export const MODALITIES: ModalityConfig[] = [
	{
		key: "image",
		label: "Image",
		category: "image",
		port_type: "image",
		subtabs: [
			{ key: "all", label: "All", pipelineTags: [] },
			{
				key: "generate",
				label: "Generate",
				pipelineTags: ["text-to-image"],
				spaceTags: ["image-generation"]
			},
			{
				key: "edit",
				label: "Edit",
				pipelineTags: ["image-to-image"],
				spaceTags: ["image-editing"]
			},
			{
				key: "enhance",
				label: "Enhance",
				pipelineTags: [],
				spaceTags: ["image-upscaling"],
				query: "upscale super resolution restore enhance denoise"
			},
			{
				key: "detect",
				label: "Detect",
				pipelineTags: ["object-detection", "image-segmentation"]
			},
			{
				key: "removebg",
				label: "Remove Background",
				pipelineTags: [],
				spaceTags: ["background-removal"],
				query: "background removal remove background matting"
			}
		]
	},
	{
		key: "audio",
		label: "Audio",
		category: "audio",
		port_type: "audio",
		subtabs: [
			{ key: "all", label: "All", pipelineTags: [] },
			{
				key: "speech",
				label: "Speech",
				pipelineTags: ["text-to-speech"],
				spaceTags: ["speech-synthesis"]
			},
			{
				key: "music",
				label: "Music",
				pipelineTags: ["text-to-audio"],
				spaceTags: ["music-generation"],
				query: "music generation"
			},
			{
				key: "transcribe",
				label: "Transcribe",
				pipelineTags: ["automatic-speech-recognition"],
				// No matching HF Space category for ASR; freeform query
				// catches the major transcription Spaces.
				query: "speech recognition transcription whisper subtitle"
			},
			{
				key: "clone",
				label: "Clone Voice",
				pipelineTags: [],
				spaceTags: ["voice-cloning"],
				query: "voice clone"
			}
		]
	},
	{
		key: "video",
		label: "Video",
		category: "video",
		port_type: "video",
		subtabs: [
			{ key: "all", label: "All", pipelineTags: [] },
			{
				key: "generate",
				label: "Generate",
				pipelineTags: ["text-to-video"],
				spaceTags: ["video-generation"]
			},
			{
				key: "animate",
				label: "Animate",
				pipelineTags: ["image-to-video"],
				spaceTags: ["character-animation"]
			}
		]
	},
	{
		key: "3d",
		label: "3D",
		category: "3d",
		port_type: "model3d",
		subtabs: [
			{ key: "all", label: "All", pipelineTags: [] },
			{
				key: "from-text",
				label: "From Text",
				pipelineTags: ["text-to-3d"],
				spaceTags: ["3d-modeling"]
			},
			{
				key: "from-image",
				label: "From Image",
				pipelineTags: ["image-to-3d"],
				spaceTags: ["3d-modeling"]
			}
		]
	},
	{
		key: "text",
		label: "Text",
		category: "text",
		port_type: "text",
		acceptedCategories: ["text", "chat"],
		subtabs: [
			{ key: "all", label: "All", pipelineTags: [] },
			{
				key: "generate",
				label: "Generate",
				pipelineTags: ["text-generation"],
				spaceTags: ["text-generation"]
			},
			{
				key: "summarize",
				label: "Summarize",
				pipelineTags: ["summarization"],
				spaceTags: ["text-summarization"]
			},
			{
				key: "translate",
				label: "Translate",
				pipelineTags: ["translation"],
				spaceTags: ["language-translation"]
			},
			{
				key: "code",
				label: "Code",
				pipelineTags: [],
				spaceTags: ["code-generation"],
				query: "code generation programming copilot"
			}
		]
	}
];

/**
 * Port registry — single source of truth for every user-facing port type.
 * Drives reference/subject template generation, port labels in the UI, and
 * modality routing for the compatible-nodes popup. `any` and `file` are
 * deliberately omitted: they exist only as schema-inference fallbacks and
 * never appear as user-selectable reference / subject options.
 */
export interface PortMeta {
	port_type: PortType;
	/** Human label used for reference / subject templates and popup options. */
	label: string;
	/** MODALITIES key this port routes to in the picker, if any. */
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
