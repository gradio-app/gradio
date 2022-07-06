import unittest

import gradio as gr


class TestDocumentatino(unittest.TestCase):
    def test_documentation(self):
        documentation = gr.documentation.generate_documentation()
        assert len(documentation) > 0


if __name__ == "__main__":
    unittest.main()
