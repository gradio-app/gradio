"""This module should not be used directly as its API is subject to change. Instead,
use the `gr.Blocks.load()` or `gr.load()` functions."""

from __future__ import annotations

import json
import os
import re
import tempfile
import warnings
from collections.abc import Callable, Generator
from pathlib import Path
from typing import TYPE_CHECKING, Literal

import httpx
import huggingface_hub
from gradio_client import Client
from gradio_client.client import Endpoint
from gradio_client.documentation import document
from gradio_client.utils import encode_url_or_file_to_base64, is_http_url_like
from packaging import version

import gradio as gr
from gradio import components, external_utils, utils
from gradio.components.multimodal_textbox import MultimodalValue
from gradio.context import Context
from gradio.exceptions import (
    GradioVersionIncompatibleError,
    TooManyRequestsError,
)
from gradio.processing_utils import save_base64_to_cache, to_binary

if TYPE_CHECKING:
    from huggingface_hub.inference._providers import PROVIDER_T

    from gradio.blocks import Blocks
    from gradio.chat_interface import ChatInterface
    from gradio.components.chatbot import MessageDict
    from gradio.components.login_button import LoginButton
    from gradio.interface import Interface


@document()
def load(
    name: str,
    src: Callable[[str, str | None], Blocks]
    | Literal["models", "spaces"]
    | None = None,
    token: str | None = None,
    hf_token: str | None = None,
    accept_token: bool | LoginButton = False,
    provider: PROVIDER_T | None = None,
    **kwargs,
) -> Blocks:
    """
    Constructs a Gradio app automatically from a Hugging Face model/Space repo name or a 3rd-party API provider. Note that if a Space repo is loaded, certain high-level attributes of the Blocks (e.g. custom `css`, `js`, and `head` attributes) will not be loaded.
    Parameters:
        name: the name of the model (e.g. "google/vit-base-patch16-224") or Space (e.g. "flax-community/spanish-gpt2"). This is the first parameter passed into the `src` function. Can also be formatted as {src}/{repo name} (e.g. "models/google/vit-base-patch16-224") if `src` is not provided.
        src: function that accepts a string model `name` and a string or None `token` and returns a Gradio app. Alternatively, this parameter takes one of two strings for convenience: "models" (for loading a Hugging Face model through the Inference API) or "spaces" (for loading a Hugging Face Space). If None, uses the prefix of the `name` parameter to determine `src`.
        token: optional token that is passed as the second parameter to the `src` function. If not explicitly provided, will use the HF_TOKEN environment variable or fallback to the locally-saved HF token when loading models but not Spaces (when loading Spaces, only provide a token if you are loading a trusted private Space as the token can be read by the Space you are loading). Find your HF tokens here: https://huggingface.co/settings/tokens.
        accept_token: if True, a Textbox component is first rendered to allow the user to provide a token, which will be used instead of the `token` parameter when calling the loaded model or Space. Can also provide an instance of a gr.LoginButton in the same Blocks scope, which allows the user to login with a Hugging Face account whose token will be used instead of the `token` parameter when calling the loaded model or Space.
        kwargs: additional keyword parameters to pass into the `src` function. If `src` is "models" or "Spaces", these parameters are passed into the `gr.Interface` or `gr.ChatInterface` constructor.
        provider: the name of the third-party (non-Hugging Face) providers to use for model inference (e.g. "replicate", "sambanova", "fal-ai", etc). Should be one of the providers supported by `huggingface_hub.InferenceClient`. This parameter is only used when `src` is "models"
    Returns:
        a Gradio Blocks app for the given model
    Example:
        import gradio as gr
        demo = gr.load("gradio/question-answering", src="spaces")
        demo.launch()
    """
    if hf_token is not None and token is None:
        token = hf_token
        warnings.warn(
            "The `hf_token` parameter is deprecated. Please use the equivalent `token` parameter instead."
        )
    if src is None:
        # Separate the repo type (e.g. "model") from repo name (e.g. "google/vit-base-patch16-224")
        parts = name.split("/")
        if len(parts) <= 1:
            raise ValueError(
                "Either `src` parameter must be provided, or `name` must be formatted as {src}/{repo name}"
            )
        src = parts[0]  # type: ignore
        name = "/".join(parts[1:])
    assert src is not None  # noqa: S101
    if not isinstance(src, Callable) and src not in ["models", "spaces", "huggingface"]:
        raise ValueError(
            "The `src` parameter must be one of 'huggingface', 'models', 'spaces', or a function that accepts a model name (and optionally, a token), and returns a Gradio app."
        )
    if (
        token is None
        and src in ["models", "huggingface"]
        and os.environ.get("HF_TOKEN") is not None
    ):
        token = os.environ.get("HF_TOKEN")

    if isinstance(src, Callable):
        return src(name, token, **kwargs)

    if not accept_token:
        return load_blocks_from_huggingface(
            name=name, src=src, hf_token=token, provider=provider, **kwargs
        )
    elif isinstance(accept_token, gr.LoginButton):
        with gr.Blocks(fill_height=True) as demo:
            if not accept_token.is_rendered:
                accept_token.render()

            @gr.render(triggers=[demo.load])
            def create_blocks(oauth_token: gr.OAuthToken | None):
                token_value = None if oauth_token is None else oauth_token.token
                return load_blocks_from_huggingface(
                    name=name,
                    src=src,
                    hf_token=token_value,
                    provider=provider,
                    **kwargs,
                )

        return demo
    else:
        with gr.Blocks(fill_height=True) as demo:
            with gr.Accordion("Enter your token and press enter") as accordion:
                textbox = gr.Textbox(
                    type="password",
                    show_label=False,
                    container=False,
                )
                remember_token = gr.Checkbox(
                    label="Remember me on this device", value=False, container=False
                )
                browser_state = gr.BrowserState()

            @gr.on([textbox.submit], outputs=accordion)
            def hide_accordion():
                return gr.Accordion("Token settings", open=False)

            @gr.on(
                [textbox.submit, remember_token.change],
                inputs=[textbox, remember_token],
                outputs=[browser_state, remember_token],
            )
            def save_token(token_value, remember_token_value):
                if remember_token_value and token_value:
                    return token_value, gr.Checkbox(
                        label="Remember me on this device (saved!)", value=True
                    )
                else:
                    return "", gr.Checkbox(label="Remember me on this device")

            @gr.on(demo.load, inputs=[browser_state], outputs=[textbox, remember_token])
            def load_token(token_value):
                if token_value:
                    return token_value, True
                else:
                    return "", False

            @gr.render(inputs=[textbox], triggers=[textbox.submit])
            def create(token_value):
                return load_blocks_from_huggingface(
                    name=name,
                    src=src,
                    hf_token=token_value,
                    provider=provider,
                    **kwargs,
                )

        return demo


