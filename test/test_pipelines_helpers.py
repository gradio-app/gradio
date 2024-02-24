import unittest
from unittest.mock import MagicMock

from diffusers import (
    StableDiffusionDepth2ImgPipeline,
    StableDiffusionImageVariationPipeline,
    StableDiffusionImg2ImgPipeline,
    StableDiffusionInpaintPipeline,
    StableDiffusionInstructPix2PixPipeline,
    StableDiffusionPipeline,
    StableDiffusionUpscalePipeline,
)
from transformers import (
    AudioClassificationPipeline,
    AutomaticSpeechRecognitionPipeline,
    DocumentQuestionAnsweringPipeline,
    FeatureExtractionPipeline,
    FillMaskPipeline,
    ImageClassificationPipeline,
    ImageToTextPipeline,
    ObjectDetectionPipeline,
    QuestionAnsweringPipeline,
    SummarizationPipeline,
    Text2TextGenerationPipeline,
    TextClassificationPipeline,
    TextGenerationPipeline,
    TranslationPipeline,
    VisualQuestionAnsweringPipeline,
    ZeroShotClassificationPipeline,
)

from gradio.pipelines_helpers import (
    _handle_diffusers_pipeline,
    _handle_transformers_pipeline,
)


class TestHandleTransformersPipelines(unittest.TestCase):
    def test_audio_classification_pipeline(self):
        pipe = MagicMock(spec=AudioClassificationPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input"
        assert pipeline_info["outputs"].label == "Class"

    def test_automatic_speech_recognition_pipeline(self):
        pipe = MagicMock(spec=AutomaticSpeechRecognitionPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input"
        assert pipeline_info["outputs"].label == "Output"

    def test_object_detection_pipeline(self):
        pipe = MagicMock(spec=ObjectDetectionPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input Image"
        assert pipeline_info["outputs"].label == "Objects Detected"

    def test_feature_extraction_pipeline(self):
        pipe = MagicMock(spec=FeatureExtractionPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input"
        assert pipeline_info["outputs"].label == "Output"

    def test_fill_mask_pipeline(self):
        pipe = MagicMock(spec=FillMaskPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input"
        assert pipeline_info["outputs"].label == "Classification"

    def test_image_classification_pipeline(self):
        pipe = MagicMock(spec=ImageClassificationPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input Image"
        assert pipeline_info["outputs"].label == "Classification"

    def test_question_answering_pipeline(self):
        pipe = MagicMock(spec=QuestionAnsweringPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Context"
        assert pipeline_info["inputs"][1].label == "Question"
        assert pipeline_info["outputs"][0].label == "Answer"
        assert pipeline_info["outputs"][1].label == "Score"

    def test_summarization_pipeline(self):
        pipe = MagicMock(spec=SummarizationPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input"
        assert pipeline_info["outputs"].label == "Summary"

    def test_text_classification_pipeline(self):
        pipe = MagicMock(spec=TextClassificationPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input"
        assert pipeline_info["outputs"].label == "Classification"

    def test_text_generation_pipeline(self):
        pipe = MagicMock(spec=TextGenerationPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input"
        assert pipeline_info["outputs"].label == "Output"

    def test_translation_pipeline(self):
        pipe = MagicMock(spec=TranslationPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input"
        assert pipeline_info["outputs"].label == "Translation"

    def test_text2text_generation_pipeline(self):
        pipe = MagicMock(spec=Text2TextGenerationPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input"
        assert pipeline_info["outputs"].label == "Generated Text"

    def test_zero_shot_classification_pipeline(self):
        pipe = MagicMock(spec=ZeroShotClassificationPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Input"
        assert (
            pipeline_info["inputs"][1].label == "Possible class names (comma-separated)"
        )
        assert pipeline_info["inputs"][2].label == "Allow multiple true classes"
        assert pipeline_info["outputs"].label == "Classification"

    def test_document_question_answering_pipeline(self):
        pipe = MagicMock(spec=DocumentQuestionAnsweringPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Input Document"
        assert pipeline_info["inputs"][1].label == "Question"
        assert pipeline_info["outputs"].label == "Label"

    def test_visual_question_answering_pipeline(self):
        pipe = MagicMock(spec=VisualQuestionAnsweringPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Input Image"
        assert pipeline_info["inputs"][1].label == "Question"
        assert pipeline_info["outputs"].label == "Score"

    def test_image_to_text_pipeline(self):
        pipe = MagicMock(spec=ImageToTextPipeline)
        pipeline_info = _handle_transformers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"].label == "Input Image"
        assert pipeline_info["outputs"].label == "Text"

    def test_unsupported_pipeline(self):
        pipe = MagicMock()
        with self.assertRaises(ValueError):
            _handle_transformers_pipeline(pipe)


class TestHandleDiffusersPipelines(unittest.TestCase):
    def test_stable_diffusion_pipeline(self):
        pipe = MagicMock(spec=StableDiffusionPipeline)
        pipeline_info = _handle_diffusers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Prompt"
        assert pipeline_info["inputs"][1].label == "Negative prompt"
        assert pipeline_info["outputs"].label == "Generated Image"

    def test_stable_diffusion_img2img_pipeline(self):
        pipe = MagicMock(spec=StableDiffusionImg2ImgPipeline)
        pipeline_info = _handle_diffusers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Prompt"
        assert pipeline_info["inputs"][1].label == "Negative prompt"
        assert pipeline_info["outputs"].label == "Generated Image"

    def test_stable_diffusion_inpaint_pipeline(self):
        pipe = MagicMock(spec=StableDiffusionInpaintPipeline)
        pipeline_info = _handle_diffusers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Prompt"
        assert pipeline_info["inputs"][1].label == "Negative prompt"
        assert pipeline_info["outputs"].label == "Generated Image"

    def test_stable_diffusion_depth2img_pipeline(self):
        pipe = MagicMock(spec=StableDiffusionDepth2ImgPipeline)
        pipeline_info = _handle_diffusers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Prompt"
        assert pipeline_info["inputs"][1].label == "Negative prompt"
        assert pipeline_info["outputs"].label == "Generated Image"

    def test_stable_diffusion_image_variation_pipeline(self):
        pipe = MagicMock(spec=StableDiffusionImageVariationPipeline)
        pipeline_info = _handle_diffusers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Image"
        assert pipeline_info["outputs"].label == "Generated Image"

    def test_stable_diffusion_instruct_pix2pix_pipeline(self):
        pipe = MagicMock(spec=StableDiffusionInstructPix2PixPipeline)
        pipeline_info = _handle_diffusers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Prompt"
        assert pipeline_info["inputs"][1].label == "Negative prompt"
        assert pipeline_info["outputs"].label == "Generated Image"

    def test_stable_diffusion_upscale_pipeline(self):
        pipe = MagicMock(spec=StableDiffusionUpscalePipeline)
        pipeline_info = _handle_diffusers_pipeline(pipe)
        assert pipeline_info is not None
        assert pipeline_info["inputs"][0].label == "Prompt"
        assert pipeline_info["inputs"][1].label == "Negative prompt"
        assert pipeline_info["outputs"].label == "Generated Image"

    def test_unsupported_pipeline(self):
        pipe = MagicMock()
        with self.assertRaises(ValueError):
            _handle_transformers_pipeline(pipe)
