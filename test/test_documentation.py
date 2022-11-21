import os
import sys

import pytest

import gradio as gr

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestDocumentation:
    @pytest.mark.skipif(
        sys.version_info < (3, 8),
        reason="Docs use features in inspect module not available in py 3.7",
    )
    def test_website_documentation(self):
        documentation = gr.documentation.generate_documentation()
        assert len(documentation) > 0
