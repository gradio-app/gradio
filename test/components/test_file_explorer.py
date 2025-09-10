from pathlib import Path
from unittest.mock import patch

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

        # Create test files
        (test_path / "image1.png").touch()
        (test_path / "image2.jpg").touch()
        (test_path / "image3.jpeg").touch()
        (test_path / "document.txt").touch()
        (test_path / "script.py").touch()
        (test_path / "data.json").touch()
        (test_path / "styles.css").touch()

        # Test with list of globs - images and text files
        file_explorer = gr.FileExplorer(
            glob=["*.png", "*.jpg", "*.jpeg", "*.txt"], root_dir=Path(tmpdir)
        )
        tree = file_explorer.ls(["test_dir"])

        # Should include only files matching the patterns
        valid_files = [f for f in tree if f["type"] == "file" and f["valid"]]
        valid_names = {f["name"] for f in valid_files}
        assert valid_names == {
            "image1.png",
            "image2.jpg",
            "image3.jpeg",
            "document.txt",
        }

        # Files not matching should not be valid
        invalid_files = [f for f in tree if f["type"] == "file" and not f["valid"]]
        assert len(invalid_files) == 0  # Non-matching files are not shown at all

    def test_file_explorer_glob_backward_compatibility(self, tmpdir):
        """Test that single glob string still works (backward compatibility)"""
        tmpdir.mkdir("compat")
        compat_path = Path(tmpdir) / "compat"

        (compat_path / "file1.txt").touch()
        (compat_path / "file2.log").touch()
        (compat_path / "file3.txt").touch()

        # Test with single glob string (existing behavior)
        file_explorer = gr.FileExplorer(glob="*.txt", root_dir=Path(tmpdir))
        tree = file_explorer.ls(["compat"])

        valid_files = [f for f in tree if f["type"] == "file" and f["valid"]]
        valid_names = {f["name"] for f in valid_files}
        assert valid_names == {"file1.txt", "file3.txt"}

    def test_file_explorer_handles_permission_error(self, tmpdir):
        """Test that FileExplorer handles PermissionError gracefully"""
        file_explorer = gr.FileExplorer(root_dir=Path(tmpdir))

        # Mock os.listdir to raise PermissionError
        with patch(
            "os.listdir", side_effect=PermissionError("[WinError 5] Access denied")
        ):
            result = file_explorer.ls(["some_dir"])
            # Should return empty list instead of crashing
            assert result == []

        # Mock os.path.isdir to raise PermissionError for specific items
        tmpdir.mkdir("test_perms")
        test_path = Path(tmpdir) / "test_perms"
        (test_path / "accessible_file.txt").touch()
        (test_path / "restricted_file.txt").touch()

        def mock_isdir(path):
            if "restricted" in path:
                raise PermissionError("Access denied")
            return Path(path).is_dir()

        with patch("os.path.isdir", side_effect=mock_isdir):
            result = file_explorer.ls(["test_perms"])
            # Should only include accessible file, skipping the one that raises PermissionError
            file_names = {f["name"] for f in result if f["type"] == "file"}
            assert "accessible_file.txt" in file_names
            assert "restricted_file.txt" not in file_names