def load_blocks_from_huggingface(
    name: str,
    src: str,
    hf_token: str | None = None,
    alias: str | None = None,
    provider: PROVIDER_T | None = None,
    **kwargs,
) -> Blocks:
    """Creates and returns a Blocks instance from a Hugging Face model or Space repo."""
    if hf_token is not None:
        if Context.hf_token is not None and Context.hf_token != hf_token:
            warnings.warn(
                """You are loading a model/Space with a different access token than the one you used to load a previous model/Space. This is not recommended, as it may cause unexpected behavior."""
            )
        Context.hf_token = hf_token

    if src == "spaces":
        blocks = from_spaces(
            name, hf_token=hf_token, alias=alias, provider=provider, **kwargs
        )
    else:
        blocks = from_model(
            name, hf_token=hf_token, alias=alias, provider=provider, **kwargs
        )
    return blocks


def from_model(
    model_name: str,
    hf_token: str | None,
    alias: str | None,
    provider: PROVIDER_T | None = None,
    **kwargs,
) -> Blocks:
    headers = {"X-Wait-For-Model": "true"}
    client = huggingface_hub.InferenceClient(
        model=model_name, headers=headers, token=hf_token, provider=provider
    )
    p, tags = external_utils.get_model_info(model_name, hf_token)

    # For tasks that are not yet supported by the InferenceClient
    api_url = f"https://api-inference.huggingface.co/models/{model_name}"
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
        postprocess = lambda x: x.text  # noqa: E731
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
        postprocess = lambda x: x.summary_text  # noqa: E731
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
        # Example: meta-llama/Meta-Llama-3-8B-Instruct
        if tags and "conversational" in tags:
            from gradio import ChatInterface
            from gradio.components import Chatbot

            fn = external_utils.conversational_wrapper(client)
            examples = [
                "What is the capital of Pakistan?",
                "Tell me a joke about calculus.",
                "Explain gravity to a 5-year-old.",
                "What were the main causes of World War I?",
            ]
            chat_interface_kwargs = {
                "examples": examples,
            }
            kwargs = dict(chat_interface_kwargs, **kwargs)
            chatbot = Chatbot(scale=1, type="messages", allow_tags=True)
            return ChatInterface(fn, chatbot=chatbot, type="messages", **kwargs)  # type: ignore
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
        postprocess = lambda x: x.translation_text  # noqa: E731
        examples = ["Hello, how are you?"]
        fn = client.translation
    # Example: facebook/bart-large-mnli
    elif p == "zero-shot-classification":
        inputs = [
            components.Textbox(label="Input"),
            components.Textbox(label="Possible class names (comma-separated)"),
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
    # example model: meta-llama/Llama-3.2-11B-Vision-Instruct
    elif p == "image-text-to-text":
        inputs = [
            components.Image(type="filepath", label="Input Image"),
            components.Textbox(
                label="Input Text", placeholder="Ask a question about the image"
            ),
        ]
        outputs = components.Textbox(label="Generated Text")
        examples = [
            [
                "https://gradio-builds.s3.amazonaws.com/demo-files/cheetah-002.jpg",
                "What animal is in the image?",
            ]
        ]
        fn = external_utils.image_text_to_text_wrapper(client)
    else:
        raise ValueError(f"Unsupported pipeline type: {p}")

    def query_huggingface_inference_endpoints(*data):
        if preprocess is not None:
            data = preprocess(*data)
        try:
            data = fn(*data)
        except Exception as e:
            external_utils.handle_hf_error(e)

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
        "cache_examples": False,
    }

    kwargs = dict(interface_info, **kwargs)
    interface = gr.Interface(**kwargs)
    return interface


