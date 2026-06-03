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

    @pytest.mark.parametrize(
        "payload",
        [
            ["/etc/passwd"],  # absolute segment drops the root_dir prefix
            ["..", "..", "etc", "passwd"],  # `..` climbs out of root_dir
        ],
    )
    def test_preprocess_prevents_path_traversal(self, tmpdir, payload):
        # preprocess() must reject out-of-root paths the same way ls() does,
        # otherwise an attacker-controlled path reaches the developer callback
        # (GHSA-qqr5-x4m8-g4gq).
        single = gr.FileExplorer(root_dir=Path(tmpdir), file_count="single")
        with pytest.raises(InvalidPathError):
            single.preprocess(FileExplorerData(root=[payload]))

        multiple = gr.FileExplorer(root_dir=Path(tmpdir), file_count="multiple")
        with pytest.raises(InvalidPathError):
            multiple.preprocess(FileExplorerData(root=[payload]))

    def test_preprocess_allows_in_root_paths(self, tmpdir):
        # A legitimate selection inside root_dir still resolves correctly.
        (Path(tmpdir) / "sub").mkdir()
        (Path(tmpdir) / "sub" / "ok.txt").touch()

        file_explorer = gr.FileExplorer(root_dir=Path(tmpdir), file_count="single")
        result = file_explorer.preprocess(FileExplorerData(root=[["sub", "ok.txt"]]))
        assert isinstance(result, str)
        assert Path(result) == Path(tmpdir) / "sub" / "ok.txt"
