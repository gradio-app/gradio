import unittest
import pathlib
import gradio as gr
from PIL import Image
import matplotlib.pyplot as plt
import numpy as np

class ImagePreprocessing(unittest.TestCase):
    def test_decode_base64_to_image(self):
        output_image = gr.processing_utils.decode_base64_to_image(
            gr.test_data.BASE64_IMAGE)
        self.assertIsInstance(output_image, Image.Image)

    def test_encode_url_or_file_to_base64(self):
        output_base64 = gr.processing_utils.encode_url_or_file_to_base64(
            "test/images/test_image.png")
        self.assertEquals(output_base64, gr.test_data.BASE64_IMAGE)

    def test_encode_file_to_base64(self):
        output_base64 = gr.processing_utils.encode_file_to_base64(
            "test/images/test_image.png")
        self.assertEquals(output_base64, gr.test_data.BASE64_IMAGE)

    def test_encode_url_to_base64(self):
        output_base64 = gr.processing_utils.encode_url_to_base64(
            "https://raw.githubusercontent.com/gradio-app/gradio/master/test"
            "/images/test_image.png")
        self.assertEqual(output_base64, gr.test_data.BASE64_IMAGE)

    # def test_encode_plot_to_base64(self):  # Commented out because this is throwing errors on Windows. Possibly due to different matplotlib behavior on Windows?
    #     plt.plot([1, 2, 3, 4])
    #     output_base64 = gr.processing_utils.encode_plot_to_base64(plt)
    #     self.assertEqual(output_base64, gr.test_data.BASE64_PLT_IMG)

    def test_encode_array_to_base64(self):
        img = Image.open("test/images/test_image.png")
        img = img.convert("RGB")
        numpy_data = np.asarray(img, dtype=np.uint8)
        output_base64 = gr.processing_utils.encode_array_to_base64(numpy_data)
        # self.assertEqual(output_base64, gr.test_data.BASE64_IMAGE)

class OutputPreprocessing(unittest.TestCase):

    float_dtype_list = [float, float, np.double, np.single, np.float32,
                        np.float64, 'float32', 'float64']
    def test_float_conversion_dtype(self):
        """Test any convertion from a float dtype to an other."""

        x = np.array([-1, 1])
        # Test all combinations of dtypes conversions
        dtype_combin = np.array(np.meshgrid(
            OutputPreprocessing.float_dtype_list,
                                            OutputPreprocessing.float_dtype_list)).T.reshape(-1, 2)

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

if __name__ == '__main__':
    unittest.main()
