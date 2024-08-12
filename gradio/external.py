"""This module should not be used directly as its API is subject to change. Instead,
use the `gr.Blocks.load()` or `gr.load()` functions."""

from __future__ import annotations

import json
import os
import re
import tempfile
import warnings
from pathlib import Path
from typing import TYPE_CHECKING, Callable, Literal

import httpx
import huggingface_hub
from gradio_client import Client
from gradio_client.client import Endpoint
from gradio_client.documentation import document
from packaging import version

import gradio
from gradio import components, external_utils, utils
from gradio.context import Context
from gradio.exceptions import (
    GradioVersionIncompatibleError,
    ModelNotFoundError,
    TooManyRequestsError,
)
from gradio.processing_utils import save_base64_to_cache, to_binary

if TYPE_CHECKING:
    from gradio.blocks import Blocks
    from gradio.interface import Interface


@document()
def load(
    name: str,
    src: str | None = None,
    hf_token: str | Literal[False] | None = None,
    alias: str | None = None,
    **kwargs,
) -> Blocks:
    """
    Constructs a demo from a Hugging Face repo. Can accept model repos (if src is "models") or Space repos (if src is "spaces"). The input
    and output components are automatically loaded from the repo. Note that if a Space is loaded, certain high-level attributes of the Blocks (e.g.
    custom `css`, `js`, and `head` attributes) will not be loaded.
    Parameters:
        name: the name of the model (e.g. "gpt2" or "facebook/bart-base") or space (e.g. "flax-community/spanish-gpt2"), can include the `src` as prefix (e.g. "models/facebook/bart-base")
        src: the source of the model: `models` or `spaces` (or leave empty if source is provided as a prefix in `name`)
        hf_token: optional access token for loading private Hugging Face Hub models or spaces. Will default to the locally saved token if not provided. Pass `token=False` if you don't want to send your token to the server. Find your token here: https://huggingface.co/settings/tokens.  Warning: only provide a token if you are loading a trusted private Space as it can be read by the Space you are loading.
        alias: optional string used as the name of the loaded model instead of the default name (only applies if loading a Space running Gradio 2.x)
    Returns:
        a Gradio Blocks object for the given model
    Example:
        import gradio as gr
        demo = gr.load("gradio/question-answering", src="spaces")
        demo.launch()
    """
    return load_blocks_from_repo(
        name=name, src=src, hf_token=hf_token, alias=alias, **kwargs
    )


def load_blocks_from_repo(
    name: str,
    src: str | None = None,
    hf_token: str | Literal[False] | None = None,
    alias: str | None = None,
    **kwargs,
) -> Blocks:
    """Creates and returns a Blocks instance from a Hugging Face model or Space repo."""
    if src is None:
        # Separate the repo type (e.g. "model") from repo name (e.g. "google/vit-base-patch16-224")
        tokens = name.split("/")
        if len(tokens) <= 1:
            raise ValueError(
                "Either `src` parameter must be provided, or `name` must be formatted as {src}/{repo name}"
            )
        src = tokens[0]
        name = "/".join(tokens[1:])

    factory_methods: dict[str, Callable] = {
        # for each repo type, we have a method that returns the Interface given the model name & optionally an hf_token
        "huggingface": from_model,
        "models": from_model,
        "spaces": from_spaces,
    }
    if src.lower() not in factory_methods:
        raise ValueError(f"parameter: src must be one of {factory_methods.keys()}")

    if hf_token is not None and hf_token is not False:
        if Context.hf_token is not None and Context.hf_token != hf_token:
            warnings.warn(
                """You are loading a model/Space with a different access token than the one you used to load a previous model/Space. This is not recommended, as it may cause unexpected behavior."""
            )
        Context.hf_token = hf_token

    blocks: gradio.Blocks = factory_methods[src](name, hf_token, alias, **kwargs)
    return blocks


