"""
Defines internal helper methods for handling transformers and diffusers pipelines.
These are used by load_from_pipeline method in pipelines.py.
"""

from typing import Any, Dict, Optional

from PIL import Image

from gradio import components


def handle_transformers_pipeline(pipeline: Any) -> Optional[Dict[str, Any]]:
    try:
        import transformers
    except ImportError as ie:
        raise ImportError(
            "transformers not installed. Please try `pip install transformers`"
        ) from ie

    def is_transformers_pipeline_type(pipeline, class_name: str):
        cls = getattr(transformers, class_name, None)
        return cls and isinstance(pipeline, cls)

    # Handle the different pipelines. The has_attr() checks to make sure the pipeline exists in the
    # version of the transformers library that the user has installed.
    if is_transformers_pipeline_type(pipeline, "AudioClassificationPipeline"):
        return {
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
    if is_transformers_pipeline_type(pipeline, "AutomaticSpeechRecognitionPipeline"):
        return {
            "inputs": components.Audio(
                sources=["microphone"], type="filepath", label="Input", render=False
            ),
            "outputs": components.Textbox(label="Output", render=False),
            "preprocess": lambda i: {"inputs": i},
            "postprocess": lambda r: r["text"],
        }
    if is_transformers_pipeline_type(pipeline, "FeatureExtractionPipeline"):
        return {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Dataframe(label="Output", render=False),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r[0],
        }
    if is_transformers_pipeline_type(pipeline, "FillMaskPipeline"):
        return {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Label(label="Classification", render=False),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: {i["token_str"]: i["score"] for i in r},
        }
    if is_transformers_pipeline_type(pipeline, "ImageClassificationPipeline"):
        return {
            "inputs": components.Image(
                type="filepath", label="Input Image", render=False
            ),
            "outputs": components.Label(label="Classification", render=False),
            "preprocess": lambda i: {"images": i},
            "postprocess": lambda r: {i["label"].split(", ")[0]: i["score"] for i in r},
        }
    if is_transformers_pipeline_type(pipeline, "QuestionAnsweringPipeline"):
        return {
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
    if is_transformers_pipeline_type(pipeline, "SummarizationPipeline"):
        return {
            "inputs": components.Textbox(lines=7, label="Input", render=False),
            "outputs": components.Textbox(label="Summary", render=False),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r[0]["summary_text"],
        }
    if is_transformers_pipeline_type(pipeline, "TextClassificationPipeline"):
        return {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Label(label="Classification", render=False),
            "preprocess": lambda x: [x],
            "postprocess": lambda r: {i["label"].split(", ")[0]: i["score"] for i in r},
        }
    if is_transformers_pipeline_type(pipeline, "TextGenerationPipeline"):
        return {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Textbox(label="Output", render=False),
            "preprocess": lambda x: {"text_inputs": x},
            "postprocess": lambda r: r[0]["generated_text"],
        }
    if is_transformers_pipeline_type(pipeline, "TranslationPipeline"):
        return {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Textbox(label="Translation", render=False),
            "preprocess": lambda x: [x],
            "postprocess": lambda r: r[0]["translation_text"],
        }
    if is_transformers_pipeline_type(pipeline, "Text2TextGenerationPipeline"):
        return {
            "inputs": components.Textbox(label="Input", render=False),
            "outputs": components.Textbox(label="Generated Text", render=False),
            "preprocess": lambda x: [x],
            "postprocess": lambda r: r[0]["generated_text"],
        }
    if is_transformers_pipeline_type(pipeline, "ZeroShotClassificationPipeline"):
        return {
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
    if is_transformers_pipeline_type(pipeline, "DocumentQuestionAnsweringPipeline"):
        return {
            "inputs": [
                components.Image(type="filepath", label="Input Document", render=False),
                components.Textbox(label="Question", render=False),
            ],
            "outputs": components.Label(label="Label", render=False),
            "preprocess": lambda img, q: {"image": img, "question": q},
            "postprocess": lambda r: {i["answer"]: i["score"] for i in r},
        }
    if is_transformers_pipeline_type(pipeline, "VisualQuestionAnsweringPipeline"):
        return {
            "inputs": [
                components.Image(type="filepath", label="Input Image", render=False),
                components.Textbox(label="Question", render=False),
            ],
            "outputs": components.Label(label="Score", render=False),
            "preprocess": lambda img, q: {"image": img, "question": q},
            "postprocess": lambda r: {i["answer"]: i["score"] for i in r},
        }
    if is_transformers_pipeline_type(pipeline, "ImageToTextPipeline"):
        return {
            "inputs": components.Image(
                type="filepath", label="Input Image", render=False
            ),
            "outputs": components.Textbox(label="Text", render=False),
            "preprocess": lambda i: {"images": i},
            "postprocess": lambda r: r[0]["generated_text"],
        }
    if is_transformers_pipeline_type(pipeline, "ObjectDetectionPipeline"):
        return {
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
    raise ValueError(f"Unsupported transformers pipeline type: {type(pipeline)}")


def handle_diffusers_pipeline(pipeline: Any) -> Optional[Dict[str, Any]]:
    try:
        import diffusers
    except ImportError as ie:
        raise ImportError(
            "diffusers not installed. Please try `pip install diffusers`"
        ) from ie

    def is_diffusers_pipeline_type(pipeline, class_name: str):
        cls = getattr(diffusers, class_name, None)
        return cls and isinstance(pipeline, cls)

    if is_diffusers_pipeline_type(pipeline, "StableDiffusionPipeline"):
        return {
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
    if is_diffusers_pipeline_type(pipeline, "StableDiffusionImg2ImgPipeline"):
        return {
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
    if is_diffusers_pipeline_type(pipeline, "StableDiffusionInpaintPipeline"):
        return {
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
    if is_diffusers_pipeline_type(pipeline, "StableDiffusionDepth2ImgPipeline"):
        return {
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
    if is_diffusers_pipeline_type(pipeline, "StableDiffusionImageVariationPipeline"):
        return {
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
    if is_diffusers_pipeline_type(pipeline, "StableDiffusionInstructPix2PixPipeline"):
        return {
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
    if is_diffusers_pipeline_type(pipeline, "StableDiffusionUpscalePipeline"):
        return {
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
    raise ValueError(f"Unsupported diffusers pipeline type: {type(pipeline)}")
