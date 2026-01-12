from pathlib import Path

import gradio as gr


class TestModel3D:
    def test_component_functions(self):
        """
        get_config
        """
        model_component = gr.components.Model3D(None, label="Model")
        assert model_component.get_config() == {
            "value": None,
            "display_mode": None,
            "clear_color": [0, 0, 0, 0],
            "label": "Model",
            "show_label": True,
            "container": True,
            "scale": None,
            "min_width": 160,
            "visible": True,
            "elem_id": None,
            "elem_classes": [],
            "proxy_url": None,
            "interactive": None,
            "name": "model3d",
            "camera_position": [None, None, None],
            "height": None,
            "zoom_speed": 1,
            "pan_speed": 1,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "buttons": [],
        }

        file = "test/test_files/Box.gltf"
        output1 = model_component.postprocess(file)
        output2 = model_component.postprocess(Path(file))
        assert output1
        assert output2
        assert Path(output1.path).name == Path(output2.path).name

    def test_in_interface(self):
        """
        Interface, process
        """
        iface = gr.Interface(lambda x: x, "model3d", "model3d")
        input_data = "test/test_files/Box.gltf"
        output_data = iface(input_data)
        assert output_data.endswith(".gltf")
