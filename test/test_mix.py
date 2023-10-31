import gradio as gr
from gradio import mix
from gradio.external import TooManyRequestsError

"""
WARNING: Some of these tests have an external dependency: namely that Hugging Face's Hub and Space APIs do not change, and they keep their most famous models up.
So if, e.g. Spaces is down, then these test will not pass.
"""


class TestSeries:
    def test_in_interface(self):
        io1 = gr.Interface(lambda x: f"{x} World", "textbox", gr.Textbox())
        io2 = gr.Interface(lambda x: f"{x}!", "textbox", gr.Textbox())
        series = mix.Series(io1, io2)
        assert series("Hello") == "Hello World!"

    def test_with_external(self):
        io1 = gr.load("spaces/gradio-tests/image-identity-newv4-sse")
        io2 = gr.load("spaces/gradio-tests/image-classifier-newv4-sse")
        series = mix.Series(io1, io2)
        try:
            assert series("gradio/test_data/lion.jpg")["label"] == "lion"
        except TooManyRequestsError:
            pass


class TestParallel:
    def test_in_interface(self):
        io1 = gr.Interface(lambda x: f"{x} World 1!", "textbox", gr.Textbox())
        io2 = gr.Interface(lambda x: f"{x} World 2!", "textbox", gr.Textbox())
        parallel = mix.Parallel(io1, io2)
        assert parallel("Hello") == ["Hello World 1!", "Hello World 2!"]

    def test_multiple_return_in_interface(self):
        io1 = gr.Interface(
            lambda x: (x, x + x), "textbox", [gr.Textbox(), gr.Textbox()]
        )
        io2 = gr.Interface(lambda x: f"{x} World 2!", "textbox", gr.Textbox())
        parallel = mix.Parallel(io1, io2)
        assert parallel("Hello") == [
            "Hello",
            "HelloHello",
            "Hello World 2!",
        ]

    def test_with_external(self):
        io1 = gr.load("spaces/gradio-tests/english_to_spanishv4-sse")
        io2 = gr.load("spaces/gradio-tests/english2germanv4-sse")
        parallel = mix.Parallel(io1, io2)
        try:
            hello_es, hello_de = parallel("Hello")
            assert "hola" in hello_es.lower()
            assert "hallo" in hello_de.lower()
        except TooManyRequestsError:
            pass
