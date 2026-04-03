import os

import gradio as gr

_cl = os.environ.get("GRADIO_CONCURRENCY_LIMIT", "1")
concurrency_limit = None if _cl == "none" else int(_cl)
_max_threads = int(os.environ.get("GRADIO_MAX_THREADS", 40))


async def generate_image(audio):
    return audio


demo = gr.Interface(
    fn=generate_image,
    inputs=gr.Image(),
    outputs=gr.Image(),
    concurrency_limit=concurrency_limit,
)

if __name__ == "__main__":
    demo.launch(max_threads=_max_threads)
