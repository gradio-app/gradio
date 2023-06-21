import os
import tempfile
from unittest.mock import MagicMock, patch

import pytest

import gradio as gr
from gradio import flagging

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestDefaultFlagging:
    def test_default_flagging_callback(self):
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(lambda x: x, "text", "text", flagging_dir=tmpdirname)
            io.launch(prevent_thread_lock=True)
            row_count = io.flagging_callback.flag(["test", "test"])
            assert row_count == 1  # 2 rows written including header
            row_count = io.flagging_callback.flag(["test", "test"])
            assert row_count == 2  # 3 rows written including header
        io.close()


class TestSimpleFlagging:
    def test_simple_csv_flagging_callback(self):
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(
                lambda x: x,
                "text",
                "text",
                flagging_dir=tmpdirname,
                flagging_callback=flagging.SimpleCSVLogger(),
            )
            io.launch(prevent_thread_lock=True)
            row_count = io.flagging_callback.flag(["test", "test"])
            assert row_count == 0  # no header in SimpleCSVLogger
            row_count = io.flagging_callback.flag(["test", "test"])
            assert row_count == 1  # no header in SimpleCSVLogger
        io.close()


class TestHuggingFaceDatasetSaver:
    @patch(
        "huggingface_hub.create_repo",
        return_value=MagicMock(repo_id="gradio-tests/test"),
    )
    @patch("huggingface_hub.hf_hub_download")
    def test_saver_setup(self, mock_download, mock_create):
        flagger = flagging.HuggingFaceDatasetSaver("test_token", "test")
        with tempfile.TemporaryDirectory() as tmpdirname:
            flagger.setup([gr.Audio, gr.Textbox], tmpdirname)
        mock_create.assert_called_once()
        mock_download.assert_called()

    @patch(
        "huggingface_hub.create_repo",
        return_value=MagicMock(repo_id="gradio-tests/test"),
    )
    @patch("huggingface_hub.hf_hub_download")
    @patch("huggingface_hub.upload_folder")
    @patch("huggingface_hub.upload_file")
    def test_saver_flag_same_dir(
        self, mock_upload_file, mock_upload, mock_download, mock_create
    ):
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(
                lambda x: x,
                "text",
                "text",
                flagging_dir=tmpdirname,
                flagging_callback=flagging.HuggingFaceDatasetSaver("test", "test"),
            )
            row_count = io.flagging_callback.flag(["test", "test"], "")
            assert row_count == 1  # 2 rows written including header
            row_count = io.flagging_callback.flag(["test", "test"])
            assert row_count == 2  # 3 rows written including header
            for _, _, filenames in os.walk(tmpdirname):
                for f in filenames:
                    fname = os.path.basename(f)
                    assert fname in ["data.csv", "dataset_info.json"] or fname.endswith(
                        ".lock"
                    )

    @patch(
        "huggingface_hub.create_repo",
        return_value=MagicMock(repo_id="gradio-tests/test"),
    )
    @patch("huggingface_hub.hf_hub_download")
    @patch("huggingface_hub.upload_folder")
    @patch("huggingface_hub.upload_file")
    def test_saver_flag_separate_dirs(
        self, mock_upload_file, mock_upload, mock_download, mock_create
    ):
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(
                lambda x: x,
                "text",
                "text",
                flagging_dir=tmpdirname,
                flagging_callback=flagging.HuggingFaceDatasetSaver(
                    "test", "test", separate_dirs=True
                ),
            )
            row_count = io.flagging_callback.flag(["test", "test"], "")
            assert row_count == 1  # 2 rows written including header
            row_count = io.flagging_callback.flag(["test", "test"])
            assert row_count == 2  # 3 rows written including header
            for _, _, filenames in os.walk(tmpdirname):
                for f in filenames:
                    fname = os.path.basename(f)
                    assert fname in [
                        "metadata.jsonl",
                        "dataset_info.json",
                    ] or fname.endswith(".lock")


class TestDisableFlagging:
    def test_flagging_no_permission_error_with_flagging_disabled(self):
        tmpdirname = tempfile.mkdtemp()
        os.chmod(tmpdirname, 0o444)  # Make directory read-only
        nonwritable_path = os.path.join(tmpdirname, "flagging_dir")
        io = gr.Interface(
            lambda x: x,
            "text",
            "text",
            allow_flagging="never",
            flagging_dir=nonwritable_path,
        )
        io.launch(prevent_thread_lock=True)
        io.close()


class TestInterfaceSetsUpFlagging:
    @pytest.mark.parametrize(
        "allow_flagging, called",
        [
            ("manual", True),
            ("auto", True),
            ("never", False),
        ],
    )
    def test_flag_method_init_called(self, allow_flagging, called):
        flagging.FlagMethod.__init__ = MagicMock()
        flagging.FlagMethod.__init__.return_value = None
        gr.Interface(lambda x: x, "text", "text", allow_flagging=allow_flagging)
        assert flagging.FlagMethod.__init__.called == called

    @pytest.mark.parametrize(
        "options, processed_options",
        [
            (None, [("Flag", "")]),
            (["yes", "no"], [("Flag as yes", "yes"), ("Flag as no", "no")]),
            ([("abc", "de"), ("123", "45")], [("abc", "de"), ("123", "45")]),
        ],
    )
    def test_flagging_options_processed_correctly(self, options, processed_options):
        io = gr.Interface(lambda x: x, "text", "text", flagging_options=options)
        assert io.flagging_options == processed_options
