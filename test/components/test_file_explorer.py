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

    def test_file_explorer_with_glob_list(self, tmpdir):
        """Test that FileExplorer accepts a list of glob patterns"""
        tmpdir.mkdir("test_dir")
        test_path = Path(tmpdir) / "test_dir"

        (test_path / "image1.png").touch()
        (test_path / "image2.jpg").touch()
        (test_path / "image3.jpeg").touch()
        (test_path / "document.txt").touch()
        (test_path / "script.py").touch()
        (test_path / "data.json").touch()
        (test_path / "styles.css").touch()

        file_explorer = gr.FileExplorer(
            glob=["*.png", "*.jpg", "*.jpeg", "*.txt"], root_dir=Path(tmpdir)
        )
        tree = file_explorer.ls(["test_dir"])

        valid_files = [f for f in tree if f["type"] == "file" and f["valid"]]
        valid_names = {f["name"] for f in valid_files}
        assert valid_names == {
            "image1.png",
            "image2.jpg",
            "image3.jpeg",
            "document.txt",
        }

        invalid_files = [f for f in tree if f["type"] == "file" and not f["valid"]]
        assert len(invalid_files) == 0

