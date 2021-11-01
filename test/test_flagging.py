import gradio as gr
import tempfile
import unittest
import unittest.mock as mock


class TestFlagging(unittest.TestCase):
    def test_num_rows_written(self):
        io = gr.Interface(lambda x: x, "text", "text")
        io.launch(prevent_thread_lock=True)
        with tempfile.TemporaryDirectory() as tmpdirname:
            row_count = io.flagging_handler.flag(["test"], ["test"], flag_path=tmpdirname)
            self.assertEquals(row_count, 1)  # 2 rows written including header
            row_count = io.flagging_handler.flag("test", "test", flag_path=tmpdirname)
            self.assertEquals(row_count, 2)  # 3 rows written including header
        io.close()



if __name__ == '__main__':
    unittest.main()
