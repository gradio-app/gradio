"""Audio generation app — exercises file caching and downloading on output."""

import os

import numpy as np

import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)
_max_threads = int(os.environ.get("GRADIO_MAX_THREADS", 40))


def generate_audio(audio):
    # CPU-bound work that holds the GIL (~300-500ms)
    a = np.random.rand(1500, 1500)
    b = np.random.rand(1500, 1500)
    _ = a @ b
    return audio


demo = gr.Interface(
    fn=generate_audio,
    inputs=gr.Audio(),
    outputs=gr.Audio(),
    concurrency_limit=concurrency_limit,
)

if __name__ == "__main__":
    demo.launch(max_threads=_max_threads)
