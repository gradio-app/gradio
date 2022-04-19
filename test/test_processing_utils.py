import os
import tempfile
import unittest
from copy import deepcopy

import matplotlib.pyplot as plt
import numpy as np
from PIL import Image

import gradio as gr
from gradio.test_data import media_data

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
            "https://raw.githubusercontent.com/gradio-app/gradio/master/test"
            "/test_data/test_image.png"
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
        temp_file = gr.processing_utils.create_tmp_copy_of_file("test.txt")
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


if __name__ == "__main__":
    unittest.main()
