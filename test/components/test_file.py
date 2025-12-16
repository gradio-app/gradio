import os
from pathlib import Path

import pytest

import gradio as gr
from gradio.data_classes import FileData, ListFiles


class TestFile:
    def test_component_functions(self, media_data):
        """
        Preprocess, serialize, get_config, value
        """
        x_file = FileData(path=media_data.BASE64_FILE["path"])
        file_input = gr.File()
        output = file_input.preprocess(x_file)
        assert isinstance(output, str)

        input1 = file_input.preprocess(x_file)
        input2 = file_input.preprocess(x_file)
        assert input1 == input1.name  # type: ignore # Testing backwards compatibility
        assert input1 == input2
        assert isinstance(input1, str)
        assert Path(input1).name == "sample_file.pdf"

        file_input = gr.File(label="Upload Your File")
        assert file_input.get_config() == {
            "file_count": "single",
            "file_types": None,
            "name": "file",
            "show_label": True,
            "label": "Upload Your File",
            "container": True,
            "min_width": 160,
            "scale": None,
            "elem_id": None,
            "elem_classes": [],
            "visible": True,
            "value": None,
            "interactive": None,
            "proxy_url": None,
            "_selectable": False,
            "key": None,
            "preserved_by_key": ["value"],
            "height": None,
            "type": "filepath",
            "allow_reordering": False,
            "buttons": [],
        }
        assert file_input.preprocess(None) is None
        assert file_input.preprocess(x_file) is not None

        zero_size_file = FileData(path="document.txt", size=0)
        temp_file = file_input.preprocess(zero_size_file)
        assert isinstance(temp_file, str)
        assert not Path(temp_file).exists()

        file_input = gr.File(type="binary")
        output = file_input.preprocess(x_file)
        assert isinstance(output, bytes)

        output1 = file_input.postprocess("test/test_files/sample_file.pdf")
        output2 = file_input.postprocess("test/test_files/sample_file.pdf")
        assert output1 == output2

    def test_preprocess_with_multiple_files(self, media_data):
        file_data = FileData(path=media_data.BASE64_FILE["path"])
        list_file_data = ListFiles(root=[file_data, file_data])
        file_input = gr.File(file_count="directory")
        output = file_input.preprocess(list_file_data)
        assert isinstance(output, list)
        assert isinstance(output[0], str)

    def test_file_type_must_be_list(self):
        with pytest.raises(
            ValueError, match="Parameter file_types must be a list. Received str"
        ):
            gr.File(file_types=".json")  # type: ignore

    def test_in_interface_as_input(self, media_data):
        """
        Interface, process
        """
        x_file = media_data.BASE64_FILE["path"]

        def get_size_of_file(file_obj):
            return os.path.getsize(file_obj.name)

        iface = gr.Interface(get_size_of_file, "file", "number")
        assert iface(x_file) == 10558

    def test_as_component_as_output(self):
        """
        Interface, process
        """

        def write_file(content):
            with open("test.txt", "w") as f:
                f.write(content)
            return "test.txt"

        iface = gr.Interface(write_file, "text", "file")
        assert iface("hello world").endswith(".txt")
