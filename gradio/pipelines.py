"""This module should not be used directly as its API is subject to change. Instead,
please use the `gr.Interface.from_pipeline()` function."""

from __future__ import annotations

from typing import TYPE_CHECKING, Dict

from gradio import components

if TYPE_CHECKING:  # Only import for type checking (is False at runtime).
    import transformers


def load_from_pipeline(pipeline: transformers.Pipeline) -> Dict:
    """
    Gets the appropriate Interface kwargs for a given Hugging Face transformers.Pipeline.
    pipeline (transformers.Pipeline): the transformers.Pipeline from which to create an interface
    Returns:
    (dict): a dictionary of kwargs that can be used to construct an Interface object
    """
    try:
        import transformers
    except ImportError:
        raise ImportError(
            "transformers not installed. Please try `pip install transformers`"
        )
    if not isinstance(pipeline, transformers.Pipeline):
        raise ValueError("pipeline must be a transformers.Pipeline")

    # Handle the different pipelines. The has_attr() checks to make sure the pipeline exists in the
    # version of the transformers library that the user has installed.
    if hasattr(transformers, "AudioClassificationPipeline") and isinstance(
        pipeline, transformers.AudioClassificationPipeline
    ):
        pipeline_info = {
            "inputs": components.Audio(
                source="microphone", type="filepath", label="Input"
            ),
            "outputs": components.Label(label="Class"),
            "preprocess": lambda i: {"inputs": i},
            "postprocess": lambda r: {i["label"].split(", ")[0]: i["score"] for i in r},
        }
    elif hasattr(transformers, "AutomaticSpeechRecognitionPipeline") and isinstance(
        pipeline, transformers.AutomaticSpeechRecognitionPipeline
    ):
        pipeline_info = {
            "inputs": components.Audio(
                source="microphone", type="filepath", label="Input"
            ),
            "outputs": components.Textbox(label="Output"),
            "preprocess": lambda i: {"inputs": i},
            "postprocess": lambda r: r["text"],
        }
    elif hasattr(transformers, "FeatureExtractionPipeline") and isinstance(
        pipeline, transformers.FeatureExtractionPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Dataframe(label="Output"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r[0],
        }
    elif hasattr(transformers, "FillMaskPipeline") and isinstance(
        pipeline, transformers.FillMaskPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Label(label="Classification"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: {i["token_str"]: i["score"] for i in r},
        }
    elif hasattr(transformers, "ImageClassificationPipeline") and isinstance(
        pipeline, transformers.ImageClassificationPipeline
    ):
        pipeline_info = {
            "inputs": components.Image(type="filepath", label="Input Image"),
            "outputs": components.Label(type="confidences", label="Classification"),
            "preprocess": lambda i: {"images": i},
            "postprocess": lambda r: {i["label"].split(", ")[0]: i["score"] for i in r},
        }
    elif hasattr(transformers, "QuestionAnsweringPipeline") and isinstance(
        pipeline, transformers.QuestionAnsweringPipeline
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(lines=7, label="Context"),
                components.Textbox(label="Question"),
            ],
            "outputs": [
                components.Textbox(label="Answer"),
                components.Label(label="Score"),
            ],
            "preprocess": lambda c, q: {"context": c, "question": q},
            "postprocess": lambda r: (r["answer"], r["score"]),
        }
    elif hasattr(transformers, "SummarizationPipeline") and isinstance(
        pipeline, transformers.SummarizationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(lines=7, label="Input"),
            "outputs": components.Textbox(label="Summary"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r[0]["summary_text"],
        }
    elif hasattr(transformers, "TextClassificationPipeline") and isinstance(
        pipeline, transformers.TextClassificationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Label(label="Classification"),
            "preprocess": lambda x: [x],
            "postprocess": lambda r: {i["label"].split(", ")[0]: i["score"] for i in r},
        }
    elif hasattr(transformers, "TextGenerationPipeline") and isinstance(
        pipeline, transformers.TextGenerationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Textbox(label="Output"),
            "preprocess": lambda x: {"text_inputs": x},
            "postprocess": lambda r: r[0]["generated_text"],
        }
    elif hasattr(transformers, "TranslationPipeline") and isinstance(
        pipeline, transformers.TranslationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Textbox(label="Translation"),
            "preprocess": lambda x: [x],
            "postprocess": lambda r: r[0]["translation_text"],
        }
    elif hasattr(transformers, "Text2TextGenerationPipeline") and isinstance(
        pipeline, transformers.Text2TextGenerationPipeline
    ):
        pipeline_info = {
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Textbox(label="Generated Text"),
            "preprocess": lambda x: [x],
            "postprocess": lambda r: r[0]["generated_text"],
        }
    elif hasattr(transformers, "ZeroShotClassificationPipeline") and isinstance(
        pipeline, transformers.ZeroShotClassificationPipeline
    ):
        pipeline_info = {
            "inputs": [
                components.Textbox(label="Input"),
                components.Textbox(label="Possible class names (" "comma-separated)"),
                components.Checkbox(label="Allow multiple true classes"),
            ],
            "outputs": components.Label(label="Classification"),
            "preprocess": lambda i, c, m: {
                "sequences": i,
                "candidate_labels": c,
                "multi_label": m,
            },
            "postprocess": lambda r: {
                r["labels"][i]: r["scores"][i] for i in range(len(r["labels"]))
            },
        }
    else:
        raise ValueError("Unsupported pipeline type: {}".format(type(pipeline)))

    # define the function that will be called by the Interface
    def fn(*params):
        data = pipeline_info["preprocess"](*params)
        # special cases that needs to be handled differently
        if isinstance(
            pipeline,
            (
                transformers.TextClassificationPipeline,
                transformers.Text2TextGenerationPipeline,
                transformers.TranslationPipeline,
            ),
        ):
            data = pipeline(*data)
        else:
            data = pipeline(**data)
        output = pipeline_info["postprocess"](data)
        return output

    interface_info = pipeline_info.copy()
    interface_info["fn"] = fn
    del interface_info["preprocess"]
    del interface_info["postprocess"]

    # define the title/description of the Interface
    interface_info["title"] = pipeline.model.__class__.__name__

    return interface_info