def from_spaces(
    space_name: str,
    hf_token: str | None,
    alias: str | None,
    provider: PROVIDER_T | None = None,
    **kwargs,
) -> Blocks:
    if provider is not None:
        warnings.warn(
            "The `provider` parameter is not supported when loading Spaces. It will be ignored."
        )

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

    config_request = httpx.get(iframe_url + "/config", headers=headers)
    if config_request.status_code == 404:
        r = httpx.get(iframe_url, headers=headers)

        result = re.search(
            r"window.gradio_config = (.*?);[\s]*</script>", r.text
        )  # some basic regex to extract the config
        try:
            config = json.loads(result.group(1))  # type: ignore
        except AttributeError as ae:
            raise ValueError(f"Could not load the Space: {space_name}") from ae
    elif config_request.status_code == 200:
        config = config_request.json()
    else:
        raise ValueError(
            f"Could not load the Space: {space_name} because the config could not be fetched."
        )
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
    return gr.Blocks.from_config(client.config, predict_fns, client.src)  # type: ignore


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
    interface = gr.Interface(**kwargs)
    return interface


TEXT_FILE_EXTENSIONS = (
    ".doc",
    ".docx",
    ".rtf",
    ".epub",
    ".odt",
    ".odp",
    ".pptx",
    ".txt",
    ".md",
    ".py",
    ".ipynb",
    ".js",
    ".jsx",
    ".html",
    ".css",
    ".java",
    ".cs",
    ".php",
    ".c",
    ".cc",
    ".cpp",
    ".cxx",
    ".cts",
    ".h",
    ".hh",
    ".hpp",
    ".rs",
    ".R",
    ".Rmd",
    ".swift",
    ".go",
    ".rb",
    ".kt",
    ".kts",
    ".ts",
    ".tsx",
    ".m",
    ".mm",
    ".mts",
    ".scala",
    ".dart",
    ".lua",
    ".pl",
    ".pm",
    ".t",
    ".sh",
    ".bash",
    ".zsh",
    ".bat",
    ".coffee",
    ".csv",
    ".log",
    ".ini",
    ".cfg",
    ".config",
    ".json",
    ".proto",
    ".yaml",
    ".yml",
    ".toml",
    ".sql",
)
IMAGE_FILE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".gif", ".webp")


def format_conversation(
    history: list[MessageDict], new_message: str | MultimodalValue
) -> list[dict]:
    conversation = []
    for message in history:
        if isinstance(message["content"], str):
            conversation.append(
                {"role": message["role"], "content": message["content"]}
            )
        elif isinstance(message["content"], tuple):
            image_message = {
                "role": message["role"],
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": encode_url_or_file_to_base64(message["content"][0])
                        },
                    }
                ],
            }
            conversation.append(image_message)
        else:
            raise ValueError(
                f"Invalid message format: {message['content']}. Messages must be either strings or tuples."
            )
    if isinstance(new_message, str):
        text = new_message
        files = []
    else:
        text = new_message.get("text", None)
        files = new_message.get("files", [])
    image_files, text_encoded = [], []
    for file in files:
        if file.lower().endswith(TEXT_FILE_EXTENSIONS):
            text_encoded.append(file)
        else:
            image_files.append(file)

    for image in image_files:
        conversation.append(
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": encode_url_or_file_to_base64(image)},
                    }
                ],
            }
        )
    if text or text_encoded:
        text = text or ""
        text += "\n".join(
            [
                f"\n## {Path(file).name}\n{Path(file).read_text()}"
                for file in text_encoded
            ]
        )
        conversation.append(
            {"role": "user", "content": [{"type": "text", "text": text}]}
        )
    return conversation