def from_model(
    model_name: str, hf_token: str | Literal[False] | None, alias: str | None, **kwargs
):
    model_url = f"https://huggingface.co/{model_name}"
    api_url = f"https://api-inference.huggingface.co/models/{model_name}"
    print(f"Fetching model from: {model_url}")

    headers = (
        {} if hf_token in [False, None] else {"Authorization": f"Bearer {hf_token}"}
    )
    response = httpx.request("GET", api_url, headers=headers)
    if response.status_code != 200:
        raise ModelNotFoundError(
            f"Could not find model: {model_name}. If it is a private or gated model, please provide your Hugging Face access token (https://huggingface.co/settings/tokens) as the argument for the `hf_token` parameter."
        )
    p = response.json().get("pipeline_tag")

    headers["X-Wait-For-Model"] = "true"
    client = huggingface_hub.InferenceClient(
        model=model_name, headers=headers, token=hf_token
    )

    # For tasks that are not yet supported by the InferenceClient
    GRADIO_CACHE = os.environ.get("GRADIO_TEMP_DIR") or str(  # noqa: N806
        Path(tempfile.gettempdir()) / "gradio"
    )

    def custom_post_binary(data):
        data = to_binary({"path": data})
        response = httpx.request("POST", api_url, headers=headers, content=data)
        return save_base64_to_cache(
            external_utils.encode_to_base64(response), cache_dir=GRADIO_CACHE
        )

    preprocess = None
    postprocess = None
    examples = None

    # example model: ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition
    if p == "audio-classification":
        inputs = components.Audio(type="filepath", label="Input")
        outputs = components.Label(label="Class")
        postprocess = external_utils.postprocess_label
        examples = [
            "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
        ]
        fn = client.audio_classification
    # example model: facebook/xm_transformer_sm_all-en
    elif p == "audio-to-audio":
        inputs = components.Audio(type="filepath", label="Input")
        outputs = components.Audio(label="Output")
        examples = [
            "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
        ]
        fn = custom_post_binary
    # example model: facebook/wav2vec2-base-960h
    elif p == "automatic-speech-recognition":
        inputs = components.Audio(type="filepath", label="Input")
        outputs = components.Textbox(label="Output")
        examples = [
            "https://gradio-builds.s3.amazonaws.com/demo-files/audio_sample.wav"
        ]
        fn = client.automatic_speech_recognition
    # example model: microsoft/DialoGPT-medium
    elif p == "conversational":
        inputs = [
            components.Textbox(render=False),
            components.State(render=False),
        ]
        outputs = [
            components.Chatbot(render=False),
            components.State(render=False),
        ]
        examples = [["Hello World"]]
        preprocess = external_utils.chatbot_preprocess
        postprocess = external_utils.chatbot_postprocess
        fn = client.conversational
    # example model: julien-c/distilbert-feature-extraction
    elif p == "feature-extraction":
        inputs = components.Textbox(label="Input")
        outputs = components.Dataframe(label="Output")
        fn = client.feature_extraction
        postprocess = utils.resolve_singleton
    # example model: distilbert/distilbert-base-uncased
    elif p == "fill-mask":
        inputs = components.Textbox(label="Input")
        outputs = components.Label(label="Classification")
        examples = [
            "Hugging Face is the AI community, working together, to [MASK] the future."
        ]
        postprocess = external_utils.postprocess_mask_tokens
        fn = client.fill_mask
    # Example: google/vit-base-patch16-224
    elif p == "image-classification":
        inputs = components.Image(type="filepath", label="Input Image")
        outputs = components.Label(label="Classification")
        postprocess = external_utils.postprocess_label
        examples = ["https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg"]
        fn = client.image_classification
    # Example: deepset/xlm-roberta-base-squad2
    elif p == "question-answering":
        inputs = [
            components.Textbox(label="Question"),
            components.Textbox(lines=7, label="Context"),
        ]
        outputs = [
            components.Textbox(label="Answer"),
            components.Label(label="Score"),
        ]
        examples = [
            [
                "What entity was responsible for the Apollo program?",
                "The Apollo program, also known as Project Apollo, was the third United States human spaceflight"
                " program carried out by the National Aeronautics and Space Administration (NASA), which accomplished"
                " landing the first humans on the Moon from 1969 to 1972.",
            ]
        ]
        postprocess = external_utils.postprocess_question_answering
        fn = client.question_answering
    # Example: facebook/bart-large-cnn
    elif p == "summarization":
        inputs = components.Textbox(label="Input")
        outputs = components.Textbox(label="Summary")
        examples = [
            [
                "The tower is 324 metres (1,063 ft) tall, about the same height as an 81-storey building, and the tallest structure in Paris. Its base is square, measuring 125 metres (410 ft) on each side. During its construction, the Eiffel Tower surpassed the Washington Monument to become the tallest man-made structure in the world, a title it held for 41 years until the Chrysler Building in New York City was finished in 1930. It was the first structure to reach a height of 300 metres. Due to the addition of a broadcasting aerial at the top of the tower in 1957, it is now taller than the Chrysler Building by 5.2 metres (17 ft). Excluding transmitters, the Eiffel Tower is the second tallest free-standing structure in France after the Millau Viaduct."
            ]
        ]
        fn = client.summarization
    # Example: distilbert-base-uncased-finetuned-sst-2-english
    elif p == "text-classification":
        inputs = components.Textbox(label="Input")
        outputs = components.Label(label="Classification")
        examples = ["I feel great"]
        postprocess = external_utils.postprocess_label
        fn = client.text_classification
    # Example: gpt2
    elif p == "text-generation":
        inputs = components.Textbox(label="Text")
        outputs = inputs
        examples = ["Once upon a time"]
        fn = external_utils.text_generation_wrapper(client)
    # Example: valhalla/t5-small-qa-qg-hl
    elif p == "text2text-generation":
        inputs = components.Textbox(label="Input")
        outputs = components.Textbox(label="Generated Text")
        examples = ["Translate English to Arabic: How are you?"]
        fn = client.text_generation
    # Example: Helsinki-NLP/opus-mt-en-ar
    elif p == "translation":
        inputs = components.Textbox(label="Input")
        outputs = components.Textbox(label="Translation")
        examples = ["Hello, how are you?"]
        fn = client.translation
    # Example: facebook/bart-large-mnli
    elif p == "zero-shot-classification":
        inputs = [
            components.Textbox(label="Input"),
            components.Textbox(label="Possible class names (" "comma-separated)"),
            components.Checkbox(label="Allow multiple true classes"),
        ]
        outputs = components.Label(label="Classification")
        postprocess = external_utils.postprocess_label
        examples = [["I feel great", "happy, sad", False]]
        fn = external_utils.zero_shot_classification_wrapper(client)
    # Example: sentence-transformers/distilbert-base-nli-stsb-mean-tokens
    elif p == "sentence-similarity":
        inputs = [
            components.Textbox(
                label="Source Sentence",
                placeholder="Enter an original sentence",
            ),
            components.Textbox(
                lines=7,
                placeholder="Sentences to compare to -- separate each sentence by a newline",
                label="Sentences to compare to",
            ),
        ]
        outputs = components.JSON(label="Similarity scores")
        examples = [["That is a happy person", "That person is very happy"]]
        fn = external_utils.sentence_similarity_wrapper(client)
    # Example: julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train
    elif p == "text-to-speech":
        inputs = components.Textbox(label="Input")
        outputs = components.Audio(label="Audio")
        examples = ["Hello, how are you?"]
        fn = client.text_to_speech
    # example model: osanseviero/BigGAN-deep-128
    elif p == "text-to-image":
        inputs = components.Textbox(label="Input")
        outputs = components.Image(label="Output")
        examples = ["A beautiful sunset"]
        fn = client.text_to_image
    # example model: huggingface-course/bert-finetuned-ner
    elif p == "token-classification":
        inputs = components.Textbox(label="Input")
        outputs = components.HighlightedText(label="Output")
        examples = [
            "Hugging Face is a company based in Paris and New York City that acquired Gradio in 2021."
        ]
        fn = external_utils.token_classification_wrapper(client)
    # example model: impira/layoutlm-document-qa
    elif p == "document-question-answering":
        inputs = [
            components.Image(type="filepath", label="Input Document"),
            components.Textbox(label="Question"),
        ]
        postprocess = external_utils.postprocess_label
        outputs = components.Label(label="Label")
        fn = client.document_question_answering
    # example model: dandelin/vilt-b32-finetuned-vqa
    elif p == "visual-question-answering":
        inputs = [
            components.Image(type="filepath", label="Input Image"),
            components.Textbox(label="Question"),
        ]
        outputs = components.Label(label="Label")
        postprocess = external_utils.postprocess_visual_question_answering
        examples = [
            [
                "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
                "What animal is in the image?",
            ]
        ]
        fn = client.visual_question_answering
    # example model: Salesforce/blip-image-captioning-base
    elif p == "image-to-text":
        inputs = components.Image(type="filepath", label="Input Image")
        outputs = components.Textbox(label="Generated Text")
        examples = ["https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg"]
        fn = client.image_to_text
    # example model: rajistics/autotrain-Adult-934630783
    elif p in ["tabular-classification", "tabular-regression"]:
        examples = external_utils.get_tabular_examples(model_name)
        col_names, examples = external_utils.cols_to_rows(examples)  # type: ignore
        examples = [[examples]] if examples else None
        inputs = components.Dataframe(
            label="Input Rows",
            type="pandas",
            headers=col_names,
            col_count=(len(col_names), "fixed"),
            render=False,
        )
        outputs = components.Dataframe(
            label="Predictions", type="array", headers=["prediction"]
        )
        fn = external_utils.tabular_wrapper
    # example model: microsoft/table-transformer-detection
    elif p == "object-detection":
        inputs = components.Image(type="filepath", label="Input Image")
        outputs = components.AnnotatedImage(label="Annotations")
        fn = external_utils.object_detection_wrapper(client)
    # example model: stabilityai/stable-diffusion-xl-refiner-1.0
    elif p == "image-to-image":
        inputs = [
            components.Image(type="filepath", label="Input Image"),
            components.Textbox(label="Input"),
        ]
        outputs = components.Image(label="Output")
        examples = [
            [
                "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
                "Photo of a cheetah with green eyes",
            ]
        ]
        fn = client.image_to_image
    else:
        raise ValueError(f"Unsupported pipeline type: {p}")

    def query_huggingface_inference_endpoints(*data):
        if preprocess is not None:
            data = preprocess(*data)
        try:
            data = fn(*data)  # type: ignore
        except huggingface_hub.utils.HfHubHTTPError as e:
            if "429" in str(e):
                raise TooManyRequestsError() from e
        if postprocess is not None:
            data = postprocess(data)  # type: ignore
        return data

    query_huggingface_inference_endpoints.__name__ = alias or model_name

    interface_info = {
        "fn": query_huggingface_inference_endpoints,
        "inputs": inputs,
        "outputs": outputs,
        "title": model_name,
        "examples": examples,
    }

    kwargs = dict(interface_info, **kwargs)
    interface = gradio.Interface(**kwargs)
    return interface


