from __future__ import annotations

from contextlib import contextmanager

import gradio as gr

from gradio_client import Client
from gradio_client.snippet import generate_code_snippets


@contextmanager
def connect(demo: gr.Blocks, **kwargs):
    _, local_url, _ = demo.launch(prevent_thread_lock=True, **kwargs)
    try:
        yield Client(local_url)
    finally:
        demo.close()


class TestSnippetExecution:
    def test_python_snippet_runs_for_simple_demo(self):
        def greet(name):
            return "Hello " + name + "!"

        demo = gr.Interface(
            fn=greet,
            inputs=gr.Textbox(label="Name"),
            outputs=gr.Textbox(label="Greeting"),
            api_name="greet",
        )

        with connect(demo) as client:
            api_info = client.view_api(print_info=False, return_format="dict")
            endpoint_info = api_info["named_endpoints"]["/greet"]
            snippets = generate_code_snippets("/greet", endpoint_info, client.src)

            python_snippet = snippets["python"]
            assert "client.predict(" in python_snippet
            assert 'api_name="/greet"' in python_snippet

            namespace = {}
            exec(python_snippet, namespace)
            assert namespace["result"] == "Hello Hello!!!"

    def test_python_snippet_runs_for_calculator(self):
        def calculator(num1, operation, num2):
            if operation == "add":
                return num1 + num2
            elif operation == "subtract":
                return num1 - num2
            elif operation == "multiply":
                return num1 * num2
            elif operation == "divide":
                return num1 / num2

        demo = gr.Interface(
            calculator,
            [
                "number",
                gr.Radio(["add", "subtract", "multiply", "divide"]),
                "number",
            ],
            "number",
            api_name="predict",
        )

        with connect(demo) as client:
            api_info = client.view_api(print_info=False, return_format="dict")
            endpoint_info = api_info["named_endpoints"]["/predict"]
            snippets = generate_code_snippets("/predict", endpoint_info, client.src)

            python_snippet = snippets["python"]
            namespace = {}
            exec(python_snippet, namespace)
            assert namespace["result"] == 6.0

    def test_python_snippet_runs_with_default_params(self):
        def add(a, b=10):
            return a + b

        demo = gr.Interface(
            add,
            [gr.Number(label="a"), gr.Number(label="b", value=10)],
            gr.Number(label="result"),
            api_name="add",
        )

        with connect(demo) as client:
            api_info = client.view_api(print_info=False, return_format="dict")
            endpoint_info = api_info["named_endpoints"]["/add"]
            snippets = generate_code_snippets("/add", endpoint_info, client.src)

            python_snippet = snippets["python"]
            namespace = {}
            exec(python_snippet, namespace)
            assert isinstance(namespace["result"], (int, float))
