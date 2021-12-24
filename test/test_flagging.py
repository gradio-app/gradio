import gradio as gr
from gradio import flagging
import tempfile
import unittest
import unittest.mock as mock


class TestFlagging(unittest.TestCase):
    def test_default_flagging_handler(self):
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(lambda x: x, "text", "text", flagging_dir=tmpdirname)
            io.launch(prevent_thread_lock=True)
            row_count = io.flagging_callback.flag(io, ["test"], ["test"])
            self.assertEqual(row_count, 1)  # 2 rows written including header
            row_count = io.flagging_callback.flag(io, ["test"], ["test"])
            self.assertEqual(row_count, 2)  # 3 rows written including header
        io.close()

    def test_simple_csv_flagging_handler(self):
        with tempfile.TemporaryDirectory() as tmpdirname:
            io = gr.Interface(lambda x: x, "text", "text", flagging_dir=tmpdirname, flagging_callback=flagging.SimpleCSVLogger())
            io.launch(prevent_thread_lock=True)
            row_count = io.flagging_callback.flag(io, ["test"], ["test"])
            self.assertEqual(row_count, 0)  # no header
            row_count = io.flagging_callback.flag(io, ["test"], ["test"])
            self.assertEqual(row_count, 1)  # no header
        io.close()


if __name__ == '__main__':
    unittest.main()
