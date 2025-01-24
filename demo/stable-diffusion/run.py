import gradio as gr
import torch
from diffusers import StableDiffusionPipeline  # type: ignore
from PIL import Image
import os

auth_token = os.getenv("HUGGING_FACE_ACCESS_TOKEN")
if not auth_token:
    print(
        "ERROR: No Hugging Face access token found.\n"
        "Please define an environment variable 'auth_token' before running.\n"
        "Example:\n"
        "  export HUGGING_FACE_ACCESS_TOKEN=XXXXXXXX\n"
    )

model_id = "CompVis/stable-diffusion-v1-4"
device = "cpu"
pipe = StableDiffusionPipeline.from_pretrained(
    model_id, token=auth_token, variant="fp16", torch_dtype=torch.float16,
)
pipe = pipe.to(device)


def infer(prompt, samples, steps, scale, seed):
    generator = torch.Generator(device=device).manual_seed(seed)
    images_list = pipe(  # type: ignore
        [prompt] * samples,
        num_inference_steps=steps,
        guidance_scale=scale,
        generator=generator,
    )
    images = []
    safe_image = Image.open(r"unsafe.png")
    for i, image in enumerate(images_list["sample"]):  # type: ignore
        if images_list["nsfw_content_detected"][i]:  # type: ignore
            images.append(safe_image)
        else:
            images.append(image)
    return images


block = gr.Blocks()

with block:
    with gr.Group():
        with gr.Row():
            text = gr.Textbox(
                label="Enter your prompt",
                max_lines=1,
                placeholder="Enter your prompt",
                container=False,
            )
            btn = gr.Button("Generate image")
        gallery = gr.Gallery(
            label="Generated images",
            show_label=False,
            elem_id="gallery",
            columns=[2],
        )

        advanced_button = gr.Button("Advanced options", elem_id="advanced-btn")

        with gr.Row(elem_id="advanced-options"):
            samples = gr.Slider(label="Images", minimum=1, maximum=4, value=4, step=1)
            steps = gr.Slider(label="Steps", minimum=1, maximum=50, value=45, step=1)
            scale = gr.Slider(
                label="Guidance Scale", minimum=0, maximum=50, value=7.5, step=0.1
            )
            seed = gr.Slider(
                label="Seed",
                minimum=0,
                maximum=2147483647,
                step=1,
                randomize=True,
            )
        gr.on(
            [text.submit, btn.click],
            infer,
            inputs=[text, samples, steps, scale, seed],
            outputs=gallery,
        )
        advanced_button.click(
            None,
            [],
            text,
        )

block.launch()
