import os
import sys
import unittest

import pytest

import gradio as gr

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestDocumentation(unittest.TestCase):
    @pytest.mark.skipif(
        sys.version_info < (3, 8),
        reason="Docs use features in inspect module not available in py 3.7",
    )
    def test_website_documentation(self):
        documentation = gr.documentation.generate_documentation()
        assert len(documentation) > 0

    def test_component_api_documentation(self):
        for cls in gr.components.IOComponent.__subclasses__():
            gr.documentation.document_component_api(cls, "input")
            gr.documentation.document_component_api(cls, "output")


if __name__ == "__main__":
    unittest.main()
