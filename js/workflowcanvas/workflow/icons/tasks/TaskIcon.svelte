<script lang="ts">
	import AllTasks from "./AllTasks.svelte";
	import AudioClassification from "./AudioClassification.svelte";
	import AudioToAudio from "./AudioToAudio.svelte";
	import AutomaticSpeechRecognition from "./AutomaticSpeechRecognition.svelte";
	import DocumentQuestionAnswering from "./DocumentQuestionAnswering.svelte";
	import ImageClassification from "./ImageClassification.svelte";
	import ImageSegmentation from "./ImageSegmentation.svelte";
	import ImageToImage from "./ImageToImage.svelte";
	import ImageToText from "./ImageToText.svelte";
	import ObjectDetection from "./ObjectDetection.svelte";
	import QuestionAnswering from "./QuestionAnswering.svelte";
	import Summarization from "./Summarization.svelte";
	import TextClassification from "./TextClassification.svelte";
	import TextGeneration from "./TextGeneration.svelte";
	import TextToImage from "./TextToImage.svelte";
	import TextToSpeech from "./TextToSpeech.svelte";
	import Translation from "./Translation.svelte";
	import ZeroShotClassification from "./ZeroShotClassification.svelte";

	interface Props {
		pipeline: string;
		classNames?: string;
	}

	let { pipeline, classNames = "" }: Props = $props();

	const ICONS: Record<string, any> = {
		all: AllTasks,
		"text-to-image": TextToImage,
		"image-to-image": ImageToImage,
		"image-to-text": ImageToText,
		"object-detection": ObjectDetection,
		"image-segmentation": ImageSegmentation,
		"image-classification": ImageClassification,
		"depth-estimation": ImageSegmentation,
		"text-to-speech": TextToSpeech,
		"automatic-speech-recognition": AutomaticSpeechRecognition,
		"audio-to-audio": AudioToAudio,
		"text-to-audio": TextToSpeech,
		"audio-classification": AudioClassification,
		"text-to-video": TextToImage,
		"image-to-video": ImageToImage,
		"video-classification": ImageClassification,
		"text-generation": TextGeneration,
		summarization: Summarization,
		translation: Translation,
		"text-classification": TextClassification,
		"question-answering": QuestionAnswering,
		"text-to-3d": TextToImage,
		"image-to-3d": ImageToImage,
		"zero-shot-classification": ZeroShotClassification,
		"zero-shot-image-classification": ZeroShotClassification,
		"zero-shot-object-detection": ObjectDetection,
		"mask-generation": ImageSegmentation,
		"keypoint-detection": ObjectDetection,
		"visual-question-answering": QuestionAnswering,
		"document-question-answering": DocumentQuestionAnswering
	};

	const Component = $derived(ICONS[pipeline]);
</script>

{#if Component}
	<Component {classNames} />
{/if}
