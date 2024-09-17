"""This module should not be used directly as its API is subject to change. Instead,
please use the `gr.Interface.from_pipeline()` function."""

from __future__ import annotations

from typing import TYPE_CHECKING

from gradio.pipelines_utils import (
    handle_diffusers_pipeline,
    handle_transformers_js_pipeline,
    handle_transformers_pipeline,
)

if TYPE_CHECKING:
    import diffusers
    import transformers


def load_from_pipeline(
    pipeline: transformers.Pipeline | diffusers.DiffusionPipeline,  # type: ignore
) -> dict:
    """
    Gets the appropriate Interface kwargs for a given Hugging Face transformers.Pipeline or diffusers.DiffusionPipeline.
    pipeline (transformers.Pipeline): the transformers.Pipeline from which to create an interface
    Returns:
    (dict): a dictionary of kwargs that can be used to construct an Interface object
    """

    if str(type(pipeline).__module__).startswith("transformers.pipelines."):
        pipeline_info = handle_transformers_pipeline(pipeline)
    elif str(type(pipeline).__module__).startswith("diffusers.pipelines."):
        pipeline_info = handle_diffusers_pipeline(pipeline)
    else:
        raise ValueError(
            "pipeline must be a transformers.pipeline or diffusers.pipeline"
        )

    def fn(*params):
        if pipeline_info:
            data = pipeline_info["preprocess"](*params)
            if str(type(pipeline).__module__).startswith("transformers.pipelines"):
                from transformers import pipelines

                # special cases that needs to be handled differently
                if isinstance(
                    pipeline,
                    (
                        pipelines.text_classification.TextClassificationPipeline,
                        pipelines.text2text_generation.Text2TextGenerationPipeline,
                        pipelines.text2text_generation.TranslationPipeline,
                        pipelines.token_classification.TokenClassificationPipeline,
                    ),
                ):
                    data = pipeline(*data)
                else:
                    data = pipeline(**data)  # type: ignore
                # special case for object-detection and token-classification pipelines
                # original input image / text sent to postprocess function
                if isinstance(
                    pipeline,
                    (
                        pipelines.object_detection.ObjectDetectionPipeline,
                        pipelines.token_classification.TokenClassificationPipeline,
                    ),
                ):
                    output = pipeline_info["postprocess"](data, params[0])
                else:
                    output = pipeline_info["postprocess"](data)
                return output

            elif str(type(pipeline).__module__).startswith("diffusers.pipelines"):
                data = pipeline(**data)  # type: ignore
                output = pipeline_info["postprocess"](data)
                return output
        else:
            raise ValueError("pipeline_info can not be None.")

    interface_info = pipeline_info.copy() if pipeline_info else {}
    interface_info["fn"] = fn
    del interface_info["preprocess"]
    del interface_info["postprocess"]

    # define the title/description of the Interface
    interface_info["title"] = (
        pipeline.model.config.name_or_path
        if str(type(pipeline).__module__).startswith("transformers.pipelines")
        else pipeline.__class__.__name__
    )

    return interface_info


def load_from_js_pipeline(pipeline) -> dict:
    if str(type(pipeline).__module__).startswith("transformers_js_py."):
        pipeline_info = handle_transformers_js_pipeline(pipeline)
    else:
        raise ValueError("pipeline must be a transformers_js_py's pipeline")

    async def fn(*params):
        preprocess = pipeline_info["preprocess"]
        postprocess = pipeline_info["postprocess"]
        postprocess_takes_inputs = pipeline_info.get("postprocess_takes_inputs", False)

        preprocessed_params = preprocess(*params) if preprocess else params
        pipeline_output = await pipeline(*preprocessed_params)
        postprocessed_output = (
            postprocess(pipeline_output, *(params if postprocess_takes_inputs else ()))
            if postprocess
            else pipeline_output
        )

        return postprocessed_output

    interface_info = {
        "fn": fn,
        "inputs": pipeline_info["inputs"],
        "outputs": pipeline_info["outputs"],
        "title": f"{pipeline.task} ({pipeline.model.config._name_or_path})",
    }
    return interface_info
