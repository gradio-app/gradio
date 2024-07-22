import pytest
from gradio_client import media_data

import gradio as gr
from gradio.data_classes import FileData, ListFiles


class TestUploadButton:
    def test_component_functions(self):
        """
        preprocess
        """
        x_file = FileData(path=media_data.BASE64_FILE["path"])
        upload_input = gr.UploadButton()
        input = upload_input.preprocess(x_file)
        assert isinstance(input, str)

        input1 = upload_input.preprocess(x_file)
        input2 = upload_input.preprocess(x_file)
        assert input1 == input1.name  # type: ignore # Testing backwards compatibility
        assert input1 == input2

    def test_raises_if_file_types_is_not_list(self):
        with pytest.raises(
            ValueError, match="Parameter file_types must be a list. Received int"
        ):
            gr.UploadButton(file_types=2)  # type: ignore

    def test_preprocess_with_multiple_files(self):
        file_data = FileData(path=media_data.BASE64_FILE["path"])
        list_file_data = ListFiles(root=[file_data, file_data])
        upload_input = gr.UploadButton(file_count="directory")
        output = upload_input.preprocess(list_file_data)
        assert isinstance(output, list)
        assert isinstance(output[0], str)
