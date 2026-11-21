"""Image generation app modelled on trending text-to-image Spaces.

DiT-XL/2 (class-conditional diffusion transformer) -> 256px image, upscaled to
1024px so the output file is the size a typical image Space returns.
Executor is chosen with GRADIO_EXECUTOR; device with BENCH_DEVICE.
"""

import os
import sys
import time

if os.environ.get("BENCH_MLLIBS"):
    # torch/diffusers/transformers installed outside the Gradio environment
    sys.path.append(os.environ["BENCH_MLLIBS"])

import torch
from diffusers import DiTPipeline, DPMSolverMultistepScheduler
from PIL import Image

import gradio as gr

DEVICE = os.environ.get("BENCH_DEVICE", "mps")
DTYPE = torch.float16 if DEVICE == "mps" else torch.float32

pipe = DiTPipeline.from_pretrained("facebook/DiT-XL-2-256", torch_dtype=DTYPE)
pipe.scheduler = DPMSolverMultistepScheduler.from_config(pipe.scheduler.config)
pipe = pipe.to(DEVICE)
pipe.set_progress_bar_config(disable=True)

CLASSES = [
    "golden retriever",
    "tabby",
    "macaw",
    "volcano",
    "espresso",
    "lighthouse",
    "red panda",
    "sports car",
]


PALETTE = [
    (26, 28, 44),
    (93, 39, 93),
    (177, 62, 83),
    (239, 125, 87),
    (255, 205, 117),
    (167, 240, 112),
    (56, 183, 100),
    (37, 113, 121),
    (41, 54, 111),
    (59, 93, 201),
    (65, 166, 246),
    (115, 239, 247),
    (244, 244, 244),
    (148, 176, 194),
    (86, 108, 134),
    (51, 60, 87),
]


def pixel_art(image):
    """Palette quantisation written in plain Python, so it holds the GIL."""
    out = []
    for r, g, b in image.convert("RGB").getdata():
        best, best_d = None, 1 << 30
        for pr, pg, pb in PALETTE:
            d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
            if d < best_d:
                best, best_d = (pr, pg, pb), d
        out.append(best)
    result = Image.new("RGB", image.size)
    result.putdata(out)
    return result


def generate(subject, steps, guidance, seed):
    start = time.perf_counter()
    ids = pipe.get_label_ids([subject])
    image = pipe(
        class_labels=ids,
        num_inference_steps=int(steps),
        guidance_scale=float(guidance),
        generator=torch.manual_seed(int(seed)),
    ).images[0]
    if os.environ.get("BENCH_PIXEL"):
        image = pixel_art(image).resize((1024, 1024), Image.NEAREST)
    else:
        image = image.resize((1024, 1024), Image.LANCZOS)
    return image, round(time.perf_counter() - start, 4)


demo = gr.Interface(
    fn=generate,
    inputs=[
        gr.Dropdown(CLASSES, value=CLASSES[0], label="Subject"),
        gr.Slider(4, 50, value=20, step=1, label="Steps"),
        gr.Slider(1, 10, value=4, step=0.5, label="Guidance scale"),
        gr.Number(value=0, precision=0, label="Seed"),
    ],
    outputs=[gr.Image(label="Result"), gr.Number(label="Function seconds")],
    title="DiT image generator",
    api_name="generate",
)

if __name__ == "__main__":
    demo.launch(server_port=int(os.environ["BENCH_PORT"]), inbrowser=False)
