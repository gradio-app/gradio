"""
Defines internal helper methods for handling transformers and diffusers pipelines.
These are used by load_from_pipeline method in pipelines.py.
"""

from typing import Any

from gradio import components
from PIL import Image


def _handle_transformers_pipeline(pipeline: Any) -> dict:
    try:
        import transformers
        from transformers import pipelines

    except ImportError as ie:
        raise ImportError(
            "transformers not installed. Please try `pip install transformers`"
        ) from ie

    # Handle the different pipelines. The has_attr() checks to make sure the pipeline exists in the
    # version of the transformers library that the user has installed.
    if hasattr(transformers, "AudioClassificationPipeline") and isinstance(
        pipeline, pipelines.audio_classification.AudioClassificationPipeline
    ):
        pipeline_info = {
            "inputs": components.Audio(
                sources=["microphone"],
                type="filepath",
                label="Input",
                render=False,
            ),
            "outputs": components.Label(label="Class", render=False),
            "preprocess": lambda i: {"inputs": i},
            "postprocess": lambda r: {i["label"].split(", ")[0]: i["score"] for i in r},
        }
        return pipeline_info

    elif hasattr(transformers, "AutomaticSpeechRecognitionPipeline") and isinstance(
        pipeline,
        pipelines.automatic_speech_recognition.AutomaticSpeechRecognitionPipeline,
    ):
        pipeline_info = {
            "inputs": components.Audio(
                sources=["microphone"], type="filepath", label="Input", render=False
            ),
            "outputs": components.Textbox(label="Output", render=False),
            "preprocess": lambda i: {"inputs": i},
            "postprocess": lambda r: r["text"],
        }
        return pipeline_info

    elif hasattr(transformers, "FeatureExtractionPipeline") and isinstance(
        pipeline, pipelines.feature_extraction.FeatureExtractionPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Dataframe(label="Output", render=False),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r[0],
        }
        return pipeline_info

    elif hasattr(transformers, "FillMaskPipeline") and isinstance(
        pipeline, pipelines.fill_mask.FillMaskPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Label(label="Classification", render=False),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: {i["token_str"]: i["score"] for i in r},
        }
        return pipeline_info

    elif hasattr(transformers, "ImageClassificationPipeline") and isinstance(
        pipeline, pipelines.image_classification.ImageClassificationPipeline
    ):
        pipeline_info = {
            "inputs": components.Image(
                type="filepath", label="Input Image", render=False
            ),
            "outputs": components.Label(label="Classification", render=False),
            "preprocess": lambda i: {"images": i},
            "postprocess": lambda r: {i["label"].split(", ")[0]: i["score"] for i in r},
        }
        return pipeline_info

    elif hasattr(transformers, "QuestionAnsweringPipeline") and isinstance(
        pipeline, pipelines.question_answering.QuestionAnsweringPipeline
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(lines=7, label="Context", render=False),
                components.Textbox(label="Question", render=False),
            ],
            "outputs": [
                components.Textbox(label="Answer", render=False),
                components.Label(label="Score", render=False),
            ],
            "preprocess": lambda c, q: {"context": c, "question": q},
            "postprocess": lambda r: (r["answer"], r["score"]),
        }
        return pipeline_info

    elif hasattr(transformers, "SummarizationPipeline") and isinstance(
        pipeline, pipelines.text2text_generation.SummarizationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(lines=7, label="Input", render=False),
            "outputs": components.Textbox(label="Summary", render=False),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r[0]["summary_text"],
        }
        return pipeline_info

    elif hasattr(transformers, "TextClassificationPipeline") and isinstance(
        pipeline, pipelines.text_classification.TextClassificationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Label(label="Classification", render=False),
            "preprocess": lambda x: [x],
            "postprocess": lambda r: {i["label"].split(", ")[0]: i["score"] for i in r},
        }
        return pipeline_info

    elif hasattr(transformers, "TextGenerationPipeline") and isinstance(
        pipeline, pipelines.text_generation.TextGenerationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Textbox(label="Output", render=False),
            "preprocess": lambda x: {"text_inputs": x},
            "postprocess": lambda r: r[0]["generated_text"],
        }
        return pipeline_info

    elif hasattr(transformers, "TranslationPipeline") and isinstance(
        pipeline, pipelines.text2text_generation.TranslationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Textbox(label="Translation", render=False),
            "preprocess": lambda x: [x],
            "postprocess": lambda r: r[0]["translation_text"],
        }
    elif hasattr(transformers, "Text2TextGenerationPipeline") and isinstance(
        pipeline, pipelines.text2text_generation.Text2TextGenerationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Textbox(label="Generated Text", render=False),
            "preprocess": lambda x: [x],
            "postprocess": lambda r: r[0]["generated_text"],
        }
        return pipeline_info

    elif hasattr(transformers, "ZeroShotClassificationPipeline") and isinstance(
        pipeline, pipelines.zero_shot_classification.ZeroShotClassificationPipeline
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(label="Input", render=False),
                components.Textbox(
                    label="Possible class names (" "comma-separated)", render=False
                ),
                components.Checkbox(label="Allow multiple true classes", render=False),
            ],
            "outputs": components.Label(label="Classification", render=False),
            "preprocess": lambda i, c, m: {
                "sequences": i,
                "candidate_labels": c,
                "multi_label": m,
            },
            "postprocess": lambda r: {
                r["labels"][i]: r["scores"][i] for i in range(len(r["labels"]))
            },
        }
        return pipeline_info

    elif hasattr(transformers, "DocumentQuestionAnsweringPipeline") and isinstance(
        pipeline,
        pipelines.document_question_answering.DocumentQuestionAnsweringPipeline,  # type: ignore
    ):
        pipeline_info = {
            "inputs": [
                components.Image(type="filepath", label="Input Document", render=False),
                components.Textbox(label="Question", render=False),
            ],
            "outputs": components.Label(label="Label", render=False),
            "preprocess": lambda img, q: {"image": img, "question": q},
            "postprocess": lambda r: {i["answer"]: i["score"] for i in r},
        }
        return pipeline_info

    elif hasattr(transformers, "VisualQuestionAnsweringPipeline") and isinstance(
        pipeline, pipelines.visual_question_answering.VisualQuestionAnsweringPipeline
    ):
        pipeline_info = {
            "inputs": [
                components.Image(type="filepath", label="Input Image", render=False),
                components.Textbox(label="Question", render=False),
            ],
            "outputs": components.Label(label="Score", render=False),
            "preprocess": lambda img, q: {"image": img, "question": q},
            "postprocess": lambda r: {i["answer"]: i["score"] for i in r},
        }
        return pipeline_info

    elif hasattr(transformers, "ImageToTextPipeline") and isinstance(
        pipeline,
        pipelines.image_to_text.ImageToTextPipeline,  # type: ignore
    ):
        pipeline_info = {
            "inputs": components.Image(
                type="filepath", label="Input Image", render=False
            ),
            "outputs": components.Textbox(label="Text", render=False),
            "preprocess": lambda i: {"images": i},
            "postprocess": lambda r: r[0]["generated_text"],
        }
        return pipeline_info

    elif hasattr(transformers, "ObjectDetectionPipeline") and isinstance(
        pipeline, pipelines.object_detection.ObjectDetectionPipeline
    ):
        pipeline_info = {
            "inputs": components.Image(
                type="filepath", label="Input Image", render=False
            ),
            "outputs": components.AnnotatedImage(
                label="Objects Detected", render=False
            ),
            "preprocess": lambda i: {"inputs": i},
            "postprocess": lambda r, img: (
                img,
                [
                    (
                        (
                            i["box"]["xmin"],
                            i["box"]["ymin"],
                            i["box"]["xmax"],
                            i["box"]["ymax"],
                        ),
                        i["label"],
                    )
                    for i in r
                ],
            ),
        }
        return pipeline_info

    else:
        raise ValueError(f"Unsupported pipeline type: {type(pipeline)}")


