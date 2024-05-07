from typing import cast

import numpy as np
import PIL
import pytest
from gradio_client import media_data
from gradio_client import utils as client_utils

import gradio as gr
from gradio.data_classes import FileData


class TestImage:
    def test_component_functions(self, gradio_temp_dir):
        """
        Preprocess, postprocess, serialize, get_config, _segment_by_slic
        type: pil, file, filepath, numpy
        """

        img = FileData(path="test/test_files/bus.png")
        image_input = gr.Image()

        image_input = gr.Image(type="filepath")
        image_temp_filepath = image_input.preprocess(img)
        assert image_temp_filepath in [
            str(f) for f in gradio_temp_dir.glob("**/*") if f.is_file()
        ]

        image_input = gr.Image(type="pil", label="Upload Your Image")
        assert image_input.get_config() == {
            "image_mode": "RGB",
            "sources": ["upload", "webcam", "clipboard"],
            "name": "image",
            "show_share_button": False,
            "show_download_button": True,
            "streaming": False,
            "show_label": True,
            "label": "Upload Your Image",
            "container": True,
            "min_width": 160,
            "scale": None,
            "height": None,
            "width": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "format": "webp",
            "proxy_url": None,
            "mirror_webcam": True,
            "_selectable": False,
            "key": None,
            "streamable": False,
            "type": "pil",
        }
        assert image_input.preprocess(None) is None
        image_input = gr.Image()
        assert image_input.preprocess(img) is not None
        image_input.preprocess(img)
        file_image = gr.Image(type="filepath")
        assert isinstance(file_image.preprocess(img), str)
        with pytest.raises(ValueError):
            gr.Image(type="unknown")

        string_source = gr.Image(sources="upload")
        assert string_source.sources == ["upload"]
        # Output functionalities
        image_output = gr.Image(type="pil")
        processed_image = image_output.postprocess(
            PIL.Image.open(img.path)
        ).model_dump()
        assert processed_image is not None
        if processed_image is not None:
            processed = PIL.Image.open(cast(dict, processed_image).get("path", ""))
            source = PIL.Image.open(img.path)
            assert processed.size == source.size

    def test_in_interface_as_output(self):
        """
        Interface, process
        """

        def generate_noise(height, width):
            return np.random.randint(0, 256, (height, width, 3))

        iface = gr.Interface(generate_noise, ["slider", "slider"], "image")
        assert iface(10, 20).endswith(".webp")

    def test_static(self):
        """
        postprocess
        """
        component = gr.Image("test/test_files/bus.png")
        value = component.get_config().get("value")
        base64 = client_utils.encode_file_to_base64(value["path"])
        assert base64 == media_data.BASE64_IMAGE
        component = gr.Image(None)
        assert component.get_config().get("value") is None

    def test_images_upright_after_preprocess(self):
        component = gr.Image(type="pil")
        file_path = "test/test_files/rotated_image.jpeg"
        im = PIL.Image.open(file_path)
        assert im.getexif().get(274) != 1
        image = component.preprocess(FileData(path=file_path))
        assert image == PIL.ImageOps.exif_transpose(im)

    def test_image_format_parameter(self):
        component = gr.Image(type="filepath", format="jpeg")
        file_path = "test/test_files/bus.png"
        image = component.postprocess(file_path)
        assert image.path.endswith("png")
        image = component.postprocess(
            np.random.randint(0, 256, (100, 100, 3), dtype=np.uint8)
        )
        assert image.path.endswith("jpeg")

        image_pre = component.preprocess(FileData(path=file_path))
        assert image_pre.endswith("webp")

        image_pre = component.preprocess(
            FileData(path="test/test_files/cheetah1.jpg", orig_name="cheetah1.jpg")
        )
        assert image_pre.endswith("jpeg")
