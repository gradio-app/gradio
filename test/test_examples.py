import os
import unittest

from gradio import Interface, examples

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestProcessExamples(unittest.TestCase):
    def test_process_example(self):
        io = Interface(lambda x: "Hello " + x, "text", "text", examples=[["World"]])
        prediction = examples.process_example(io, 0)
        self.assertEquals(prediction[0], "Hello World")

    def test_caching(self):
        io = Interface(
            lambda x: "Hello " + x,
            "text",
            "text",
            examples=[["World"], ["Dunya"], ["Monde"]],
        )
        io.launch(prevent_thread_lock=True)
        examples.cache_interface_examples(io)
        prediction = examples.load_from_cache(io, 1)
        io.close()
        self.assertEquals(prediction[0], "Hello Dunya")


if __name__ == "__main__":
    unittest.main()