def _handle_diffusers_pipeline(pipeline: Any) -> dict:
    try:
        import diffusers
        from diffusers import pipelines as diffuser_pipelines

    except ImportError as ie:
        raise ImportError(
            "diffusers not installed. Please try `pip install diffusers`"
        ) from ie

    # Handle diffuser pipelines
    if hasattr(diffusers, "StableDiffusionPipeline") and isinstance(
        pipeline,
        diffuser_pipelines.stable_diffusion.pipeline_stable_diffusion.StableDiffusionPipeline,
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(label="Prompt", render=False),
                components.Textbox(label="Negative prompt", render=False),
                components.Slider(
                    label="Number of inference steps",
                    minimum=1,
                    maximum=500,
                    value=50,
                    step=1,
                ),
                components.Slider(
                    label="Guidance scale",
                    minimum=1,
                    maximum=20,
                    value=7.5,
                    step=0.5,
                ),
            ],
            "outputs": components.Image(
                label="Generated Image", render=False, type="pil"
            ),
            "preprocess": lambda prompt, n_prompt, num_inf_steps, g_scale: {
                "prompt": prompt,
                "negative_prompt": n_prompt,
                "num_inference_steps": num_inf_steps,
                "guidance_scale": g_scale,
            },
            "postprocess": lambda r: r["images"][0],
        }
        return pipeline_info

    elif hasattr(diffusers, "StableDiffusionImg2ImgPipeline") and isinstance(
        pipeline,
        diffuser_pipelines.stable_diffusion.pipeline_stable_diffusion_img2img.StableDiffusionImg2ImgPipeline,
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(label="Prompt", render=False),
                components.Textbox(label="Negative prompt", render=False),
                components.Image(type="filepath", label="Image", render=False),
                components.Slider(
                    label="Strength", minimum=0, maximum=1, value=0.8, step=0.1
                ),
                components.Slider(
                    label="Number of inference steps",
                    minimum=1,
                    maximum=500,
                    value=50,
                    step=1,
                ),
                components.Slider(
                    label="Guidance scale",
                    minimum=1,
                    maximum=20,
                    value=7.5,
                    step=0.5,
                ),
            ],
            "outputs": components.Image(
                label="Generated Image", render=False, type="pil"
            ),
            "preprocess": lambda prompt,
            n_prompt,
            image,
            strength,
            num_inf_steps,
            g_scale: {
                "prompt": prompt,
                "image": Image.open(image).resize((768, 768)),
                "negative_prompt": n_prompt,
                "num_inference_steps": num_inf_steps,
                "guidance_scale": g_scale,
                "strength": strength,
            },
            "postprocess": lambda r: r["images"][0],
        }
        return pipeline_info

    elif hasattr(diffusers, "StableDiffusionInpaintPipeline") and isinstance(
        pipeline,
        diffuser_pipelines.stable_diffusion.pipeline_stable_diffusion_inpaint.StableDiffusionInpaintPipeline,
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(label="Prompt", render=False),
                components.Textbox(label="Negative prompt", render=False),
                components.Image(type="filepath", label="Image", render=False),
                components.Image(type="filepath", label="Mask Image", render=False),
                components.Slider(
                    label="Strength", minimum=0, maximum=1, value=0.8, step=0.1
                ),
                components.Slider(
                    label="Number of inference steps",
                    minimum=1,
                    maximum=500,
                    value=50,
                    step=1,
                ),
                components.Slider(
                    label="Guidance scale",
                    minimum=1,
                    maximum=20,
                    value=7.5,
                    step=0.5,
                ),
            ],
            "outputs": components.Image(
                label="Generated Image", render=False, type="pil"
            ),
            "preprocess": lambda prompt,
            n_prompt,
            image,
            mask_image,
            strength,
            num_inf_steps,
            g_scale: {
                "prompt": prompt,
                "image": Image.open(image).resize((768, 768)),
                "mask_image": Image.open(mask_image).resize((768, 768)),
                "negative_prompt": n_prompt,
                "num_inference_steps": num_inf_steps,
                "guidance_scale": g_scale,
                "strength": strength,
            },
            "postprocess": lambda r: r["images"][0],
        }
        return pipeline_info

    elif hasattr(diffusers, "StableDiffusionDepth2ImgPipeline") and isinstance(
        pipeline,
        diffuser_pipelines.stable_diffusion.pipeline_stable_diffusion_depth2img.StableDiffusionDepth2ImgPipeline,
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(label="Prompt", render=False),
                components.Textbox(label="Negative prompt", render=False),
                components.Image(type="filepath", label="Image", render=False),
                components.Slider(
                    label="Strength", minimum=0, maximum=1, value=0.8, step=0.1
                ),
                components.Slider(
                    label="Number of inference steps",
                    minimum=1,
                    maximum=500,
                    value=50,
                    step=1,
                ),
                components.Slider(
                    label="Guidance scale",
                    minimum=1,
                    maximum=20,
                    value=7.5,
                    step=0.5,
                ),
            ],
            "outputs": components.Image(
                label="Generated Image", render=False, type="pil"
            ),
            "preprocess": lambda prompt,
            n_prompt,
            image,
            strength,
            num_inf_steps,
            g_scale: {
                "prompt": prompt,
                "image": Image.open(image).resize((768, 768)),
                "negative_prompt": n_prompt,
                "num_inference_steps": num_inf_steps,
                "guidance_scale": g_scale,
                "strength": strength,
            },
            "postprocess": lambda r: r["images"][0],
        }
        return pipeline_info

    elif hasattr(diffusers, "StableDiffusionImageVariationPipeline") and isinstance(
        pipeline,
        diffuser_pipelines.stable_diffusion.pipeline_stable_diffusion_image_variation.StableDiffusionImageVariationPipeline,
    ):
        pipeline_info = {
            "inputs": [
                components.Image(type="filepath", label="Image", render=False),
                components.Slider(
                    label="Number of inference steps",
                    minimum=1,
                    maximum=500,
                    value=50,
                    step=1,
                ),
                components.Slider(
                    label="Guidance scale",
                    minimum=1,
                    maximum=20,
                    value=7.5,
                    step=0.5,
                ),
            ],
            "outputs": components.Image(
                label="Generated Image", render=False, type="pil"
            ),
            "preprocess": lambda image, num_inf_steps, g_scale: {
                "image": Image.open(image).resize((768, 768)),
                "num_inference_steps": num_inf_steps,
                "guidance_scale": g_scale,
            },
            "postprocess": lambda r: r["images"][0],
        }
        return pipeline_info

    elif hasattr(diffusers, "StableDiffusionInstructPix2PixPipeline") and isinstance(
        pipeline,
        diffuser_pipelines.stable_diffusion.pipeline_stable_diffusion_instruct_pix2pix.StableDiffusionInstructPix2PixPipeline,
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(label="Prompt", render=False),
                components.Textbox(label="Negative prompt", render=False),
                components.Image(type="filepath", label="Image", render=False),
                components.Slider(
                    label="Number of inference steps",
                    minimum=1,
                    maximum=500,
                    value=50,
                    step=1,
                ),
                components.Slider(
                    label="Guidance scale",
                    minimum=1,
                    maximum=20,
                    value=7.5,
                    step=0.5,
                ),
                components.Slider(
                    label="Image Guidance scale",
                    minimum=1,
                    maximum=5,
                    value=1.5,
                    step=0.5,
                ),
            ],
            "outputs": components.Image(
                label="Generated Image", render=False, type="pil"
            ),
            "preprocess": lambda prompt,
            n_prompt,
            image,
            num_inf_steps,
            g_scale,
            img_g_scale: {
                "prompt": prompt,
                "image": Image.open(image).resize((768, 768)),
                "negative_prompt": n_prompt,
                "num_inference_steps": num_inf_steps,
                "guidance_scale": g_scale,
                "image_guidance_scale": img_g_scale,
            },
            "postprocess": lambda r: r["images"][0],
        }
        return pipeline_info

    elif hasattr(diffusers, "StableDiffusionUpscalePipeline") and isinstance(
        pipeline,
        diffuser_pipelines.stable_diffusion.pipeline_stable_diffusion_upscale.StableDiffusionUpscalePipeline,
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(label="Prompt", render=False),
                components.Textbox(label="Negative prompt", render=False),
                components.Image(type="filepath", label="Image", render=False),
                components.Slider(
                    label="Number of inference steps",
                    minimum=1,
                    maximum=500,
                    value=50,
                    step=1,
                ),
                components.Slider(
                    label="Guidance scale",
                    minimum=1,
                    maximum=20,
                    value=7.5,
                    step=0.5,
                ),
                components.Slider(
                    label="Noise level", minimum=1, maximum=100, value=20, step=1
                ),
            ],
            "outputs": components.Image(
                label="Generated Image", render=False, type="pil"
            ),
            "preprocess": lambda prompt,
            n_prompt,
            image,
            num_inf_steps,
            g_scale,
            noise_level: {
                "prompt": prompt,
                "image": Image.open(image).resize((768, 768)),
                "negative_prompt": n_prompt,
                "num_inference_steps": num_inf_steps,
                "guidance_scale": g_scale,
                "noise_level": noise_level,
            },
            "postprocess": lambda r: r["images"][0],
        }
        return pipeline_info

    else:
        raise ValueError(f"Unsupported pipeline type: {type(pipeline)}")

