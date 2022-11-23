import json
import os
import pathlib
import sys
import textwrap
from unittest.mock import MagicMock, patch

import pytest

import gradio
import gradio as gr
from gradio import utils
from gradio.exceptions import InvalidApiName
from gradio.external import (
    TooManyRequestsError,
    cols_to_rows,
    get_tabular_examples,
    use_websocket,
)
from gradio.external_utils import get_pred_from_ws

"""
WARNING: These tests have an external dependency: namely that Hugging Face's
Hub and Space APIs do not change, and they keep their most famous models up.
So if, e.g. Spaces is down, then these test will not pass.

These tests actually test gr.Interface.load() and gr.Blocks.load() but are
included in a separate file because of the above-mentioned dependency.
"""

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"

# Mark the whole module as flaky
pytestmark = pytest.mark.flaky


class TestLoadInterface:
    def test_audio_to_audio(self):
        model_type = "audio-to-audio"
        interface = gr.Interface.load(
            name="speechbrain/mtl-mimic-voicebank",
            src="models",
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Audio)
        assert isinstance(interface.output_components[0], gr.Audio)

    def test_question_answering(self):
        model_type = "image-classification"
        interface = gr.Blocks.load(
            name="lysandre/tiny-vit-random",
            src="models",
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Image)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_text_generation(self):
        model_type = "text_generation"
        interface = gr.Interface.load(
            "models/gpt2", alias=model_type, description="This is a test description"
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)
        assert any(
            "This is a test description" in d["props"].get("value", "")
            for d in interface.get_config_file()["components"]
        )

    def test_summarization(self):
        model_type = "summarization"
        interface = gr.Interface.load(
            "models/facebook/bart-large-cnn", api_key=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_translation(self):
        model_type = "translation"
        interface = gr.Interface.load(
            "models/facebook/bart-large-cnn", api_key=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_text2text_generation(self):
        model_type = "text2text-generation"
        interface = gr.Interface.load(
            "models/sshleifer/tiny-mbart", api_key=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_text_classification(self):
        model_type = "text-classification"
        interface = gr.Interface.load(
            "models/distilbert-base-uncased-finetuned-sst-2-english",
            api_key=None,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_fill_mask(self):
        model_type = "fill-mask"
        interface = gr.Interface.load(
            "models/bert-base-uncased", api_key=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_zero_shot_classification(self):
        model_type = "zero-shot-classification"
        interface = gr.Interface.load(
            "models/facebook/bart-large-mnli", api_key=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.input_components[1], gr.Textbox)
        assert isinstance(interface.input_components[2], gr.Checkbox)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_automatic_speech_recognition(self):
        model_type = "automatic-speech-recognition"
        interface = gr.Interface.load(
            "models/facebook/wav2vec2-base-960h", api_key=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Audio)
        assert isinstance(interface.output_components[0], gr.Textbox)

    def test_image_classification(self):
        model_type = "image-classification"
        interface = gr.Interface.load(
            "models/google/vit-base-patch16-224", api_key=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Image)
        assert isinstance(interface.output_components[0], gr.Label)

    def test_feature_extraction(self):
        model_type = "feature-extraction"
        interface = gr.Interface.load(
            "models/sentence-transformers/distilbert-base-nli-mean-tokens",
            api_key=None,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Dataframe)

    def test_sentence_similarity(self):
        model_type = "text-to-speech"
        interface = gr.Interface.load(
            "models/julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            api_key=None,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Audio)

    def test_text_to_speech(self):
        model_type = "text-to-speech"
        interface = gr.Interface.load(
            "models/julien-c/ljspeech_tts_train_tacotron2_raw_phn_tacotron_g2p_en_no_space_train",
            api_key=None,
            alias=model_type,
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Audio)

    def test_text_to_image(self):
        model_type = "text-to-image"
        interface = gr.Interface.load(
            "models/osanseviero/BigGAN-deep-128", api_key=None, alias=model_type
        )
        assert interface.__name__ == model_type
        assert isinstance(interface.input_components[0], gr.Textbox)
        assert isinstance(interface.output_components[0], gr.Image)

    def test_english_to_spanish(self):
        with pytest.warns(UserWarning):
            io = gr.Interface.load("spaces/abidlabs/english_to_spanish", title="hi")
        assert isinstance(io.input_components[0], gr.Textbox)
        assert isinstance(io.output_components[0], gr.Textbox)

    def test_sentiment_model(self):
        io = gr.Interface.load("models/distilbert-base-uncased-finetuned-sst-2-english")
        try:
            output = io("I am happy, I love you")
            assert json.load(open(output))["label"] == "POSITIVE"
        except TooManyRequestsError:
            pass

    def test_image_classification_model(self):
        io = gr.Blocks.load(name="models/google/vit-base-patch16-224")
        try:
            output = io("gradio/test_data/lion.jpg")
            assert json.load(open(output))["label"] == "lion"
        except TooManyRequestsError:
            pass

    def test_translation_model(self):
        io = gr.Blocks.load(name="models/t5-base")
        try:
            output = io("My name is Sarah and I live in London")
            assert output == "Mein Name ist Sarah und ich lebe in London"
        except TooManyRequestsError:
            pass

    def test_numerical_to_label_space(self):
        io = gr.Interface.load("spaces/abidlabs/titanic-survival")
        try:
            output = io("male", 77, 10)
            assert json.load(open(output))["label"] == "Perishes"
        except TooManyRequestsError:
            pass

    def test_speech_recognition_model(self):
        io = gr.Interface.load("models/facebook/wav2vec2-base-960h")
        try:
            output = io("gradio/test_data/test_audio.wav")
            assert output is not None
        except TooManyRequestsError:
            pass

    def test_text_to_image_model(self):
        io = gr.Interface.load("models/osanseviero/BigGAN-deep-128")
        try:
            filename = io("chest")
            assert filename.endswith(".jpg") or filename.endswith(".jpeg")
        except TooManyRequestsError:
            pass

    def test_private_space(self):
        api_key = "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"  # Intentionally revealing this key for testing purposes
        io = gr.Interface.load(
            "spaces/gradio-tests/not-actually-private-space", api_key=api_key
        )
        try:
            output = io("abc")
            assert output == "abc"
        except TooManyRequestsError:
            pass


class TestLoadInterfaceWithExamples:
    def test_interface_load_examples(self, tmp_path):
        test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        with patch("gradio.examples.CACHED_FOLDER", tmp_path):
            gr.Interface.load(
                name="models/google/vit-base-patch16-224",
                examples=[pathlib.Path(test_file_dir, "cheetah1.jpg")],
                cache_examples=False,
            )

    def test_interface_load_cache_examples(self, tmp_path):
        test_file_dir = pathlib.Path(pathlib.Path(__file__).parent, "test_files")
        with patch("gradio.examples.CACHED_FOLDER", tmp_path):
            gr.Interface.load(
                name="models/google/vit-base-patch16-224",
                examples=[pathlib.Path(test_file_dir, "cheetah1.jpg")],
                cache_examples=True,
            )

    def test_root_url(self):
        demo = gr.Interface.load("spaces/gradio/test-loading-examples")
        assert all(
            [
                c["props"]["root_url"]
                == "https://gradio-test-loading-examples.hf.space/"
                for c in demo.get_config_file()["components"]
            ]
        )

    def test_interface_with_examples(self):
        # This demo has the "fake_event" correctly removed
        demo = gr.Interface.load("spaces/freddyaboulton/calculator")
        assert demo(2, "add", 3) == 5

        # This demo still has the "fake_event". both should work
        demo = gr.Interface.load("spaces/abidlabs/test-calculator-2")
        assert demo(2, "add", 4) == 6


def test_get_tabular_examples_replaces_nan_with_str_nan():
    readme = """
        ---
        tags:
        - sklearn
        - skops
        - tabular-classification
        widget:
          structuredData:
            attribute_0:
            - material_7
            - material_7
            - material_7
            measurement_2:
            - 14.206
            - 15.094
            - .nan
        ---
    """
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.text = textwrap.dedent(readme)

    with patch("gradio.external.requests.get", return_value=mock_response):
        examples = get_tabular_examples("foo-model")
        assert examples["measurement_2"] == [14.206, 15.094, "NaN"]


def test_cols_to_rows():
    assert cols_to_rows({"a": [1, 2, "NaN"], "b": [1, "NaN", 3]}) == (
        ["a", "b"],
        [[1, 1], [2, "NaN"], ["NaN", 3]],
    )
    assert cols_to_rows({"a": [1, 2, "NaN", 4], "b": [1, "NaN", 3]}) == (
        ["a", "b"],
        [[1, 1], [2, "NaN"], ["NaN", 3], [4, "NaN"]],
    )
    assert cols_to_rows({"a": [1, 2, "NaN"], "b": [1, "NaN", 3, 5]}) == (
        ["a", "b"],
        [[1, 1], [2, "NaN"], ["NaN", 3], ["NaN", 5]],
    )
    assert cols_to_rows({"a": None, "b": [1, "NaN", 3, 5]}) == (
        ["a", "b"],
        [["NaN", 1], ["NaN", "NaN"], ["NaN", 3], ["NaN", 5]],
    )
    assert cols_to_rows({"a": None, "b": None}) == (["a", "b"], [])


def check_dataframe(config):
    input_df = next(
        c for c in config["components"] if c["props"].get("label", "") == "Input Rows"
    )
    assert input_df["props"]["headers"] == ["a", "b"]
    assert input_df["props"]["row_count"] == (1, "dynamic")
    assert input_df["props"]["col_count"] == (2, "fixed")


def check_dataset(config, readme_examples):
    # No Examples
    if not any(readme_examples.values()):
        assert not any([c for c in config["components"] if c["type"] == "dataset"])
    else:
        dataset = next(c for c in config["components"] if c["type"] == "dataset")
        assert dataset["props"]["samples"] == [
            [utils.delete_none(cols_to_rows(readme_examples)[1])]
        ]


@pytest.mark.parametrize(
    "hypothetical_readme",
    [
        {"a": [1, 2, "NaN"], "b": [1, "NaN", 3]},
        {"a": [1, 2, "NaN", 4], "b": [1, "NaN", 3]},
        {"a": [1, 2, "NaN"], "b": [1, "NaN", 3, 5]},
        {"a": None, "b": [1, "NaN", 3, 5]},
        {"a": None, "b": None},
    ],
)
def test_can_load_tabular_model_with_different_widget_data(hypothetical_readme):
    with patch(
        "gradio.external.get_tabular_examples", return_value=hypothetical_readme
    ):
        io = gr.Interface.load("models/scikit-learn/tabular-playground")
        check_dataframe(io.config)
        check_dataset(io.config, hypothetical_readme)


@pytest.mark.parametrize(
    "config, dependency, answer",
    [
        ({"version": "3.3", "enable_queue": True}, {"queue": True}, True),
        ({"version": "3.3", "enable_queue": False}, {"queue": None}, False),
        ({"version": "3.3", "enable_queue": True}, {"queue": None}, True),
        ({"version": "3.3", "enable_queue": True}, {"queue": False}, False),
        ({"enable_queue": True}, {"queue": False}, False),
        ({"version": "3.2", "enable_queue": False}, {"queue": None}, False),
        ({"version": "3.2", "enable_queue": True}, {"queue": None}, True),
        ({"version": "3.2", "enable_queue": True}, {"queue": False}, False),
        ({"version": "3.1.3", "enable_queue": True}, {"queue": None}, False),
        ({"version": "3.1.3", "enable_queue": False}, {"queue": True}, False),
    ],
)
def test_use_websocket_after_315(config, dependency, answer):
    assert use_websocket(config, dependency) == answer


class AsyncMock(MagicMock):
    async def __call__(self, *args, **kwargs):
        return super(AsyncMock, self).__call__(*args, **kwargs)


@pytest.mark.asyncio
async def test_get_pred_from_ws():
    mock_ws = AsyncMock(name="ws")
    messages = [
        json.dumps({"msg": "estimation"}),
        json.dumps({"msg": "send_data"}),
        json.dumps({"msg": "process_generating"}),
        json.dumps({"msg": "process_completed", "output": {"data": ["result!"]}}),
    ]
    mock_ws.recv.side_effect = messages
    data = json.dumps({"data": ["foo"], "fn_index": "foo"})
    hash_data = json.dumps({"session_hash": "daslskdf", "fn_index": "foo"})
    output = await get_pred_from_ws(mock_ws, data, hash_data)
    assert output == {"data": ["result!"]}
    mock_ws.send.assert_called_once_with(data)


@pytest.mark.asyncio
async def test_get_pred_from_ws_raises_if_queue_full():
    mock_ws = AsyncMock(name="ws")
    messages = [json.dumps({"msg": "queue_full"})]
    mock_ws.recv.side_effect = messages
    data = json.dumps({"data": ["foo"], "fn_index": "foo"})
    hash_data = json.dumps({"session_hash": "daslskdf", "fn_index": "foo"})
    with pytest.raises(gradio.Error, match="Queue is full!"):
        await get_pred_from_ws(mock_ws, data, hash_data)


@pytest.mark.skipif(
    sys.version_info < (3, 8),
    reason="Mocks of async context manager don't work for 3.7",
)
def test_respect_queue_when_load_from_config():
    with patch("websockets.connect"):
        with patch(
            "gradio.external_utils.get_pred_from_ws", return_value={"data": ["foo"]}
        ):
            interface = gr.Interface.load("spaces/freddyaboulton/saymyname")
            assert interface("bob") == "foo"


def test_raise_value_error_when_api_name_invalid():
    with pytest.raises(InvalidApiName):
        demo = gr.Blocks.load(name="spaces/gradio/hello_world")
        demo("freddy", api_name="route does not exist")


def test_use_api_name_in_call_method():
    # Interface
    demo = gr.Blocks.load(name="spaces/gradio/hello_world")
    assert demo("freddy", api_name="predict") == "Hello freddy!"

    # Blocks demo with multiple functions
    app = gr.Blocks.load(name="spaces/gradio/multiple-api-name-test")
    assert app(15, api_name="minus_one") == 14
    assert app(4, api_name="double") == 8
