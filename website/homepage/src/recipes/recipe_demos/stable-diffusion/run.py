# URL: https://huggingface.co/spaces/gradio/stable-diffusion
# DESCRIPTION: Note: This is a simplified version of the code needed to create the Stable Diffusion demo. See full code here: https://hf.co/spaces/stabilityai/stable-diffusion/tree/main
# imports
import gradio as gr
import torch
from torch import autocast
from diffusers import StableDiffusionPipeline
from datasets import load_dataset
from PIL import Image  
import re
import os

auth_token = os.getenv("auth_token")

# load the model
model_id = "CompVis/stable-diffusion-v1-4"
device = "cpu"
pipe = StableDiffusionPipeline.from_pretrained(model_id, use_auth_token=auth_token, revision="fp16", torch_dtype=torch.float16)
pipe = pipe.to(device)

# define the core function
def infer(prompt, samples, steps, scale, seed):        
    generator = torch.Generator(device=device).manual_seed(seed)
    images_list = pipe(
        [prompt] * samples,
        num_inference_steps=steps,
        guidance_scale=scale,
        generator=generator,
    )
    images = []
    safe_image = Image.open(r"unsafe.png")
    for i, image in enumerate(images_list["sample"]):
        if(images_list["nsfw_content_detected"][i]):
            images.append(safe_image)
        else:
            images.append(image)
    return images
    
# define a block
block = gr.Blocks()


# start the block
with block:
    # define the layout
    with gr.Group():
        with gr.Box():
            with gr.Row().style(mobile_collapse=False, equal_height=True):
                # define the input textbox
                text = gr.Textbox(
                    label="Enter your prompt",
                    show_label=False,
                    max_lines=1,
                    placeholder="Enter your prompt",
                ).style(
                    border=(True, False, True, True),
                    rounded=(True, False, False, True),
                    container=False,
                )
                # define the button
                btn = gr.Button("Generate image").style(
                    margin=False,
                    rounded=(False, True, True, False),
                )
        # define the output gallery
        gallery = gr.Gallery(
            label="Generated images", show_label=False, elem_id="gallery"
        ).style(grid=[2], height="auto")

        # define the advanced button
        advanced_button = gr.Button("Advanced options", elem_id="advanced-btn")

        # define the advanced section sliders
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

        # define what will happen when the buttons are selected
        text.submit(infer, inputs=[text, samples, steps, scale, seed], outputs=gallery)
        btn.click(infer, inputs=[text, samples, steps, scale, seed], outputs=gallery)
        advanced_button.click(
            None,
            [],
            text,
        )
        
# launch
block.launch()