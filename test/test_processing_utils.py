import os
import pathlib
import shutil
import tempfile
import unittest
from copy import deepcopy
from unittest.mock import patch

import ffmpy
import matplotlib.pyplot as plt
import numpy as np
import pytest
from PIL import Image

import gradio as gr
from gradio import media_data

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class ImagePreprocessing(unittest.TestCase):
    def test_decode_base64_to_image(self):
        output_image = gr.processing_utils.decode_base64_to_image(
            deepcopy(media_data.BASE64_IMAGE)
        )
        self.assertIsInstance(output_image, Image.Image)

    def test_encode_url_or_file_to_base64(self):
        output_base64 = gr.processing_utils.encode_url_or_file_to_base64(
            "gradio/test_data/test_image.png"
        )
        self.assertEquals(output_base64, deepcopy(media_data.BASE64_IMAGE))

    def test_encode_file_to_base64(self):
        output_base64 = gr.processing_utils.encode_file_to_base64(
            "gradio/test_data/test_image.png"
        )
        self.assertEquals(output_base64, deepcopy(media_data.BASE64_IMAGE))

    def test_encode_url_to_base64(self):
        output_base64 = gr.processing_utils.encode_url_to_base64(
            "https://raw.githubusercontent.com/gradio-app/gradio/main/gradio/test_data/test_image.png"
        )
        self.assertEqual(output_base64, deepcopy(media_data.BASE64_IMAGE))

    def test_encode_plot_to_base64(self):
        plt.plot([1, 2, 3, 4])
        output_base64 = gr.processing_utils.encode_plot_to_base64(plt)
        self.assertTrue(
            output_base64.startswith("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAo")
        )

    def test_encode_array_to_base64(self):
        img = Image.open("gradio/test_data/test_image.png")
        img = img.convert("RGB")
        numpy_data = np.asarray(img, dtype=np.uint8)
        output_base64 = gr.processing_utils.encode_array_to_base64(numpy_data)
        self.assertEqual(output_base64, deepcopy(media_data.ARRAY_TO_BASE64_IMAGE))

    def test_encode_pil_to_base64(self):
        img = Image.open("gradio/test_data/test_image.png")
        img = img.convert("RGB")
        img.info = {}  # Strip metadata
        output_base64 = gr.processing_utils.encode_pil_to_base64(img)
        self.assertEqual(output_base64, deepcopy(media_data.ARRAY_TO_BASE64_IMAGE))

    def test_encode_pil_to_base64_keeps_pnginfo(self):
        input_img = Image.open("gradio/test_data/test_image.png")
        input_img = input_img.convert("RGB")
        input_img.info = {"key1": "value1", "key2": "value2"}

        encoded_image = gr.processing_utils.encode_pil_to_base64(input_img)
        decoded_image = gr.processing_utils.decode_base64_to_image(encoded_image)

        self.assertEqual(decoded_image.info, input_img.info)

    def test_resize_and_crop(self):
        img = Image.open("gradio/test_data/test_image.png")
        new_img = gr.processing_utils.resize_and_crop(img, (20, 20))
        self.assertEqual(new_img.size, (20, 20))
        self.assertRaises(
            ValueError,
            gr.processing_utils.resize_and_crop,
            **{"img": img, "size": (20, 20), "crop_type": "test"}
        )


class AudioPreprocessing(unittest.TestCase):
    def test_audio_from_file(self):
        audio = gr.processing_utils.audio_from_file("gradio/test_data/test_audio.wav")
        self.assertEqual(audio[0], 22050)
        self.assertIsInstance(audio[1], np.ndarray)

    def test_audio_to_file(self):
        audio = gr.processing_utils.audio_from_file("gradio/test_data/test_audio.wav")
        gr.processing_utils.audio_to_file(audio[0], audio[1], "test_audio_to_file")
        self.assertTrue(os.path.exists("test_audio_to_file"))
        os.remove("test_audio_to_file")


