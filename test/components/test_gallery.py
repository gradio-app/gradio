from pathlib import Path

import numpy as np
import PIL

import gradio as gr
from gradio.data_classes import FileData


class TestGallery:
    def test_postprocess(self):
        url = "https://huggingface.co/Norod78/SDXL-VintageMagStyle-Lora/resolve/main/Examples/00015-20230906102032-7778-Wonderwoman VintageMagStyle   _lora_SDXL-VintageMagStyle-Lora_1_, Very detailed, clean, high quality, sharp image.jpg"
        gallery = gr.Gallery([url])
        assert gallery.get_config()["value"] == [
            {
                "image": {
                    "path": url,
                    "orig_name": "00015-20230906102032-7778-Wonderwoman VintageMagStyle   _lora_SDXL-VintageMagStyle-Lora_1_, Very detailed, clean, high quality, sharp image.jpg",
                    "mime_type": None,
                    "size": None,
                    "url": url,
                    "is_stream": False,
                    "meta": {"_type": "gradio.FileData"},
                },
                "caption": None,
            }
        ]

    def test_gallery(self):
        gallery = gr.Gallery()
        Path(Path(__file__).parent, "test_files")

        postprocessed_gallery = gallery.postprocess(
            [
                (str(Path("test/test_files/foo.png")), "foo_caption"),
                (Path("test/test_files/bar.png"), "bar_caption"),
                str(Path("test/test_files/baz.png")),
                Path("test/test_files/qux.png"),
            ]
        ).model_dump()

        # Using str(Path(...)) to ensure that the test passes on all platforms
        assert postprocessed_gallery == [
            {
                "image": {
                    "path": str(Path("test") / "test_files" / "foo.png"),
                    "orig_name": "foo.png",
                    "mime_type": None,
                    "size": None,
                    "url": None,
                    "is_stream": False,
                    "meta": {"_type": "gradio.FileData"},
                },
                "caption": "foo_caption",
            },
            {
                "image": {
                    "path": str(Path("test") / "test_files" / "bar.png"),
                    "orig_name": "bar.png",
                    "mime_type": None,
                    "size": None,
                    "url": None,
                    "is_stream": False,
                    "meta": {"_type": "gradio.FileData"},
                },
                "caption": "bar_caption",
            },
            {
                "image": {
                    "path": str(Path("test") / "test_files" / "baz.png"),
                    "orig_name": "baz.png",
                    "mime_type": None,
                    "size": None,
                    "url": None,
                    "is_stream": False,
                    "meta": {"_type": "gradio.FileData"},
                },
                "caption": None,
            },
            {
                "image": {
                    "path": str(Path("test") / "test_files" / "qux.png"),
                    "orig_name": "qux.png",
                    "mime_type": None,
                    "size": None,
                    "url": None,
                    "is_stream": False,
                    "meta": {"_type": "gradio.FileData"},
                },
                "caption": None,
            },
        ]

    def test_gallery_preprocess(self):
        from gradio.components.gallery import GalleryData, GalleryImage

        gallery = gr.Gallery()
        img = GalleryImage(image=FileData(path="test/test_files/bus.png"))
        data = GalleryData(root=[img])

        preprocess = gallery.preprocess(data)
        assert preprocess[0][0] == "test/test_files/bus.png"

        gallery = gr.Gallery(type="numpy")
        assert (
            gallery.preprocess(data)[0][0]
            == np.array(PIL.Image.open("test/test_files/bus.png"))
        ).all()

        gallery = gr.Gallery(type="pil")
        assert gallery.preprocess(data)[0][0] == PIL.Image.open(
            "test/test_files/bus.png"
        )

        img_captions = GalleryImage(
            image=FileData(path="test/test_files/bus.png"), caption="bus"
        )
        data = GalleryData(root=[img_captions])
        preprocess = gr.Gallery().preprocess(data)
        assert preprocess[0] == ("test/test_files/bus.png", "bus")

    def test_gallery_format(self):
        gallery = gr.Gallery(format="jpeg")
        output = gallery.postprocess(
            [np.random.randint(0, 255, (100, 100, 3), dtype=np.uint8)]
        )
        assert output.root[0].image.path.endswith(".jpeg")