def from_spaces(
    space_name: str, hf_token: str | None, alias: str | None, **kwargs
) -> Blocks:
    space_url = f"https://huggingface.co/spaces/{space_name}"

    print(f"Fetching Space from: {space_url}")

    headers = {}
    if hf_token not in [False, None]:
        headers["Authorization"] = f"Bearer {hf_token}"

    iframe_url = (
        httpx.get(
            f"https://huggingface.co/api/spaces/{space_name}/host", headers=headers
        )
        .json()
        .get("host")
    )

    if iframe_url is None:
        raise ValueError(
            f"Could not find Space: {space_name}. If it is a private or gated Space, please provide your Hugging Face access token (https://huggingface.co/settings/tokens) as the argument for the `hf_token` parameter."
        )

    r = httpx.get(iframe_url, headers=headers)

    result = re.search(
        r"window.gradio_config = (.*?);[\s]*</script>", r.text
    )  # some basic regex to extract the config
    try:
        config = json.loads(result.group(1))  # type: ignore
    except AttributeError as ae:
        raise ValueError(f"Could not load the Space: {space_name}") from ae
    if "allow_flagging" in config:  # Create an Interface for Gradio 2.x Spaces
        return from_spaces_interface(
            space_name, config, alias, hf_token, iframe_url, **kwargs
        )
    else:  # Create a Blocks for Gradio 3.x Spaces
        if kwargs:
            warnings.warn(
                "You cannot override parameters for this Space by passing in kwargs. "
                "Instead, please load the Space as a function and use it to create a "
                "Blocks or Interface locally. You may find this Guide helpful: "
                "https://gradio.app/using_blocks_like_functions/"
            )
        return from_spaces_blocks(space=space_name, hf_token=hf_token)


