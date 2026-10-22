"""Adapt unchanged repository demo functions to the experimental Server executor."""

import ast
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import gradio as gr

app = gr.App()
DEMOS = {
    "greet": "hello_world",
    "calculator": "calculator",
    "sepia": "sepia_filter",
    "reverse_audio": "reverse_audio",
    "slow_echo": "chatinterface_streaming_echo",
}


@app.resource()
def demo_functions():
    # Execute imports and function definitions verbatim, without constructing or
    # launching the original demo UIs. No modifications to the function bodies.
    functions = {}
    for name, folder in DEMOS.items():
        path = Path(__file__).resolve().parents[1] / folder / "run.py"
        tree = ast.parse(path.read_text(), filename=str(path))
        tree.body = [
            node
            for node in tree.body
            if isinstance(node, (ast.Import, ast.ImportFrom, ast.FunctionDef))
        ]
        namespace = {"__name__": folder}
        exec(compile(tree, str(path), "exec"), namespace)  # noqa: S102 -- trusted repository demos
        functions[name] = namespace[name]
    return functions


@app.queue()
def greet(name: str) -> str:
    return demo_functions()["greet"](name)


@app.queue()
def calculator(num1: float, operation: str, num2: float) -> float:
    return demo_functions()["calculator"](num1, operation, num2)


@app.queue()
def sepia(image: Any) -> Any:
    return demo_functions()["sepia"](image)


@app.queue()
def reverse_audio(audio: Any) -> Any:
    return demo_functions()["reverse_audio"](audio)


@app.queue(stream_every=0)
def slow_echo(message: str, history: list) -> Iterator[str]:
    yield from demo_functions()["slow_echo"](message, history)


# Existing Server.api execution provides the HTTP baseline on the same server.
app.api(greet, name="greet_thread")
app.api(calculator, name="calculator_thread")

if __name__ == "__main__":
    app.launch(server_port=7871, ssr_mode=False)
