import transformers

class TestLoadFromPipeline:
    def test_text_to_text_model_from_pipeline(self):
        pipe = transformers.pipeline(model="sshleifer/bart-tiny-random")
        output = pipe("My name is Sylvain and I work at Hugging Face in Brooklyn")
        self.assertIsNotNone(output)