@document()
def load_chat(
    base_url: str,
    model: str,
    token: str | None = None,
    *,
    file_types: Literal["text_encoded", "image"]
    | list[Literal["text_encoded", "image"]]
    | None = "text_encoded",
    system_message: str | None = None,
    streaming: bool = True,
    **kwargs,
) -> ChatInterface:
    """
    Load a chat interface from an OpenAI API chat compatible endpoint.
    Parameters:
        base_url: The base URL of the endpoint, e.g. "http://localhost:11434/v1/"
        model: The name of the model you are loading, e.g. "llama3.2"
        token: The API token or a placeholder string if you are using a local model, e.g. "ollama"
        file_types: The file types allowed to be uploaded by the user. "text_encoded" allows uploading any text-encoded file (which is simply appended to the prompt), and "image" adds image upload support. Set to None to disable file uploads.
        system_message: The system message to use for the conversation, if any.
        streaming: Whether the response should be streamed.
        kwargs: Additional keyword arguments to pass into ChatInterface for customization.
    Example:
        import gradio as gr
        gr.load_chat(
            "http://localhost:11434/v1/",
            model="qwen2.5",
            token="***",
            file_types=["text_encoded", "image"],
            system_message="You are a silly assistant.",
        ).launch()
    """
    try:
        from openai import OpenAI
    except ImportError as e:
        raise ImportError(
            "To use OpenAI API Client, you must install the `openai` package. You can install it with `pip install openai`."
        ) from e
    from gradio.chat_interface import ChatInterface

    client = OpenAI(api_key=token, base_url=base_url)
    start_message = (
        [{"role": "system", "content": system_message}] if system_message else []
    )
    file_types = utils.none_or_singleton_to_list(file_types)

    def open_api(message: str | MultimodalValue, history: list | None) -> str | None:
        history = history or start_message
        if len(history) > 0 and isinstance(history[0], (list, tuple)):
            history = ChatInterface._tuples_to_messages(history)
        conversation = format_conversation(history, message)  # type: ignore
        return (
            client.chat.completions.create(
                model=model,
                messages=conversation,  # type: ignore
            )
            .choices[0]
            .message.content
        )

    def open_api_stream(
        message: str | MultimodalValue, history: list | None
    ) -> Generator[str, None, None]:
        history = history or start_message
        if len(history) > 0 and isinstance(history[0], (list, tuple)):
            history = ChatInterface._tuples_to_messages(history)
        conversation = format_conversation(history, message)  # type: ignore
        stream = client.chat.completions.create(
            model=model,
            messages=conversation,  # type: ignore
            stream=True,
        )
        response = ""
        for chunk in stream:
            if chunk.choices[0].delta.content is not None:
                response += chunk.choices[0].delta.content
                yield response

    supported_extensions = []
    for file_type in file_types:
        if file_type == "text_encoded":
            supported_extensions += TEXT_FILE_EXTENSIONS
        elif file_type == "image":
            supported_extensions += IMAGE_FILE_EXTENSIONS
        else:
            raise ValueError(
                f"Invalid file type: {file_type}. Must be 'text_encoded' or 'image'."
            )

    if "chatbot" not in kwargs:
        from gradio.components import Chatbot

        kwargs["chatbot"] = Chatbot(type="messages", scale=1, allow_tags=True)

    return ChatInterface(
        open_api_stream if streaming else open_api,
        type="messages",
        multimodal=bool(file_types),
        textbox=gr.MultimodalTextbox(file_types=supported_extensions)
        if file_types
        else None,
        **kwargs,
    )


