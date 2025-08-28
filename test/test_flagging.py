import os
import pathlib
import tempfile
from unittest.mock import MagicMock

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

    def test_files_saved_as_file_paths(self):
        image = {"path": str(pathlib.Path(__file__).parent / "test_files" / "bus.png")}
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(
                lambda x: x,
                "image",
                "image",
                flagging_dir=tmpdirname,
                flagging_mode="auto",
            )
            io.launch(prevent_thread_lock=True)
            io.flagging_callback.flag([image, image])
            io.close()
            with open(os.path.join(tmpdirname, "dataset1.csv")) as f:
                flagged_data = f.readlines()[1].split(",")[0]
                assert flagged_data.endswith("bus.png")
        io.close()

    def test_flagging_does_not_create_unnecessary_directories(self):
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(lambda x: x, "text", "text", flagging_dir=tmpdirname)
            io.launch(prevent_thread_lock=True)
            io.flagging_callback.flag(["test", "test"])
            assert os.listdir(tmpdirname) == ["dataset1.csv"]


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


class TestDisableFlagging:
    def test_flagging_no_permission_error_with_flagging_disabled(self):
        tmpdirname = tempfile.mkdtemp()
        os.chmod(tmpdirname, 0o444)  # Make directory read-only
        nonwritable_path = os.path.join(tmpdirname, "flagging_dir")
        io = gr.Interface(
            lambda x: x,
            "text",
            "text",
            flagging_mode="never",
            flagging_dir=nonwritable_path,
        )
        io.launch(prevent_thread_lock=True)
        io.close()


class TestInterfaceSetsUpFlagging:
    @pytest.mark.parametrize(
        "flagging_mode, called",
        [
            ("manual", True),
            ("auto", True),
            ("never", False),
        ],
    )
    def test_flag_method_init_called(self, flagging_mode, called):
        flagging.FlagMethod.__init__ = MagicMock()  # type: ignore
        flagging.FlagMethod.__init__.return_value = None  # type: ignore
        gr.Interface(lambda x: x, "text", "text", flagging_mode=flagging_mode)
        assert flagging.FlagMethod.__init__.called == called  # type: ignore

    @pytest.mark.parametrize(
        "options, processed_options",
        [
            (None, [("Flag", None)]),
            (["yes", "no"], [("Flag as yes", "yes"), ("Flag as no", "no")]),
            ([("abc", "de"), ("123", "45")], [("abc", "de"), ("123", "45")]),
        ],
    )
    def test_flagging_options_processed_correctly(self, options, processed_options):
        io = gr.Interface(lambda x: x, "text", "text", flagging_options=options)
        assert io.flagging_options == processed_options
