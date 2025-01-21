import gradio as gr
from gradio.components.image_editor import EditorData, EditorValue
from gradio.data_classes import FileData


class TestImageEditor:
    def test_component_functions(self):
        test_image_path = "test/test_files/bus.png"
        image_data = FileData(path=test_image_path)
        image_editor_data = EditorData(
            background=image_data, layers=[image_data, image_data], composite=image_data
        )
        payload: EditorValue = {
            "background": test_image_path,
            "layers": [test_image_path, test_image_path],
            "composite": test_image_path,
        }

        image_editor_component = gr.ImageEditor()

        assert isinstance(image_editor_component.preprocess(image_editor_data), dict)
        assert image_editor_component.postprocess(payload) == image_editor_data

        # Test that ImageEditor can accept just a filepath as well
        simpler_data = EditorData(
            background=image_data, layers=[], composite=image_data
        )
        assert image_editor_component.postprocess(test_image_path) == simpler_data

        assert image_editor_component.get_config() == {
            "value": None,
            "height": None,
            "width": None,
            "image_mode": "RGBA",
            "sources": ("upload", "webcam", "clipboard"),
            "type": "numpy",
            "label": None,
            "show_label": True,
            "show_download_button": True,
            "container": True,
            "scale": None,
            "min_width": 160,
            "interactive": None,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "mirror_webcam": True,
            "show_share_button": False,
            "_selectable": False,
            "key": None,
            "transforms": ("crop",),
            "eraser": {"default_size": "auto"},
            "brush": {
                "default_size": "auto",
                "colors": [
                    "rgb(204, 50, 50)",
                    "rgb(173, 204, 50)",
                    "rgb(50, 204, 112)",
                    "rgb(50, 112, 204)",
                    "rgb(173, 50, 204)",
                ],
                "default_color": "auto",
                "color_mode": "defaults",
            },
            "proxy_url": None,
            "name": "imageeditor",
            "server_fns": ["accept_blobs"],
            "format": "webp",
            "layers": True,
            "canvas_size": None,
            "placeholder": None,
            "show_fullscreen_button": True,
            "fixed_canvas": False,
        }

    def test_image_editor_sets_canvas_size_as_crop_size(self):
        image_editor = gr.ImageEditor(crop_size=(300, 300))
        assert image_editor.get_config()["canvas_size"] == (300, 300)

        image_editor = gr.ImageEditor(crop_size="4:3")
        assert image_editor.get_config()["canvas_size"] == (1066, 800)

        image_editor = gr.ImageEditor(crop_size="3:4")
        assert image_editor.get_config()["canvas_size"] == (800, 1066)

    def test_process_example(self):
        test_image_path = "test/test_files/bus.png"
        image_editor = gr.ImageEditor()
        example_value = image_editor.process_example(test_image_path)
        assert isinstance(example_value, EditorData)
        assert example_value.background and example_value.background.path