@document()
def load_openapi(
    openapi_spec: str | dict,
    base_url: str,
    *,
    paths: list[str] | None = None,
    exclude_paths: list[str] | None = None,
    methods: list[Literal["get", "post", "put", "patch", "delete"]] | None = None,
    auth_token: str | None = None,
    **interface_kwargs,
) -> Blocks:
    """
    Load a Gradio app from an OpenAPI v3 specification.

    Parameters:
        openapi_spec: URL, file path, or dictionary containing the OpenAPI specification (v3, JSON format only)
        base_url: Base URL for the API endpoints, e.g. "https://api.example.com/v1". This is used to construct the full URL for each endpoint.
        paths: Optional list of specific API paths to create Gradio endpoints from. Supports regex patterns, e.g. ["/api/v1/books", ".*user.*"]. If None, all paths in the OpenAPI spec will be included.
        exclude_paths: Optional list of API paths to exclude from the Gradio endpoints. Supports regex patterns and takes precedence over `paths`. For example, [".*internal.*"] will exclude all paths containing "internal".
        methods: Optional list of HTTP methods to include in the Gradio endpoints. If None, all methods will be included.
        auth_token: Optional authentication token to be sent as a Bearer token in the Authorization header for all API requests.
        interface_kwargs: Additional keyword arguments to pass to each generated gr.Interface instance (e.g., title, description, article, examples_per_page, etc.)
    Returns:
        A Gradio Blocks app with endpoints generated from the OpenAPI spec
    """
    if isinstance(openapi_spec, dict):
        spec = openapi_spec
    elif isinstance(openapi_spec, str):
        if is_http_url_like(openapi_spec):
            response = httpx.get(openapi_spec)
            response.raise_for_status()
            content = response.text
        else:
            with open(openapi_spec) as f:
                content = f.read()

        try:
            spec = json.loads(content)
        except json.JSONDecodeError as e:
            raise ValueError("openapi_spec must be a JSON string or dictionary") from e
    else:
        raise ValueError("openapi_spec must be a string (URL/file path) or dictionary")

    api_paths = spec.get("paths", {})

    if paths is not None or exclude_paths is not None:
        filtered_paths = {}
        for path in api_paths:
            if exclude_paths:
                excluded = False
                for exclude_pattern in exclude_paths:
                    if re.match(exclude_pattern, path):
                        excluded = True
                        break
                if excluded:
                    continue

            if paths is not None:
                for pattern in paths:
                    if re.match(pattern, path):
                        filtered_paths[path] = api_paths[path]
                        break
            else:
                filtered_paths[path] = api_paths[path]

        api_paths = filtered_paths

    if not api_paths:
        raise ValueError("No valid paths found in the OpenAPI specification")
    else:
        print(f"* Loaded {len(api_paths)} paths from the OpenAPI specification")

    valid_api_paths = []
    for path, path_item in api_paths.items():
        for method, operation in path_item.items():
            if methods and method.lower() not in [m.lower() for m in methods]:
                continue
            valid_api_paths.append((path, method, operation))

    with gr.Blocks(
        title=spec.get("info", {}).get("title", "OpenAPI Interface")
    ) as demo:
        with gr.Sidebar():
            gr.Markdown(f"## {spec.get('info', {}).get('title', 'OpenAPI Interface')}")
            gr.Markdown(spec.get("info", {}).get("description", ""))
            gr.Markdown("### API Endpoints")
            api_path_str = "<div style='overflow-x: auto; overflow-y: auto; max-height: 500px;'><ul>"
            for path, method, _ in valid_api_paths:
                api_path_str += (
                    f"<li style='white-space: nowrap;'>"
                    f"<a href='#{method.upper()}_{path.replace('/', '_').replace('{', '').replace('}', '')}' style='white-space: nowrap;'>"
                    f"{method.upper()} <code style='font-size: inherit; white-space: nowrap;'>{path}</code>"
                    f"</a></li>\n"
                )
            api_path_str += "</ul></div>"
            gr.Markdown(api_path_str)

        for path, method, operation in valid_api_paths:
            components_list = []

            for param in operation.get("parameters", []):
                component = external_utils.component_from_parameter_schema(param)
                components_list.append(component)

            request_body = operation.get("requestBody")
            if request_body:
                body_component = external_utils.component_from_request_body_schema(
                    request_body, spec
                )
                if body_component:
                    components_list.append(body_component)

            endpoint_fn = external_utils.create_endpoint_fn(
                path, method, operation, base_url, auth_token
            )
            endpoint_fn.__name__ = (
                f"{method}_{path.replace('/', '_').replace('{', '').replace('}', '')}"
            )

            gr.Markdown(
                f"<h2 id='{method.upper()}_{path.replace('/', '_').replace('{', '').replace('}', '')}'>"
                f"{external_utils.method_box(method)} <code style='font-size: inherit;'>{path}</code></h2>"
            )
            if operation.get("summary"):
                gr.Markdown(operation["summary"])

            inputs = components_list if components_list else []
            output = gr.JSON(label="Response")

            gr.Interface(
                fn=endpoint_fn,
                inputs=inputs,
                outputs=output,
                **interface_kwargs,
            )

    return demo
