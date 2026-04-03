import os

import time
import random
import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)
_max_threads = int(os.environ.get("GRADIO_MAX_THREADS", 40))


def generate_image(audio):
    time.sleep(random.random() * 5)
    return audio

print("DEMO CONCURRENCY_LIMMIT", concurrency_limit)
demo = gr.Interface(
    fn=generate_image,
    inputs=gr.Image(),
    outputs=gr.Image(),
    concurrency_limit=concurrency_limit,
)

if __name__ == "__main__":
    demo.launch(max_threads=_max_threads)
