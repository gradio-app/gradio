import os

from gradio_client import documentation

os.environ["GRADIO_ANALYTICS_ENABLED"] = "False"


class TestDocumentation:
    def test_website_documentation(self):
        docs = documentation.generate_documentation()
        assert len(docs) > 0