def from_spaces_blocks(space: str, hf_token: str | None) -> Blocks:
    client = Client(
        space,
        hf_token=hf_token,
        download_files=False,
        _skip_components=False,
    )
    # We set deserialize to False to avoid downloading output files from the server.
    # Instead, we serve them as URLs using the /proxy/ endpoint directly from the server.

    if client.app_version < version.Version("4.0.0b14"):
        raise GradioVersionIncompatibleError(
            f"Gradio version 4.x cannot load spaces with versions less than 4.x ({client.app_version})."
            "Please downgrade to version 3 to load this space."
        )

    # Use end_to_end_fn here to properly upload/download all files
    predict_fns = []
    for fn_index, endpoint in client.endpoints.items():
        if not isinstance(endpoint, Endpoint):
            raise TypeError(
                f"Expected endpoint to be an Endpoint, but got {type(endpoint)}"
            )
        helper = client.new_helper(fn_index)
        if endpoint.backend_fn:
            predict_fns.append(endpoint.make_end_to_end_fn(helper))
        else:
            predict_fns.append(None)
    return gradio.Blocks.from_config(client.config, predict_fns, client.src)  # type: ignore


def from_spaces_interface(
    model_name: str,
    config: dict,
    alias: str | None,
    hf_token: str | None,
    iframe_url: str,
    **kwargs,
) -> Interface:
    config = external_utils.streamline_spaces_interface(config)
    api_url = f"{iframe_url}/api/predict/"
    headers = {"Content-Type": "application/json"}
    if hf_token not in [False, None]:
        headers["Authorization"] = f"Bearer {hf_token}"

    # The function should call the API with preprocessed data
    def fn(*data):
        data = json.dumps({"data": data})
        response = httpx.post(api_url, headers=headers, data=data)  # type: ignore
        result = json.loads(response.content.decode("utf-8"))
        if "error" in result and "429" in result["error"]:
            raise TooManyRequestsError("Too many requests to the Hugging Face API")
        try:
            output = result["data"]
        except KeyError as ke:
            raise KeyError(
                f"Could not find 'data' key in response from external Space. Response received: {result}"
            ) from ke
        if (
            len(config["outputs"]) == 1
        ):  # if the fn is supposed to return a single value, pop it
            output = output[0]
        if (
            len(config["outputs"]) == 1 and isinstance(output, list)
        ):  # Needed to support Output.Image() returning bounding boxes as well (TODO: handle different versions of gradio since they have slightly different APIs)
            output = output[0]
        return output

    fn.__name__ = alias if (alias is not None) else model_name
    config["fn"] = fn

    kwargs = dict(config, **kwargs)
    kwargs["_api_mode"] = True
    interface = gradio.Interface(**kwargs)
    return interface
