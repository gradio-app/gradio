"""This module should not be used directly as its API is subject to change. Instead,
use the `gr.Blocks.load()` or `gr.Interface.load()` functions."""

from __future__ import annotations

import base64
import json
import math
import numbers
import operator
import re
import warnings
from copy import deepcopy
from typing import TYPE_CHECKING, Callable, Dict, List, Tuple

import requests
import yaml

import gradio
from gradio import components, utils

if TYPE_CHECKING:
    from gradio.components import DataframeData


class TooManyRequestsError(Exception):
    """Raised when the Hugging Face API returns a 429 status code."""

    pass


def load_blocks_from_repo(name, src=None, api_key=None, alias=None, **kwargs):
    """Creates and returns a Blocks instance from several kinds of Hugging Face repos:
    1) A model repo
    2) A Spaces repo running Gradio 2.x
    3) A Spaces repo running Gradio 3.x
    """
    if src is None:
        tokens = name.split(
            "/"
        )  # Separate the source (e.g. "huggingface") from the repo name (e.g. "google/vit-base-patch16-224")
        assert (
            len(tokens) > 1
        ), "Either `src` parameter must be provided, or `name` must be formatted as {src}/{repo name}"
        src = tokens[0]
        name = "/".join(tokens[1:])
    assert src.lower() in factory_methods, "parameter: src must be one of {}".format(
        factory_methods.keys()
    )
    blocks: gradio.Blocks = factory_methods[src](name, api_key, alias, **kwargs)
    return blocks


def get_tabular_examples(model_name) -> Dict[str, List[float]]:
    readme = requests.get(f"https://huggingface.co/{model_name}/resolve/main/README.md")
    if readme.status_code != 200:
        warnings.warn(f"Cannot load examples from README for {model_name}", UserWarning)
        example_data = {}
    else:
        yaml_regex = re.search(
            "(?:^|[\r\n])---[\n\r]+([\\S\\s]*?)[\n\r]+---([\n\r]|$)", readme.text
        )
        example_yaml = next(yaml.safe_load_all(readme.text[: yaml_regex.span()[-1]]))
        example_data = example_yaml.get("widget", {}).get("structuredData", {})
    if not example_data:
        raise ValueError(
            f"No example data found in README.md of {model_name} - Cannot build gradio demo. "
            "See the README.md here: https://huggingface.co/scikit-learn/tabular-playground/blob/main/README.md "
            "for a reference on how to provide example data to your model."
        )
    # replace nan with string NaN for inference API
    for data in example_data.values():
        for i, val in enumerate(data):
            if isinstance(val, numbers.Number) and math.isnan(val):
                data[i] = "NaN"
    return example_data


def cols_to_rows(
    example_data: Dict[str, List[float]]
) -> Tuple[List[str], List[List[float]]]:
    headers = list(example_data.keys())
    n_rows = max(len(example_data[header] or []) for header in headers)
    data = []
    for row_index in range(n_rows):
        row_data = []
        for header in headers:
            col = example_data[header] or []
            if row_index >= len(col):
                row_data.append("NaN")
            else:
                row_data.append(col[row_index])
        data.append(row_data)
    return headers, data


def rows_to_cols(
    incoming_data: DataframeData,
) -> Dict[str, Dict[str, Dict[str, List[str]]]]:
    data_column_wise = {}
    for i, header in enumerate(incoming_data["headers"]):
        data_column_wise[header] = [str(row[i]) for row in incoming_data["data"]]
    return {"inputs": {"data": data_column_wise}}


