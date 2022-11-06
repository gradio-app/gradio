import os
import tempfile
from unittest.mock import MagicMock

import huggingface_hub

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
    def test_saver_setup(self):
        huggingface_hub.create_repo = MagicMock()
        huggingface_hub.Repository = MagicMock()
        flagger = flagging.HuggingFaceDatasetSaver("test", "test")
        with tempfile.TemporaryDirectory() as tmpdirname:
            flagger.setup([gr.Audio, gr.Textbox], tmpdirname)
        huggingface_hub.create_repo.assert_called_once()

    def test_saver_flag(self):
        huggingface_hub.create_repo = MagicMock()
        huggingface_hub.Repository = MagicMock()
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(
                lambda x: x,
                "text",
                "text",
                flagging_dir=tmpdirname,
                flagging_callback=flagging.HuggingFaceDatasetSaver("test", "test"),
            )
            os.mkdir(os.path.join(tmpdirname, "test"))
            io.launch(prevent_thread_lock=True)
            row_count = io.flagging_callback.flag(["test", "test"])
            assert row_count == 1  # 2 rows written including header
            row_count = io.flagging_callback.flag(["test", "test"])
            assert row_count == 2  # 3 rows written including header


class TestHuggingFaceDatasetJSONSaver:
    def test_saver_setup(self):
        huggingface_hub.create_repo = MagicMock()
        huggingface_hub.Repository = MagicMock()
        flagger = flagging.HuggingFaceDatasetJSONSaver("test", "test")
        with tempfile.TemporaryDirectory() as tmpdirname:
            flagger.setup([gr.Audio, gr.Textbox], tmpdirname)
        huggingface_hub.create_repo.assert_called_once()

    def test_saver_flag(self):
        huggingface_hub.create_repo = MagicMock()
        huggingface_hub.Repository = MagicMock()
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(
                lambda x: x,
                "text",
                "text",
                flagging_dir=tmpdirname,
                flagging_callback=flagging.HuggingFaceDatasetJSONSaver("test", "test"),
            )
            test_dir = os.path.join(tmpdirname, "test")
            os.mkdir(test_dir)
            io.launch(prevent_thread_lock=True)
            row_unique_name = io.flagging_callback.flag(["test", "test"])
            # Test existence of metadata.jsonl file for that example
            assert os.path.isfile(
                os.path.join(os.path.join(test_dir, row_unique_name), "metadata.jsonl")
            )


class TestDisableFlagging:
    def test_flagging_no_permission_error_with_flagging_disabled(self):
        with tempfile.TemporaryDirectory() as tmpdirname:
            os.chmod(tmpdirname, 0o444)  # Make directory read-only
            nonwritable_path = os.path.join(tmpdirname, "flagging_dir")

            io = gr.Interface(
                lambda x: x,
                "text",
                "text",
                allow_flagging="never",
                flagging_dir=nonwritable_path,
            )
            try:
                io.launch(prevent_thread_lock=True)
            except PermissionError:
                self.fail("launch() raised a PermissionError unexpectedly")

        io.close()
