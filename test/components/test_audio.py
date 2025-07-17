import filecmp
from copy import deepcopy
from difflib import SequenceMatcher
from pathlib import Path

import numpy as np
import pytest
from gradio_client import media_data
from gradio_client import utils as client_utils

import gradio as gr
from gradio import processing_utils, utils
from gradio.data_classes import FileData


class TestAudio:
    @pytest.mark.asyncio
    async def test_component_functions(self, gradio_temp_dir):
        """
        Preprocess, postprocess serialize, get_config, deserialize
        type: filepath, numpy, file
        """
        x_wav = FileData(path=media_data.BASE64_AUDIO["path"])
        audio_input = gr.Audio()
        output1 = audio_input.preprocess(x_wav)
        assert isinstance(output1, tuple)
        assert output1[0] == 8000
        assert output1[1].shape == (8046,)

        x_wav = await processing_utils.async_move_files_to_cache([x_wav], audio_input)
        x_wav = x_wav[0]
        audio_input = gr.Audio(type="filepath")
        output1 = audio_input.preprocess(x_wav)
        assert isinstance(output1, str)
        assert Path(output1).name.endswith("audio_sample.wav")

        audio_input = gr.Audio(label="Upload Your Audio")
        assert audio_input.get_config() == {
            "autoplay": False,
            "sources": ["upload", "microphone"],
            "name": "audio",
            "show_download_button": None,
            "show_share_button": False,
            "streaming": False,
            "show_label": True,
            "label": "Upload Your Audio",
            "container": True,
            "editable": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "type": "numpy",
            "format": None,
            "recording": False,
            "streamable": False,
            "max_length": None,
            "min_length": None,
            "waveform_options": {
                "sample_rate": 44100,
                "show_controls": False,
                "show_recording_waveform": True,
                "skip_length": 5,
                "waveform_color": None,
                "waveform_progress_color": None,
                "trim_region_color": None,
            },
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "loop": False,
        }
        assert audio_input.preprocess(None) is None

        audio_input = gr.Audio(type="filepath")
        assert isinstance(audio_input.preprocess(x_wav), str)
        with pytest.raises(ValueError):
            gr.Audio(type="unknown")  # type: ignore

        rng = np.random.default_rng()
        # Confirm Audio can be instantiated with a numpy array
        gr.Audio((100, rng.random(size=(1000, 2))), label="Play your audio")

        # Output functionalities
        y_audio = client_utils.decode_base64_to_file(
            deepcopy(media_data.BASE64_AUDIO)["data"]
        )
        audio_output = gr.Audio(type="filepath")
        assert filecmp.cmp(
            y_audio.name,
            audio_output.postprocess(y_audio.name).model_dump()["path"],  # type: ignore
        )
        assert audio_output.get_config() == {
            "autoplay": False,
            "name": "audio",
            "show_download_button": None,
            "show_share_button": False,
            "streaming": False,
            "show_label": True,
            "label": None,
            "max_length": None,
            "min_length": None,
            "container": True,
            "editable": True,
            "min_width": 160,
            "recording": False,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "type": "filepath",
            "format": None,
            "streamable": False,
            "sources": ["upload", "microphone"],
            "waveform_options": {
                "sample_rate": 44100,
                "show_controls": False,
                "show_recording_waveform": True,
                "skip_length": 5,
                "waveform_color": None,
                "waveform_progress_color": None,
                "trim_region_color": None,
            },
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "loop": False,
        }

        output1 = audio_output.postprocess(y_audio.name).model_dump()  # type: ignore
        output2 = audio_output.postprocess(Path(y_audio.name)).model_dump()  # type: ignore
        assert output1 == output2

    def test_default_value_postprocess(self):
        x_wav = deepcopy(media_data.BASE64_AUDIO)
        audio = gr.Audio(value=x_wav["path"])
        assert utils.is_in_or_equal(audio.value["path"], audio.GRADIO_CACHE)

    def test_in_interface(self):
        def reverse_audio(audio):
            sr, data = audio
            return (sr, np.flipud(data))

        iface = gr.Interface(reverse_audio, "audio", "audio")
        reversed_file = iface("test/test_files/audio_sample.wav")
        reversed_reversed_file = iface(reversed_file)
        reversed_reversed_data = client_utils.encode_url_or_file_to_base64(
            reversed_reversed_file
        )
        similarity = SequenceMatcher(
            a=reversed_reversed_data, b=media_data.BASE64_AUDIO["data"]
        ).ratio()
        assert similarity > 0.99

    def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def generate_noise(duration):
            return 48000, np.random.randint(-256, 256, (duration, 3)).astype(np.int16)

        iface = gr.Interface(generate_noise, "slider", "audio")
        assert iface(100).endswith(".wav")

    def test_prepost_process_to_mp3(self, gradio_temp_dir):
        x_wav = FileData(
            path=processing_utils.save_base64_to_cache(
                media_data.BASE64_MICROPHONE["data"], cache_dir=gradio_temp_dir
            )
        )
        audio_input = gr.Audio(type="filepath", format="mp3")
        output = audio_input.preprocess(x_wav)
        assert isinstance(output, str)
        assert output.endswith("mp3")
        output = audio_input.postprocess(
            (48000, np.random.randint(-256, 256, (5, 3)).astype(np.int16))
        ).model_dump()  # type: ignore
        assert output["path"].endswith("mp3")

    def test_postprocess_http_url_like(self):
        audio = gr.Audio()
        output = audio.postprocess("https://test.com/test.mp3?token=123")
        assert isinstance(output, FileData) and output.path.endswith(
            "test.mp3?token=123"
        )

    @pytest.mark.asyncio
    async def test_combine_stream_audio(self, gradio_temp_dir):
        x_wav = FileData(
            path=processing_utils.save_base64_to_cache(
                media_data.BASE64_MICROPHONE["data"], cache_dir=gradio_temp_dir
            )
        )
        bytes_output = [Path(x_wav.path).read_bytes()] * 2
        output = await gr.Audio().combine_stream(
            bytes_output, desired_output_format="wav"
        )
        assert str(output.path).endswith("wav")

        output = await gr.Audio().combine_stream(
            bytes_output, desired_output_format=None
        )
        assert str(output.path).endswith("mp3")