def get_models_interface(model_name, api_key, alias, **kwargs):
    model_url = "https://huggingface.co/{}".format(model_name)
    api_url = "https://api-inference.huggingface.co/models/{}".format(model_name)
    print("Fetching model from: {}".format(model_url))

    if api_key is not None:
        headers = {"Authorization": f"Bearer {api_key}"}
    else:
        headers = {}

    # Checking if model exists, and if so, it gets the pipeline
    response = requests.request("GET", api_url, headers=headers)
    assert response.status_code == 200, "Invalid model name or src"
    p = response.json().get("pipeline_tag")

    def postprocess_label(scores):
        sorted_pred = sorted(scores.items(), key=operator.itemgetter(1), reverse=True)
        return {
            "label": sorted_pred[0][0],
            "confidences": [
                {"label": pred[0], "confidence": pred[1]} for pred in sorted_pred
            ],
        }

    def encode_to_base64(r: requests.Response) -> str:
        # Handles the different ways HF API returns the prediction
        base64_repr = base64.b64encode(r.content).decode("utf-8")
        data_prefix = ";base64,"
        # Case 1: base64 representation already includes data prefix
        if data_prefix in base64_repr:
            return base64_repr
        else:
            content_type = r.headers.get("content-type")
            # Case 2: the data prefix is a key in the response
            if content_type == "application/json":
                try:
                    content_type = r.json()[0]["content-type"]
                    base64_repr = r.json()[0]["blob"]
                except KeyError:
                    raise ValueError(
                        "Cannot determine content type returned" "by external API."
                    )
            # Case 3: the data prefix is included in the response headers
            else:
                pass
            new_base64 = "data:{};base64,".format(content_type) + base64_repr
            return new_base64

    pipelines = {
        "audio-classification": {
            # example model: ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition
            "inputs": components.Audio(source="upload", type="filepath", label="Input"),
            "outputs": components.Label(label="Class"),
            "preprocess": lambda i: base64.b64decode(
                i["data"].split(",")[1]
            ),  # convert the base64 representation to binary
            "postprocess": lambda r: postprocess_label(
                {i["label"].split(", ")[0]: i["score"] for i in r.json()}
            ),
        },
        "audio-to-audio": {
            # example model: speechbrain/mtl-mimic-voicebank
            "inputs": components.Audio(source="upload", type="filepath", label="Input"),
            "outputs": components.Audio(label="Output"),
            "preprocess": lambda i: base64.b64decode(
                i["data"].split(",")[1]
            ),  # convert the base64 representation to binary
            "postprocess": encode_to_base64,
        },
        "automatic-speech-recognition": {
            # example model: jonatasgrosman/wav2vec2-large-xlsr-53-english
            "inputs": components.Audio(source="upload", type="filepath", label="Input"),
            "outputs": components.Textbox(label="Output"),
            "preprocess": lambda i: base64.b64decode(
                i["data"].split(",")[1]
            ),  # convert the base64 representation to binary
            "postprocess": lambda r: r.json()["text"],
        },
        "feature-extraction": {
            # example model: julien-c/distilbert-feature-extraction
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Dataframe(label="Output"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r.json()[0],
        },
        "fill-mask": {
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Label(label="Classification"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: postprocess_label(
                {i["token_str"]: i["score"] for i in r.json()}
            ),
        },
        "image-classification": {
            # Example: google/vit-base-patch16-224
            "inputs": components.Image(type="filepath", label="Input Image"),
            "outputs": components.Label(label="Classification"),
            "preprocess": lambda i: base64.b64decode(
                i.split(",")[1]
            ),  # convert the base64 representation to binary
            "postprocess": lambda r: postprocess_label(
                {i["label"].split(", ")[0]: i["score"] for i in r.json()}
            ),
        },
        "question-answering": {
            # Example: deepset/xlm-roberta-base-squad2
            "inputs": [
                components.Textbox(lines=7, label="Context"),
                components.Textbox(label="Question"),
            ],
            "outputs": [
                components.Textbox(label="Answer"),
                components.Label(label="Score"),
            ],
            "preprocess": lambda c, q: {"inputs": {"context": c, "question": q}},
            "postprocess": lambda r: (r.json()["answer"], {"label": r.json()["score"]}),
        },
        "summarization": {
            # Example: facebook/bart-large-cnn
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Textbox(label="Summary"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r.json()[0]["summary_text"],
        },
        "text-classification": {
            # Example: distilbert-base-uncased-finetuned-sst-2-english
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Label(label="Classification"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: postprocess_label(
                {i["label"].split(", ")[0]: i["score"] for i in r.json()[0]}
            ),
        },
        "text-generation": {
            # Example: gpt2
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Textbox(label="Output"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r.json()[0]["generated_text"],
        },
        "text2text-generation": {
            # Example: valhalla/t5-small-qa-qg-hl
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Textbox(label="Generated Text"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r.json()[0]["generated_text"],
        },
        "translation": {
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Textbox(label="Translation"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r.json()[0]["translation_text"],
        },
        "zero-shot-classification": {
            # Example: facebook/bart-large-mnli
            "inputs": [
                components.Textbox(label="Input"),
                components.Textbox(label="Possible class names (" "comma-separated)"),
                components.Checkbox(label="Allow multiple true classes"),
            ],
            "outputs": components.Label(label="Classification"),
            "preprocess": lambda i, c, m: {
                "inputs": i,
                "parameters": {"candidate_labels": c, "multi_class": m},
            },
            "postprocess": lambda r: postprocess_label(
                {
                    r.json()["labels"][i]: r.json()["scores"][i]
                    for i in range(len(r.json()["labels"]))
                }
            ),
        },
        "sentence-similarity": {
            # Example: sentence-transformers/distilbert-base-nli-stsb-mean-tokens
            "inputs": [
                components.Textbox(
                    value="That is a happy person", label="Source Sentence"
                ),
                components.Textbox(
                    lines=7,
                    placeholder="Separate each sentence by a newline",
                    label="Sentences to compare to",
                ),
            ],
            "outputs": components.Label(label="Classification"),
            "preprocess": lambda src, sentences: {
                "inputs": {
                    "source_sentence": src,
                    "sentences": [s for s in sentences.splitlines() if s != ""],
                }
            },
            "postprocess": lambda r: postprocess_label(
                {f"sentence {i}": v for i, v in enumerate(r.json())}
            ),
        },
        "text-to-speech": {
            # Example: julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Audio(label="Audio"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": encode_to_base64,
        },
        "text-to-image": {
            # example model: osanseviero/BigGAN-deep-128
            "inputs": components.Textbox(label="Input"),
            "outputs": components.Image(label="Output"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": encode_to_base64,
        },
        "token-classification": {
            # example model: huggingface-course/bert-finetuned-ner
            "inputs": components.Textbox(label="Input"),
            "outputs": components.HighlightedText(label="Output"),
            "preprocess": lambda x: {"inputs": x},
            "postprocess": lambda r: r,  # Handled as a special case in query_huggingface_api()
        },
    }

    if p in ["tabular-classification", "tabular-regression"]:
        example_data = get_tabular_examples(model_name)
        col_names, example_data = cols_to_rows(example_data)
        example_data = [[example_data]] if example_data else None

        pipelines[p] = {
            "inputs": components.Dataframe(
                label="Input Rows",
                type="pandas",
                headers=col_names,
                col_count=(len(col_names), "fixed"),
            ),
            "outputs": components.Dataframe(
                label="Predictions", type="array", headers=["prediction"]
            ),
            "preprocess": rows_to_cols,
            "postprocess": lambda r: {
                "headers": ["prediction"],
                "data": [[pred] for pred in json.loads(r.text)],
            },
            "examples": example_data,
        }

    if p is None or not (p in pipelines):
        raise ValueError("Unsupported pipeline type: {}".format(p))

    pipeline = pipelines[p]

    def query_huggingface_api(*params):
        # Convert to a list of input components
        data = pipeline["preprocess"](*params)
        if isinstance(
            data, dict
        ):  # HF doesn't allow additional parameters for binary files (e.g. images or audio files)
            data.update({"options": {"wait_for_model": True}})
            data = json.dumps(data)
        response = requests.request("POST", api_url, headers=headers, data=data)
        if not (response.status_code == 200):
            errors_json = response.json()
            errors, warns = "", ""
            if errors_json.get("error"):
                errors = f", Error: {errors_json.get('error')}"
            if errors_json.get("warnings"):
                warns = f", Warnings: {errors_json.get('warnings')}"
            raise ValueError(
                f"Could not complete request to HuggingFace API, Status Code: {response.status_code}"
                + errors
                + warns
            )
        if (
            p == "token-classification"
        ):  # Handle as a special case since HF API only returns the named entities and we need the input as well
            ner_groups = response.json()
            input_string = params[0]
            response = utils.format_ner_list(input_string, ner_groups)
        output = pipeline["postprocess"](response)
        return output

    if alias is None:
        query_huggingface_api.__name__ = model_name
    else:
        query_huggingface_api.__name__ = alias

    interface_info = {
        "fn": query_huggingface_api,
        "inputs": pipeline["inputs"],
        "outputs": pipeline["outputs"],
        "title": model_name,
        "examples": pipeline.get("examples"),
    }

    kwargs = dict(interface_info, **kwargs)
    kwargs["_api_mode"] = True  # So interface doesn't run pre/postprocess.
    interface = gradio.Interface(**kwargs)
    return interface


def get_spaces(model_name, api_key, alias, **kwargs):
    space_url = "https://huggingface.co/spaces/{}".format(model_name)
    print("Fetching interface from: {}".format(space_url))
    iframe_url = "https://hf.space/embed/{}/+".format(model_name)

    r = requests.get(iframe_url)
    result = re.search(
        r"window.gradio_config = (.*?);[\s]*</script>", r.text
    )  # some basic regex to extract the config
    try:
        config = json.loads(result.group(1))
    except AttributeError:
        raise ValueError("Could not load the Space: {}".format(model_name))
    if "allow_flagging" in config:  # Create an Interface for Gradio 2.x Spaces
        return get_spaces_interface(model_name, config, alias, **kwargs)
    else:  # Create a Blocks for Gradio 3.x Spaces
        return get_spaces_blocks(model_name, config)


def get_spaces_blocks(model_name, config):
    def streamline_config(config: dict) -> dict:
        """Streamlines the blocks config dictionary to fix components that don't render correctly."""
        # TODO(abidlabs): Need a better way to fix relative paths in dataset component
        for c, component in enumerate(config["components"]):
            if component["type"] == "dataset":
                config["components"][c]["props"]["visible"] = False
        return config

    config = streamline_config(config)
    api_url = "https://hf.space/embed/{}/api/predict/".format(model_name)
    headers = {"Content-Type": "application/json"}

    fns = []
    for d, dependency in enumerate(config["dependencies"]):
        if dependency["backend_fn"]:

            def get_fn(outputs, fn_index):
                def fn(*data):
                    data = json.dumps({"data": data, "fn_index": fn_index})
                    response = requests.post(api_url, headers=headers, data=data)
                    result = json.loads(response.content.decode("utf-8"))
                    try:
                        output = result["data"]
                    except KeyError:
                        if "error" in result and "429" in result["error"]:
                            raise TooManyRequestsError(
                                "Too many requests to the Hugging Face API"
                            )
                        raise KeyError(
                            f"Could not find 'data' key in response from external Space. Response received: {result}"
                        )
                    if len(outputs) == 1:
                        output = output[0]
                    return output

                return fn

            fn = get_fn(deepcopy(dependency["outputs"]), d)
            fns.append(fn)
        else:
            fns.append(None)
    return gradio.Blocks.from_config(config, fns)


def get_spaces_interface(model_name, config, alias, **kwargs):
    def streamline_config(config: dict) -> dict:
        """Streamlines the interface config dictionary to remove unnecessary keys."""
        config["inputs"] = [
            components.get_component_instance(component)
            for component in config["input_components"]
        ]
        config["outputs"] = [
            components.get_component_instance(component)
            for component in config["output_components"]
        ]
        parameters = {
            "article",
            "description",
            "flagging_options",
            "inputs",
            "outputs",
            "theme",
            "title",
        }
        config = {k: config[k] for k in parameters}
        return config

    config = streamline_config(config)
    api_url = "https://hf.space/embed/{}/api/predict/".format(model_name)
    headers = {"Content-Type": "application/json"}

    # The function should call the API with preprocessed data
    def fn(*data):
        data = json.dumps({"data": data})
        response = requests.post(api_url, headers=headers, data=data)
        result = json.loads(response.content.decode("utf-8"))
        try:
            output = result["data"]
        except KeyError:
            if "error" in result and "429" in result["error"]:
                raise TooManyRequestsError("Too many requests to the Hugging Face API")
            raise KeyError(
                f"Could not find 'data' key in response from external Space. Response received: {result}"
            )
        if (
            len(config["outputs"]) == 1
        ):  # if the fn is supposed to return a single value, pop it
            output = output[0]
        if len(config["outputs"]) == 1 and isinstance(
            output, list
        ):  # Needed to support Output.Image() returning bounding boxes as well (TODO: handle different versions of gradio since they have slightly different APIs)
            output = output[0]
        return output

    fn.__name__ = alias if (alias is not None) else model_name
    config["fn"] = fn

    kwargs = dict(config, **kwargs)
    kwargs["_api_mode"] = True
    interface = gradio.Interface(**kwargs)
    return interface


factory_methods: Dict[str, Callable] = {
    # for each repo type, we have a method that returns the Interface given the model name & optionally an api_key
    "huggingface": get_models_interface,
    "models": get_models_interface,
    "spaces": get_spaces,
}


def load_from_pipeline(pipeline):
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
