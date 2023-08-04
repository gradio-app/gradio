from gradio_client import documentation


class TestDocumentation:
    def test_website_documentation(self):
        docs = documentation.generate_documentation()
        assert len(docs) > 0
