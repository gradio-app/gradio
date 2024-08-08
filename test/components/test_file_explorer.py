from pathlib import Path

import pytest

import gradio as gr
from gradio.components.file_explorer import FileExplorerData
from gradio.exceptions import InvalidPathError


class TestFileExplorer:
    def test_component_functions(self):
        """
        Preprocess, get_config
        """
        file_explorer = gr.FileExplorer(file_count="single")

        config = file_explorer.get_config()
        assert config["glob"] == "**/*"
        assert config["value"] is None
        assert config["file_count"] == "single"
        assert config["server_fns"] == ["ls"]

        input_data = FileExplorerData(root=[["test/test_files/bus.png"]])
        preprocessed_data = file_explorer.preprocess(input_data)
        assert isinstance(preprocessed_data, str)
        assert Path(preprocessed_data).name == "bus.png"

        input_data = FileExplorerData(root=[])
        preprocessed_data = file_explorer.preprocess(input_data)
        assert preprocessed_data is None

        file_explorer = gr.FileExplorer(file_count="multiple")

        config = file_explorer.get_config()
        assert config["glob"] == "**/*"
        assert config["value"] is None
        assert config["file_count"] == "multiple"
        assert config["server_fns"] == ["ls"]

        input_data = FileExplorerData(root=[["test/test_files/bus.png"]])
        preprocessed_data = file_explorer.preprocess(input_data)
        assert isinstance(preprocessed_data, list)
        assert Path(preprocessed_data[0]).name == "bus.png"

        input_data = FileExplorerData(root=[])
        preprocessed_data = file_explorer.preprocess(input_data)
        assert preprocessed_data == []

    def test_file_explorer_txt_only_glob(self, tmpdir):
        tmpdir.mkdir("foo")
        (Path(tmpdir) / "foo" / "bar").mkdir()
        (Path(tmpdir) / "foo" / "file.txt").touch()
        (Path(tmpdir) / "foo" / "file2.txt").touch()
        (Path(tmpdir) / "foo" / "file3.log").touch()
        (Path(tmpdir) / "foo" / "img.png").touch()
        (Path(tmpdir) / "foo" / "bar" / "bar.txt").touch()

        file_explorer = gr.FileExplorer(glob="*.txt", root_dir=Path(tmpdir))
        tree = file_explorer.ls(["foo"])

        answer = [
            {"name": "bar", "type": "folder", "valid": False},
            {"name": "file.txt", "type": "file", "valid": True},
            {"name": "file2.txt", "type": "file", "valid": True},
        ]
        assert tree == answer

    def test_file_explorer_prevents_path_traversal(self, tmpdir):
        file_explorer = gr.FileExplorer(glob="*.txt", root_dir=Path(tmpdir))

        with pytest.raises(InvalidPathError):
            file_explorer.ls(["../file.txt"])
