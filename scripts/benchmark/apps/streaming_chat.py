"""Streaming chat app — tests streaming + diff computation."""

import os
import time

import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)


def echo_stream(message, history):
    response = f"Echo: {message}"
    # Yield in 5 chunks to keep streaming realistic but fast
    chunk_size = max(1, len(response) // 5)
    for i in range(0, len(response), chunk_size):
        time.sleep(0.005)
        yield response[: i + chunk_size]


demo = gr.ChatInterface(fn=echo_stream, concurrency_limit=concurrency_limit)

if __name__ == "__main__":
    demo.launch()