class OutputPreprocessing(unittest.TestCase):
    def test_decode_base64_to_binary(self):
        binary = gr.processing_utils.decode_base64_to_binary(
            deepcopy(media_data.BASE64_IMAGE)
        )
        self.assertEqual(deepcopy(media_data.BINARY_IMAGE), binary)

    def test_decode_base64_to_file(self):
        temp_file = gr.processing_utils.decode_base64_to_file(
            deepcopy(media_data.BASE64_IMAGE)
        )
        self.assertIsInstance(temp_file, tempfile._TemporaryFileWrapper)

    def test_create_tmp_copy_of_file(self):
        f = tempfile.NamedTemporaryFile(delete=False)
        temp_file = gr.processing_utils.create_tmp_copy_of_file(f.name)
        self.assertIsInstance(temp_file, tempfile._TemporaryFileWrapper)

    float_dtype_list = [
        float,
        float,
        np.double,
        np.single,
        np.float32,
        np.float64,
        "float32",
        "float64",
    ]

    def test_float_conversion_dtype(self):
        """Test any convertion from a float dtype to an other."""

        x = np.array([-1, 1])
        # Test all combinations of dtypes conversions
        dtype_combin = np.array(
            np.meshgrid(
                OutputPreprocessing.float_dtype_list,
                OutputPreprocessing.float_dtype_list,
            )
        ).T.reshape(-1, 2)

        for dtype_in, dtype_out in dtype_combin:
            x = x.astype(dtype_in)
            y = gr.processing_utils._convert(x, dtype_out)
            assert y.dtype == np.dtype(dtype_out)

    def test_subclass_conversion(self):
        """Check subclass conversion behavior"""
        x = np.array([-1, 1])
        for dtype in OutputPreprocessing.float_dtype_list:
            x = x.astype(dtype)
            y = gr.processing_utils._convert(x, np.floating)
            assert y.dtype == x.dtype


def test_video_has_playable_codecs(test_file_dir):
    assert gr.processing_utils.video_is_playable(
        str(test_file_dir / "video_sample.mp4")
    )
    assert gr.processing_utils.video_is_playable(
        str(test_file_dir / "video_sample.ogg")
    )
    assert gr.processing_utils.video_is_playable(
        str(test_file_dir / "video_sample.webm")
    )
    assert not gr.processing_utils.video_is_playable(
        str(test_file_dir / "bad_video_sample.mp4")
    )


def raise_ffmpy_runtime_exception(*args, **kwargs):
    raise ffmpy.FFRuntimeError("", "", "", "")


@pytest.mark.parametrize(
    "exception_to_raise", [raise_ffmpy_runtime_exception, KeyError(), IndexError()]
)
def test_video_has_playable_codecs_catches_exceptions(
    exception_to_raise, test_file_dir
):
    with patch("ffmpy.FFprobe.run", side_effect=exception_to_raise):
        with tempfile.NamedTemporaryFile(suffix="out.avi") as tmp_not_playable_vid:
            shutil.copy(
                str(test_file_dir / "bad_video_sample.mp4"), tmp_not_playable_vid.name
            )
            assert gr.processing_utils.video_is_playable(tmp_not_playable_vid.name)


def test_convert_video_to_playable_mp4(test_file_dir):
    with tempfile.NamedTemporaryFile(suffix="out.avi") as tmp_not_playable_vid:
        shutil.copy(
            str(test_file_dir / "bad_video_sample.mp4"), tmp_not_playable_vid.name
        )
        playable_vid = gr.processing_utils.convert_video_to_playable_mp4(
            tmp_not_playable_vid.name
        )
        assert gr.processing_utils.video_is_playable(playable_vid)


@patch("ffmpy.FFmpeg.run", side_effect=raise_ffmpy_runtime_exception)
def test_video_conversion_returns_original_video_if_fails(mock_run, test_file_dir):
    with tempfile.NamedTemporaryFile(suffix="out.avi") as tmp_not_playable_vid:
        shutil.copy(
            str(test_file_dir / "bad_video_sample.mp4"), tmp_not_playable_vid.name
        )
        playable_vid = gr.processing_utils.convert_video_to_playable_mp4(
            tmp_not_playable_vid.name
        )
        # If the conversion succeeded it'd be .mp4
        assert pathlib.Path(playable_vid).suffix == ".avi"


if __name__ == "__main__":
    unittest.main()
