import type { Port } from "./workflow-types";

export interface ModelEndpointSchema {
	name: string;
	inputs: Port[];
	outputs: Port[];
}

let _cache: ModelEndpointSchema[] | null = null;

export async function fetchModelEndpoints(
	server: Record<string, any>
): Promise<ModelEndpointSchema[]> {
	if (_cache) return _cache;
	try {
		const raw = await server.get_model_endpoints([]);
		const parsed = JSON.parse(raw[0]) as ModelEndpointSchema[];
		_cache = parsed;
		return _cache;
	} catch {
		return [];
	}
}

export const PIPELINE_TAG_TO_ENDPOINT: Record<string, string> = {
	"text-to-image": "text_to_image",
	"text-to-speech": "text_to_speech",
	"text-to-audio": "text_to_speech",
	"text-to-video": "text_to_video",
	"image-to-image": "image_to_image",
	"image-to-video": "image_to_video",
	"text-generation": "text_generation",
	"text2text-generation": "text_generation",
	conversational: "text_generation",
	summarization: "summarization",
	translation: "translation",
	"fill-mask": "fill_mask",
	"text-classification": "text_classification",
	"token-classification": "token_classification",
	"zero-shot-classification": "zero_shot_classification",
	"sentence-similarity": "sentence_similarity",
	"question-answering": "question_answering",
	"feature-extraction": "feature_extraction",
	"image-classification": "image_classification",
	"object-detection": "object_detection",
	"image-segmentation": "image_segmentation",
	"image-to-text": "image_to_text",
	"automatic-speech-recognition": "automatic_speech_recognition",
	"audio-classification": "audio_classification",
	"visual-question-answering": "visual_question_answering",
	"document-question-answering": "document_question_answering",
	"depth-estimation": "depth_estimation"
};
