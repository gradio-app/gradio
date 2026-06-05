/**
 * Curated lists of featured spaces and models, surfaced as the default tab
 * in the node picker. Edit these arrays to change what users see first when
 * they open the picker for a given modality.
 *
 * `modality` must match a `MODALITIES[*].key` (image / audio / video / text / 3d)
 * or `"data"` for datasets. `pipeline_tag` is required for models so we can
 * resolve their input/output port schema from TASK_SCHEMAS.
 */
export interface FeaturedItem {
	id: string;
	title: string;
	description: string;
	modality: string;
	pipeline_tag?: string;
	likes?: number;
	zero_gpu?: boolean;
}

export const FEATURED_SPACES: FeaturedItem[] = [
	{
		id: "black-forest-labs/FLUX.1-schnell",
		title: "FLUX.1 schnell",
		description: "Fast, high-quality text-to-image",
		modality: "image",
		pipeline_tag: "text-to-image",
		zero_gpu: true
	},
	{
		id: "stabilityai/stable-diffusion-3.5-large",
		title: "Stable Diffusion 3.5 Large",
		description: "High-fidelity text-to-image",
		modality: "image",
		pipeline_tag: "text-to-image",
		zero_gpu: true
	},
	{
		id: "briaai/BRIA-RMBG-2.0",
		title: "BRIA Background Removal",
		description: "Remove image backgrounds",
		modality: "image",
		zero_gpu: true
	},
	{
		id: "hf-audio/whisper-large-v3-turbo",
		title: "Whisper Large v3 Turbo",
		description: "Fast speech-to-text",
		modality: "audio",
		pipeline_tag: "automatic-speech-recognition",
		zero_gpu: true
	},
	{
		id: "coqui/xtts",
		title: "Coqui XTTS",
		description: "Multilingual text-to-speech with voice cloning",
		modality: "audio",
		pipeline_tag: "text-to-speech",
		zero_gpu: true
	}
];

export const FEATURED_MODELS: FeaturedItem[] = [
	{
		id: "black-forest-labs/FLUX.1-schnell",
		title: "FLUX.1 schnell",
		description: "Text-to-image",
		modality: "image",
		pipeline_tag: "text-to-image"
	},
	{
		id: "stabilityai/stable-diffusion-3.5-large-turbo",
		title: "SD 3.5 Large Turbo",
		description: "Fast text-to-image",
		modality: "image",
		pipeline_tag: "text-to-image"
	},
	{
		id: "Qwen/Qwen2.5-VL-7B-Instruct",
		title: "Qwen2.5-VL 7B",
		description: "Image understanding & captioning",
		modality: "image",
		pipeline_tag: "image-to-text"
	},
	{
		id: "openai/whisper-large-v3-turbo",
		title: "Whisper Large v3 Turbo",
		description: "Speech-to-text",
		modality: "audio",
		pipeline_tag: "automatic-speech-recognition"
	},
	{
		id: "meta-llama/Llama-3.2-3B-Instruct",
		title: "Llama 3.2 3B Instruct",
		description: "Open-weights text generation",
		modality: "text",
		pipeline_tag: "text-generation"
	},
	{
		id: "Qwen/Qwen2.5-7B-Instruct",
		title: "Qwen 2.5 7B",
		description: "Multilingual text generation",
		modality: "text",
		pipeline_tag: "text-generation"
	}
];
